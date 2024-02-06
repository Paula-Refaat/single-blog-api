const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post title required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, "Post description required"],
      trim: true,
      minlength: 10,
    },

    date: {
      type: Date,
      default: Date.now(),
    },

    images: [String],

    // category: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        deault: 0,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

PostSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "postId",
  localField: "_id",
});

const setImageURL = (doc) => {
  if (doc.images) {
    const imagesList = [];
    doc.images.forEach((image) => {
      const URL = `${process.env.BASE_URL}/posts/${image}`;
      imagesList.push(URL);
    });
    doc.images = imagesList;
  }
};

PostSchema.post("init", (doc) => {
  setImageURL(doc);
});
PostSchema.post("save", (doc) => {
  setImageURL(doc);
});

PostSchema.pre(/^find/, function (next) {
  // this.populate({ path: "user", select: "name" })
  this.populate({
    path: "likes",
    select: "name",
  });
  // this.populate({ path: "comments", select: "text -postId" });
  next();
});
module.exports = mongoose.model("Post", PostSchema);
