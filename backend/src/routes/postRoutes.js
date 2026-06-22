import express from "express";
import multer from "multer";
import Post from "../models/Post.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const serializePost = (post, currentUserId) => {
  const json = post.toJSON();
  const userId = String(currentUserId || "");

  return {
    ...json,
    likedByMe: json.likes.some((like) => String(like.user) === userId),
    likesCount: json.likes.length,
    commentsCount: json.comments.length,
    likeUsernames: json.likes.map((like) => like.username),
    commentUsernames: json.comments.map((comment) => comment.username)
  };
};

router.get("/", protect, async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 25);
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments()
    ]);

    res.json({
      posts: posts.map((post) => serializePost(post, req.user._id)),
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + posts.length < total
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", protect, upload.single("image"), async (req, res, next) => {
  try {
    const text = req.body.text?.trim() || "";
    const image = req.file
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
      : "";

    if (!text && !image) {
      return res.status(400).json({ message: "Add text, an image, or both" });
    }

    const post = await Post.create({
      author: req.user._id,
      username: req.user.username,
      avatarColor: req.user.avatarColor,
      text,
      image
    });

    res.status(201).json(serializePost(post, req.user._id));
  } catch (error) {
    next(error);
  }
});

router.patch("/:postId/like", protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = String(req.user._id);
    const existingIndex = post.likes.findIndex((like) => String(like.user) === userId);

    if (existingIndex >= 0) {
      post.likes.splice(existingIndex, 1);
    } else {
      post.likes.push({
        user: req.user._id,
        username: req.user.username
      });
    }

    await post.save();
    res.json(serializePost(post, req.user._id));
  } catch (error) {
    next(error);
  }
});

router.post("/:postId/comments", protect, async (req, res, next) => {
  try {
    const text = req.body.text?.trim();

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      user: req.user._id,
      username: req.user.username,
      text
    });

    await post.save();
    res.status(201).json(serializePost(post, req.user._id));
  } catch (error) {
    next(error);
  }
});

export default router;
