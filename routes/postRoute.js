const router = require("express").Router();

const authService = require("../services/authService");
const {
  createPost,
  uploadPostImageToServer,
  setUserIdToBody,
  uploadPostImageTocloudinary,
  getAllPosts,
  getOnePost,
  deletePostImagefromcloudinary,
  updatePost,
  deletePost,
  likePost,
  getAllLoggedUserPosts,
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
  uploadPostImageToServer,
  uploadPostImageTocloudinary,
  setUserIdToBody,
  createPostValidator,
  createPost
);

router.get("/", authService.protect, getAllPosts);
router.get("/myPosts", authService.protect, getAllLoggedUserPosts);

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
  authService.allowTo("user"),
  updatePostValidator,
  deletePostImagefromcloudinary,
  uploadPostImageToServer,
  uploadPostImageTocloudinary,
  updatePost
);

router.delete(
  "/:id",
  authService.protect,
  authService.allowTo("user", "admin"),
  deletePostValidator,
  deletePostImagefromcloudinary,
  deletePost
);

router.put("/like/:id", authService.protect, likePost);

module.exports = router;
