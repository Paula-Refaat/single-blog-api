const { check } = require("express-validator");
const { default: slugify } = require("slugify");
const bcrypt = require("bcryptjs");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const User = require("../../models/userModel");

exports.createUserValidator = [
  check("name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    })
    .notEmpty()
    .withMessage("User required")
    .isLength({ min: 3 })
    .withMessage("Too short User name"),

  check("email")
    .notEmpty()
    .withMessage("email reauired")
    .isEmail()
    .withMessage("invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already exists"));
        }
      })
    ),

  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Too short password"),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("passwordConfirm required")
    .custom((val, { req }) => {
      if (val != req.body.password) {
        throw new Error("passwordConfirmation not match password");
      }
      return true;
    }),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Phone number must be egyption or saudian phone number only"),
  check("profileImg").optional(),
  check("role").optional(),

  validatorMiddleware,
];
exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  validatorMiddleware,
];
exports.changeUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  check("currentPassword")
    .notEmpty()
    .withMessage("You must enter your current password"),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("You must enter your password Confirm"),
  check("password")
    .notEmpty()
    .withMessage("You must enter new password")
    .custom(async (val, { req }) => {
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error("There no user for this id");
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error("Incorrect current password");
      }

      if (val != req.body.passwordConfirm) {
        throw Error("Password Confirmation incorrect");
      }
      return true;
    }),
  validatorMiddleware,
];
exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  check("name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    })
    .notEmpty()
    .withMessage("User required")
    .isLength({ min: 3 })
    .withMessage("Too short User name")
    .optional(),
  check("email")
    .notEmpty()
    .withMessage("email reauired")
    .isEmail()
    .withMessage("invalid email address")
    .custom((val, { req }) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          if (user._id.toString() === req.params.id.toString()) {
            return true;
          } else {
            throw new Error("E-mail already exists");
          }
        }
      })
    )
    .optional(),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Phone number must be egyption or saudian phone number only"),

  validatorMiddleware,
];
exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];
exports.updateLoggedUserValidator = [
  check("name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    })
    .notEmpty()
    .withMessage("User required")
    .isLength({ min: 3 })
    .withMessage("Too short User name")
    .optional(),
  check("email")
    .notEmpty()
    .withMessage("email Required")
    .isEmail()
    .withMessage("invalid email address")
    .toLowerCase()
    .custom((val, { req }) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          if (user._id.toString() === req.user._id.toString()) {
            return true;
          } else {
            throw new Error("E-mail already exists");
          }
        }
      })
    )
    .optional(),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Phone number must be egyption or saudian phone number only"),
  check("profileImg").optional(),
  check("role").optional(),

  validatorMiddleware,
];
exports.updateLoggedUserPasswordValidator = [
  check("passwordConfirm")
    .notEmpty()
    .withMessage("You must enter your password Confirm"),
  check("newPassword")
    .notEmpty()
    .withMessage("Password Required")
    .isLength({ min: 6 })
    .withMessage("Too short password")
    .custom((val, { req }) => {
      if (val != req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),
  validatorMiddleware,
];
