const {
  setUserIdToBody,
  createComment,
  updateComment,
  getOneComment,
  deleteComment,
  getAllComment,
  createFilterobj,
  setPostIdToBody,
  uploadCommentImage,
  resizeImage,
} = require("../services/commentServices");
const {
  createCommentValidator,
  updateCommentValidator,
  deleteCommentValidator,
  getOneCommentValidator,
} = require("../utils/validators/commentValidator");

const authService = require("../services/authService");

const router = require("express").Router({ mergeParams: true });

router.post(
  "/",
  authService.protect,
  uploadCommentImage,
  resizeImage,
  setUserIdToBody,
  setPostIdToBody,
  createCommentValidator,
  createComment
);
router.get("/", authService.protect, createFilterobj, getAllComment);
router.get("/:id", authService.protect, getOneCommentValidator, getOneComment);
router.put(
  "/:id",
  authService.protect,
  uploadCommentImage,
  resizeImage,
  setUserIdToBody,
  updateCommentValidator,
  updateComment
);

router.delete(
  "/:id",
  authService.protect,
  deleteCommentValidator,
  deleteComment
);

module.exports = router;
