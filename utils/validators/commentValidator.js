const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const Post = require("../../models/postModel");
const Comment = require("../../models/commentModel");

exports.createCommentValidator = [
  check("postId")
    .isMongoId()
    .withMessage("invalid postId formate")
    .notEmpty()
    .withMessage("postId required")
    .custom((val, { req }) =>
      Post.findById(val).then((post) => {
        if (!post) {
          return Promise.reject(
            new Error(`There is no post for this id ${val}`)
          );
        }
      })
    ),
  check("text")
    .notEmpty()
    .withMessage("Comment required")
    .isLength({ min: 1 })
    .withMessage("you can't make empty comment")
    .trim()
    .withMessage("comment required"),
  check("user").isMongoId().withMessage("invalid userId formate"),
  validatorMiddleware,
];

exports.getOneCommentValidator = [
  check("id").isMongoId().withMessage("invalid id formate"),
  validatorMiddleware,
];

exports.updateCommentValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid comment id format")
    .custom((val, { req }) =>
      Comment.findById(val).then((comment) => {
        if (!comment) {
          return Promise.reject(
            new Error(`There is no comment for this id ${val}`)
          );
        }
        if (comment.user.toString() != req.user._id.toString()) {
          return Promise.reject(
            new Error("You are not allowed to perform this action")
          );
        }
      })
    ),
  check("text")
    .notEmpty()
    .withMessage("Comment required")
    .isLength({ min: 1 })
    .withMessage("you can't make empty comment")
    .trim()
    .withMessage("comment required")
    .optional(),
  validatorMiddleware,
];

exports.deleteCommentValidator = [
  check("id")
    .isMongoId()
    .withMessage("invalid id formate")
    .custom((val, { req }) => {
      // Check if the user is an admin
      if (req.user.role === "admin") {
        return true; // Admin can delete any comment
      }

      // Find the comment by ID
      return Comment.findById(val).then((comment) => {
        if (!comment) {
          return Promise.reject(
            new Error(`There is no comment for this id ${val}`)
          );
        }

        // Check if the user owns the comment
        if (comment.user.toString() === req.user._id.toString()) {
          return true; // User can delete their own comment
        }

        // Find the post associated with the comment
        return Post.findById(comment.postId).then((post) => {
          if (!post) {
            return Promise.reject(
              new Error(`There is no post for this id ${comment.postId}`)
            );
          }

          // Check if the user is the owner of the post
          if (post.user.toString() === req.user._id.toString()) {
            return true; // Post owner can delete any comment on their post
          }

          // Guest users cannot delete comments
          return Promise.reject(
            new Error("You are not allowed to perform this action")
          );
        });
      });
    }),

  validatorMiddleware,
];
