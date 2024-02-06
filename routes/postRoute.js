const router = require("express").Router();

const authService = require("../services/authService");
const {
  createPost,
  getAllPosts,
  getOnePost,
  updatePost,
  deletePost,
  likePost,
  uploadPostImage,
  resizeImage,
} = require("../services/postServices");
const {
  createPostValidator,
  getOnePostValidator,
  updatePostValidator,
  deletePostValidator,
} = require("../utils/validators/postValidator");

const commentRoute = require("./commentRoute");

router.use("/:postId/comments", commentRoute);

router.post(
  "/",
  authService.protect,
  uploadPostImage,
  resizeImage,
  createPostValidator,
  createPost
);

router.get("/", getAllPosts);

router.get(
  "/:id",
  authService.protect,
  authService.allowTo("admin", "user"),
  getOnePostValidator,
  getOnePost
);

router.put(
  "/:id",
  authService.protect,
  uploadPostImage,
  resizeImage,
  updatePostValidator,
  updatePost
);

router.delete(
  "/:id",
  authService.protect,
  authService.allowTo("user", "admin"),
  deletePostValidator,
  deletePost
);

router.put("/like/:id", authService.protect, likePost);

module.exports = router;
