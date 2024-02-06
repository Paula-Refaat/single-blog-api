const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createPostValidator = [
  check("title")
    .notEmpty()
    .withMessage("Post title required")
    .isLength({ min: 2 })
    .withMessage("Post title too short")
    .isLength({ max: 100 })
    .withMessage("Post title too long"),
  check("description")
    .notEmpty()
    .withMessage("Post description required")
    .isLength({ min: 2 })
    .withMessage("Post description too short"),

  validatorMiddleware,
];

exports.getOnePostValidator = [
  check("id").isMongoId().withMessage("invalid id formate"),
  validatorMiddleware,
];

exports.updatePostValidator = [
  check("id").isMongoId().withMessage("Invalid Post id format"),
  check("title")
    .notEmpty()
    .withMessage("Post title required")
    .isLength({ min: 2 })
    .withMessage("Post title too short")
    .isLength({ max: 100 })
    .withMessage("Post title too long")
    .optional(),
  check("description")
    .notEmpty()
    .withMessage("Post description required")
    .isLength({ min: 2 })
    .withMessage("Post description too short")
    .optional(),
  check("category").notEmpty().withMessage("Post category required").optional(),
  check("user").isMongoId().withMessage("invalid userId formate").optional(),
  validatorMiddleware,
];

exports.deletePostValidator = [
  check("id").isMongoId().withMessage("invalid id formate"),
  validatorMiddleware,
];
