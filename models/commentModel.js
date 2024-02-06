const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    image: String,
  },
  {
    timestamps: true,
  }
);
const setImageURL = (doc) => {
  if (doc.image) {
    const URL = `${process.env.BASE_URL}/comments/${doc.image}`;
    doc.image = URL;
  }
};

CommentSchema.post("init", (doc) => {
  setImageURL(doc);
});
CommentSchema.post("save", (doc) => {
  setImageURL(doc);
});

CommentSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name" });
  next();
});
module.exports = mongoose.model("Comment", CommentSchema);
