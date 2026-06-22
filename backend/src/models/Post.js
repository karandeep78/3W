import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    username: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    username: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    }
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    username: {
      type: String,
      required: true
    },
    avatarColor: {
      type: String,
      required: true
    },
    text: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    image: {
      type: String,
      default: ""
    },
    likes: [likeSchema],
    comments: [commentSchema]
  },
  { timestamps: true }
);

postSchema.virtual("likesCount").get(function getLikesCount() {
  return this.likes.length;
});

postSchema.virtual("commentsCount").get(function getCommentsCount() {
  return this.comments.length;
});

postSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Post", postSchema);
