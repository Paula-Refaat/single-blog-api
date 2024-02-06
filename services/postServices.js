const fs = require("fs");
const mongoose = require("mongoose");
const { uuid } = require("uuidv4");
const asyncHandler = require("express-async-handler");

const factory = require("./handllerFactory");
const ApiError = require("../utils/ApiError");
const { uploadArrayOfImages } = require("../middlewares/uploadImageMiddleware");

const Post = require("../models/postModel");
const Comment = require("../models/commentModel");

// Upload single image
exports.uploadPostImage = uploadArrayOfImages(["images"]);

// Image Procesing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.files) {
    const directoryPath = "uploads/posts";

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }
    req.body.images = [];
    await Promise.all(
      req.files.map(async (img, index) => {
        const imageName = `post-${uuid()}-${Date.now()}-${index + 1}.jpeg`;
        const imagePath = `uploads/posts/${imageName}`;

        // Save image into our db (or any other logic you need)
        req.body.images.push(imageName);

        // Copy the buffer to the desired location (e.g., uploads/posts)
        fs.writeFileSync(imagePath, img.buffer);
      })
    );
  }
  next();
});

// @desc    Create new post
// @router  POST /api/v1/posts
// @access  public/protected
exports.createPost = factory.createOne(Post);

// @desc    Get All posts
// @router  Get /api/v1/posts
// @access  Public
exports.getAllPosts = factory.getAll(Post, "Post");

// @desc    Get Specific post
// @router  Get /api/v1/posts/:id
// @access  public
exports.getOnePost = factory.getOne(Post, "comments");

// @desc    Update Specific post
// @router  PUT /api/v1/posts/:id
// @access  private/protected
exports.updatePost = factory.updateOne(Post);

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

// @desc    Make Like/disLike On Specific Post
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
