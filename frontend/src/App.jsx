import {
  Bell,
  ClipboardCheck,
  Home,
  ImagePlus,
  LogOut,
  MessageSquare,
  Plus,
  Send,
  Share2,
  Star,
  Trophy,
  UserCircle,
  Users,
  X
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { clearAuth, getStoredAuth, request, storeAuth } from "./api.js";

const emptyAuthForm = {
  username: "",
  email: "",
  password: ""
};

function normalizePost(post) {
  const likes = Array.isArray(post.likes) ? post.likes : [];
  const comments = Array.isArray(post.comments) ? post.comments : [];

  return {
    ...post,
    _id: post._id || post.id || crypto.randomUUID(),
    username: post.username || "User",
    avatarColor: post.avatarColor || "#2f80ed",
    createdAt: post.createdAt || new Date().toISOString(),
    likes,
    comments,
    likesCount: Number.isFinite(post.likesCount) ? post.likesCount : likes.length,
    commentsCount: Number.isFinite(post.commentsCount) ? post.commentsCount : comments.length,
    likeUsernames: Array.isArray(post.likeUsernames)
      ? post.likeUsernames
      : likes.map((like) => like.username).filter(Boolean),
    commentUsernames: Array.isArray(post.commentUsernames)
      ? post.commentUsernames
      : comments.map((comment) => comment.username).filter(Boolean)
  };
}

function initials(name = "U") {
  return String(name || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function App() {
  const [auth, setAuth] = useState(getStoredAuth);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, hasMore: false });
  const [composerOpen, setComposerOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [loading, setLoading] = useState(false);
  const [feedLoading, setFeedLoading] = useState(false);
  const [error, setError] = useState("");

  const currentUser = auth?.user;

  const feedStats = useMemo(
    () => ({
      posts: posts.length,
      likes: posts.reduce((sum, post) => sum + post.likesCount, 0),
      comments: posts.reduce((sum, post) => sum + post.commentsCount, 0)
    }),
    [posts]
  );

  useEffect(() => {
    if (auth?.token) {
      loadFeed(1);
    }
  }, [auth?.token]);

  const updateAuthForm = (event) => {
    setAuthForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload =
        authMode === "signup"
          ? authForm
          : { email: authForm.email, password: authForm.password };
      const data = await request(`/auth/${authMode}`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      storeAuth(data);
      setAuth(data);
      setAuthForm(emptyAuthForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFeed = async (page = 1) => {
    setFeedLoading(true);
    setError("");

    try {
      const data = await request(`/posts?page=${page}&limit=8`);
      const nextPosts = Array.isArray(data.posts) ? data.posts.map(normalizePost) : [];
      setPosts((current) => (page === 1 ? nextPosts : [...current, ...nextPosts]));
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setFeedLoading(false);
    }
  };

  const createPost = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const body = new FormData();
      body.append("text", postText);
      if (postImage) body.append("image", postImage);

      const createdPost = await request("/posts", {
        method: "POST",
        body
      });
      setPosts((current) => [normalizePost(createdPost), ...current]);
      setPostText("");
      setPostImage(null);
      setComposerOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId) => {
    setError("");
    try {
      const updatedPost = await request(`/posts/${postId}/like`, { method: "PATCH" });
      setPosts((current) =>
        current.map((post) => (post._id === postId ? normalizePost(updatedPost) : post))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const submitComment = async (event, postId) => {
    event.preventDefault();
    const text = commentDrafts[postId]?.trim();
    if (!text) return;

    setError("");
    try {
      const updatedPost = await request(`/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ text })
      });
      setPosts((current) =>
        current.map((post) => (post._id === postId ? normalizePost(updatedPost) : post))
      );
      setCommentDrafts((current) => ({ ...current, [postId]: "" }));
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = () => {
    clearAuth();
    setAuth(null);
    setPosts([]);
  };

  if (!auth) {
    return (
      <main className="auth-shell">
        <section className="auth-panel">
          <div className="brand-mark">
            <Users size={36} />
          </div>
          <p className="eyebrow">3W Internship Assignment</p>
          <h1>Social</h1>
          <p className="auth-copy">
            Sign in to create posts, share images, like updates, and comment in a
            clean TaskPlanet-inspired feed.
          </p>

          <div className="auth-tabs">
            <button
              className={authMode === "login" ? "active" : ""}
              onClick={() => setAuthMode("login")}
              type="button"
            >
              Login
            </button>
            <button
              className={authMode === "signup" ? "active" : ""}
              onClick={() => setAuthMode("signup")}
              type="button"
            >
              Signup
            </button>
          </div>

          <form className="auth-form" onSubmit={handleAuth}>
            {authMode === "signup" && (
              <label>
                Username
                <input
                  name="username"
                  onChange={updateAuthForm}
                  placeholder="Your display name"
                  required
                  value={authForm.username}
                />
              </label>
            )}
            <label>
              Email
              <input
                name="email"
                onChange={updateAuthForm}
                placeholder="you@example.com"
                required
                type="email"
                value={authForm.email}
              />
            </label>
            <label>
              Password
              <input
                minLength={6}
                name="password"
                onChange={updateAuthForm}
                placeholder="Minimum 6 characters"
                required
                type="password"
                value={authForm.password}
              />
            </label>
            {error && <p className="error-text">{error}</p>}
            <button className="primary-btn" disabled={loading} type="submit">
              {loading ? "Please wait..." : authMode === "signup" ? "Create Account" : "Login"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>Social</h1>
          <p>{feedStats.posts} posts from the community</p>
        </div>
        <div className="top-actions">
          <span className="coin-pill">
            50 <Star size={17} fill="currentColor" />
          </span>
          <span className="money-pill">₹0.00</span>
          <span className="bell-wrap">
            <Bell size={24} />
            <b>1</b>
          </span>
          <button className="avatar-button" onClick={logout} title="Logout" type="button">
            <span style={{ backgroundColor: currentUser.avatarColor }}>
              {initials(currentUser.username)}
            </span>
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <section className="summary-strip">
        <article>
          <strong>{feedStats.likes}</strong>
          <span>Likes</span>
        </article>
        <article>
          <strong>{feedStats.comments}</strong>
          <span>Comments</span>
        </article>
        <article>
          <strong>{currentUser.username}</strong>
          <span>Logged in</span>
        </article>
      </section>

      {error && <p className="toast-error">{error}</p>}

      {composerOpen && (
        <section className="composer">
          <div className="composer-head">
            <h2>Create post</h2>
            <button onClick={() => setComposerOpen(false)} title="Close" type="button">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={createPost}>
            <textarea
              onChange={(event) => setPostText(event.target.value)}
              placeholder="Share an update, result, or leaderboard moment..."
              value={postText}
            />
            <label className="image-picker">
              <ImagePlus size={20} />
              <span>{postImage ? postImage.name : "Add image"}</span>
              <input
                accept="image/*"
                onChange={(event) => setPostImage(event.target.files?.[0] || null)}
                type="file"
              />
            </label>
            <button className="primary-btn" disabled={loading} type="submit">
              <Send size={18} />
              {loading ? "Posting..." : "Post"}
            </button>
          </form>
        </section>
      )}

      <section className="feed">
        {posts.length === 0 && !feedLoading && (
          <div className="empty-feed">
            <UserCircle size={44} />
            <h2>No posts yet</h2>
            <p>Be the first one to share something with the public feed.</p>
          </div>
        )}

        {posts.map((post) => (
          <article className="post-card" key={post._id}>
            <div className="post-author">
              <span className="avatar" style={{ backgroundColor: post.avatarColor }}>
                {initials(post.username)}
              </span>
              <div>
                <h2>{post.username}</h2>
                <p>@{post.username.toLowerCase().replace(/\s+/g, "")} · {timeAgo(post.createdAt)}</p>
              </div>
            </div>

            {post.text && <p className="post-text">{post.text}</p>}
            {post.image && <img alt="User post" className="post-image" src={post.image} />}

            <div className="people-line">
              {post.likeUsernames.length > 0 && <span>Liked by {post.likeUsernames.join(", ")}</span>}
              {post.commentUsernames.length > 0 && (
                <span>Comments from {Array.from(new Set(post.commentUsernames)).join(", ")}</span>
              )}
            </div>

            <div className="post-actions">
              <button
                className={post.likedByMe ? "liked" : ""}
                onClick={() => toggleLike(post._id)}
                type="button"
              >
                <span>♡</span>
                {post.likesCount}
              </button>
              <button type="button">
                <MessageSquare size={22} />
                {post.commentsCount}
              </button>
              <button type="button">
                <Share2 size={22} />
                1
              </button>
            </div>

            <form className="comment-form" onSubmit={(event) => submitComment(event, post._id)}>
              <input
                onChange={(event) =>
                  setCommentDrafts((current) => ({ ...current, [post._id]: event.target.value }))
                }
                placeholder="Write a comment..."
                value={commentDrafts[post._id] || ""}
              />
              <button title="Send comment" type="submit">
                <Send size={18} />
              </button>
            </form>

            {post.comments.length > 0 && (
              <div className="comments">
                {post.comments.slice(-2).map((comment) => (
                  <p key={comment._id}>
                    <strong>{comment.username}</strong> {comment.text}
                  </p>
                ))}
              </div>
            )}
          </article>
        ))}

        {pagination.hasMore && (
          <button className="load-more" disabled={feedLoading} onClick={() => loadFeed(pagination.page + 1)}>
            {feedLoading ? "Loading..." : "Load more posts"}
          </button>
        )}
      </section>

      <button className="floating-create" onClick={() => setComposerOpen(true)} title="Create post" type="button">
        <Plus size={34} />
      </button>

      <nav className="bottom-nav">
        <button type="button">
          <Home size={27} />
          Home
        </button>
        <button type="button">
          <ClipboardCheck size={27} />
          Tasks
        </button>
        <button className="active" type="button">
          <Users size={30} />
          Social
        </button>
        <button type="button">
          <Trophy size={27} />
          Leader Board
        </button>
        <button type="button">
          <MessageSquare size={27} />
          Chat
        </button>
      </nav>
    </main>
  );
}
