const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { uuid } = require("uuidv4");

const factory = require("./handllerFactory");
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
exports.createComment = factory.createOne(Comment);

// @desc    Get All comments
// @router  POST /api/v1/comments
// @access  public/protected
exports.getAllComment = factory.getAll(Comment);

// @desc    Get Specific comment
// @router  POST /api/v1/comments/:id
// @access  public/protected
exports.getOneComment = factory.getOne(Comment);

// @desc    Update Specific comment
// @router  PUT /api/v1/comments/:id
// @access  private/protected
exports.updateComment = factory.updateOne(Comment);

// @desc    Delete Specific comment
// @router  DELETE /api/v1/comments/:id
// @access  private/protected (admin and logged user(make comment, post owner) for his comment)
exports.deleteComment = factory.deleteOne(Comment);
