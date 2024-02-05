const authService = require("../services/authService");
const {
  getAllUsers,
  getLoggedUser,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData,
  activeLoggedUserData,
  profilePhotoUpload,
  uploadUserImage,
} = require("../services/userService");
const {
  updateLoggedUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validators/userValidator");

const router = require("express").Router();

router.post(
  "/upload-profile-photo",
  authService.protect,
  uploadUserImage,
  profilePhotoUpload
);

router.get("/", authService.protect, authService.allowTo("admin"), getAllUsers);

router.get("/getMe", authService.protect, getLoggedUser);
router.put(
  "/changeMyPassword",
  authService.protect,
  updateLoggedUserPasswordValidator,
  updateLoggedUserPassword
);

router.put(
  "/updateMe",
  authService.protect,
  updateLoggedUserValidator,
  updateLoggedUserData
);
router.delete("/deleteMe", authService.protect, deleteLoggedUserData);
router.delete("/activeMe", activeLoggedUserData);

module.exports = router;
