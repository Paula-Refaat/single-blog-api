const fs = require("fs");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const { uploadSingleImage } = require("../middleware/photoUpload");
const {
  cloudinaryRemoveImage,
  cloudinaryUploadImage,
} = require("../utils/cloudinary");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");

exports.uploadPostImageToServer = uploadSingleImage("image");

exports.setUserIdToBody = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user._id;
  next();
};
// @desc    Upload post image to cloudinary
exports.uploadPostImageTocloudinary = async (req, res, next) => {
  if (req.file) {
    const result = await cloudinaryUploadImage(req.file.path);
    req.body.image = {
      url: result.url,
      publicId: result.public_id,
    };
    fs.unlinkSync(req.file.path);
  }
  next();
};

// @desc    delete post image from cloudinary
exports.deletePostImagefromcloudinary = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new ApiError(`post not found for this id ${req.params.id}`));
  }
  await cloudinaryRemoveImage(post.image.publicId);
  next();
});

// @desc    Create new post
// @router  POST /api/v1/posts
// @access  public/protected
exports.createPost = asyncHandler(async (req, res, next) => {
  const post = await Post.create(req.body);
  res.status(201).json({ message: "Post created succssfully", post });
});

// @desc    Get All posts
// @router  Get /api/v1/posts
// @access  private(admin only)/protected
exports.getAllPosts = asyncHandler(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  const posts = await Post.find({}).limit(limit).skip(skip);

  res.status(200).json({ page: page, limit: limit, posts });
});

// @desc    Get All posts For Logged User
// @router  Get /api/v1/posts/myPosts
// @access  public(User)/protected
exports.getAllLoggedUserPosts = asyncHandler(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  const posts = await Post.findOne({ user: req.user._id })
    .limit(limit)
    .skip(skip);

  res.status(200).json({ page: page, limit: limit, posts });
});

// @desc    Get Specific post
// @router  Get /api/v1/posts/:id
// @access  public
exports.getOnePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new ApiError(`post not found for this id ${req.params.id}`));
  }
  res.status(200).json({ data: post });
});

// @desc    Update Specific post
// @router  PUT /api/v1/posts/:id
// @access  private/protected
exports.updatePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!post) {
    return next(new ApiError(`post not found for this id ${req.params.id}`));
  }
  res.status(200).json({ data: post });
});

// @desc    Delete Specific post
// @router  DELETE /api/v1/posts/:id
// @access  private/protected (admin and logged user for his post)
exports.deletePost = asyncHandler(async (req, res, next) => {
  let session = null;
  session = await mongoose.startSession();
  session.startTransaction();

  try {
    const post = await Post.findByIdAndDelete(req.params.id).session(session);
    if (!post) {
      return next(new ApiError(`post not found for this id ${req.params.id}`));
    }
    await Comment.deleteMany({ postId: post._id }).session(session);
    await session.commitTransaction();
    await session.endSession();
    res.status(204).send();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
});

// @desc    Make Like On Specific Sost
// @router  PUT /api/v1/posts/like/:id
// @access  public
exports.likePost = asyncHandler(async (req, res, next) => {
  let message = "";
  let post = await Post.findById(req.params.id);
  if (!post) {
    return next(new ApiError(`post not found for this id ${req.params.id}`));
  }
  const isUserLikedOnPostBefore = post.likes.find(
    (user) => user._id.toString() === req.user._id.toString()
  );

  if (isUserLikedOnPostBefore) {
    post = await Post.findByIdAndUpdate(
      req.params.id,
      { $pull: { likes: req.user._id } },
      { new: true }
    );
    message = "You have successfully unliked the post";
  } else {
    post = await Post.findByIdAndUpdate(
      req.params.id,
      { $push: { likes: req.user._id } },
      { new: true }
    );
    message = "You have successfully liked the post";
  }
  res.status(200).json({ message, likes: post.likes });
});
