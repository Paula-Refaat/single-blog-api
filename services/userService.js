const fs = require("fs");
const asyncHandler = require("express-async-handler");
const { hashSync } = require("bcryptjs");
const ApiError = require("../utils/ApiError");
const createToken = require("../utils/createToken");
const UserAuthorization = require("../utils/UserAuthorization");
const {
  cloudinaryRemoveImage,
  cloudinaryUploadImage,
} = require("../utils/cloudinary");
const User = require("../models/userModel");

const { uploadSingleImage } = require("../middleware/photoUpload");

// Upload single image
exports.uploadUserImage = uploadSingleImage("image");

// @desc    Get all user Profile
// @router  GET /api/v1/users
// @access  private(admin only)
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json(users);
});

// @desc    Get Logged user
// @router  GET /api/v1/users/getMe
// @access  public
exports.getLoggedUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("posts");
  if (!user) {
    return next(new ApiError(`user not found`, 404));
  }
  res.status(200).json(user);
});

// @desc    Update Logged user password
// @route   put /api/v1/users/updateMyPassword
// @access  Private/protected
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: hashSync(req.body.newPassword),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );
  const token = createToken(user._id);
  res.status(200).json({ date: user, token });
});

// @desc    Update Logged user date (without password, role)
// @route   put /api/v1/users/updateMe
// @access  Private/protected
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      slug: req.body.slug,
    },
    { new: true }
  );

  res.status(200).json({ date: updatedUser });
});

// @desc    Deactivate Logged user
// @route   DELETE /api/v1/users/deActiveMe
// @access  Private/protected
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({ status: "success" });
});

// @desc    Activate Logged user
// @route   DELETE /api/v1/users/activeMe
// @access  Private/protected
exports.activeLoggedUserData = asyncHandler(async (req, res, next) => {
  const userAuthorization = new UserAuthorization();

  const token = userAuthorization.getToken(req.headers.authorization);
  const decoded = userAuthorization.tokenVerifcation(token);
  const currentUser = await userAuthorization.checkCurrentUserExist(decoded);
  if (currentUser.active) {
    return next(new ApiError("Your Account is already active", 400));
  }
  await User.findByIdAndUpdate(currentUser._id, { active: true });

  res.status(200).json({ data: "Your account has been activated" });
});

// @desc    Profile Photo Upload
// @router  POST /api/v1/users/profile/profile-photo-upload
// @access  private (only loged in user)
exports.profilePhotoUpload = asyncHandler(async (req, res, next) => {
  // 1. Validation
  if (!req.file) {
    return next(new ApiError("no file provided", 400));
  }
  console.log(req.file);
  const result = await cloudinaryUploadImage(req.file.path);

  const user = await User.findById(req.user._id);

  if (user.profilePhoto.publicId !== null) {
    await cloudinaryRemoveImage(user.profilePhoto.publicId);
  }
  user.profilePhoto = {
    url: result.secure_url,
    publicId: result.public_id,
  };
  await user.save();

  res.status(200).json({
    message: "Your profile updated succssfully",
    url: result.secure_url,
    publicId: result.public_id,
  });

  fs.unlinkSync(req.file.path);
});

//@TODO
///////////////////////////////////////////////////////////////////////////////////

// @desc   Delete User Profile (Account)
// @router  POST /api/v1/users/profile/:id
// @access  private (only admin or user him self)
exports.deleteUserProfile = asyncHandler(async (req, res) => {
  // 1. Get the user from DB
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }
  //@TODO 2. Get all posts from DB
  //@TODO 3. Get the public ids from the posts
  //@TODO 4. Delete all posts image from cloudinary that belong to this user

  // 5. Delete the profile picture from cloudinary
  await cloudinaryRemoveImage(user.profilePhoto.publicId);

  //@TODO 6. Delete user posts & comments

  // 7. Delete the user him self
  await User.findByIdAndDelete(req.params.id);
  // 8. Send a response to the client
  res.status(200).json({ message: "your profile has been deleted" });
});
