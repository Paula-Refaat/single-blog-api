const multer = require("multer");
const ApiError = require("../utils/ApiError");

const multerOptions = () => {
  // Memory engine
  const multerStorage = multer.memoryStorage();
  // FilterImages to upload images only.
  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("Only Images allowed", 400), false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
  return upload;
};

exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

exports.uploadMixOfImages = (arrayOfFields) =>
  multerOptions().fields(arrayOfFields);

exports.uploadArrayOfImages = (arrayOfFields) =>
  multerOptions().array(arrayOfFields);
