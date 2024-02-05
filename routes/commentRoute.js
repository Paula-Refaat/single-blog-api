const {
  setUserIdToBody,
  createComment,
  updateComment,
  getOneComment,
  deleteComment,
  getAllComment,
  createFilterobj,
  setPostIdToBody,
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
