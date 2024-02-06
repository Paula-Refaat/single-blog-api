const multer = require("multer");


// Phote Storage

const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    if (file) {
      const ext = file.mimetype.split("/")[1];
      const originalname = file.originalname.split(".")[0];
      cb(
        null,
        originalname +
          " " +
          new Date().toISOString().replace(/:/g, "-") +
          `.${ext}`
      );
    } else {
      cb(null, false);
    }
  },
});

// Photo Upload Middleware
const photoUpload = multer({
  storage: photoStorage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb({ message: "Unsupported file formate" }, false);
    }
  },
  limits: { fileSize: 1024 * 1024 }, // 1 megabyte
});



// upload single image
exports.uploadSingleImage = (fileName) => photoUpload.single(fileName);
