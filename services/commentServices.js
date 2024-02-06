const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { uuid } = require("uuidv4");

const ApiError = require("../utils/apiError");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

const Comment = require("../models/commentModel");

exports.setPostIdToBody = (req, res, next) => {
  if (!req.body.postId) req.body.postId = req.params.postId;
  next();
};

exports.setUserIdToBody = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.createFilterobj = (req, res, next) => {
  let filterObject = {};
  if (req.params.postId) filterObject = { postId: req.params.postId };
  req.filterObj = filterObject;
  next();
};

// Upload single image
exports.uploadCommentImage = uploadSingleImage("image");

// Image Procesing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const filename = `comment-${uuid()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .toFormat("jpeg")
      .jpeg({ quality: 98 })
      .toFile(`uploads/comments/${filename}`);

    //Save image into our db
    req.body.image = filename;
  }
  next();
});

// @desc    Create new comment
// @router  POST /api/v1/comments
// @access  public/protected
exports.createComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.create(req.body);
  res.status(201).json({ message: "comment created succssfully", comment });
});

// @desc    Get All comments
// @router  POST /api/v1/comments
// @access  public/protected
exports.getAllComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.find(req.filterObj);
  res.status(200).json({ data: comment });
});

// @desc    Get Specific comment
// @router  POST /api/v1/comments/:id
// @access  public/protected
exports.getOneComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return next(
      new ApiError(`comment not found for this id ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ data: comment });
});

// @desc    Update Specific comment
// @router  PUT /api/v1/comments/:id
// @access  private/protected
exports.updateComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!comment) {
    return next(
      new ApiError(`comment not found for this id ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ data: comment });
});

// @desc    Delete Specific comment
// @router  DELETE /api/v1/comments/:id
// @access  private/protected (admin and logged user(make comment, post owner) for his comment)
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findByIdAndDelete(req.params.id);
  if (!comment) {
    return next(
      new ApiError(`comment not found for this id ${req.params.id}`, 404)
    );
  }
  res.status(204).json({ data: "comment deleted success" });
});
