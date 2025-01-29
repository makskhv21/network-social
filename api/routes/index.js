const express = require("express");
const router = express.Router();
const multer = require('multer');
const { UserController } = require("../controllers");
const { authenticateToken } = require("../middleware/auth");
const PostController = require("../controllers/post-controller");

const uploadDestination = 'uploads';

// Показати де є зберігається файли
const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const uploads = multer({ storage: storage });

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/current', authenticateToken, UserController.current);
router.get('/users/:id', authenticateToken, UserController.login);
router.put('/users/:id', authenticateToken, UserController.updateUser);

// Routes posts
router.post('/posts', authenticateToken, PostController.createPost);
router.get('/posts', authenticateToken, PostController.getAllPosts);
router.get('/posts/:id', authenticateToken, PostController.getPostById);
router.delete('/posts/:id', authenticateToken, PostController.deletePost);

// Routes comments
router.post("/comments", authenticateToken, CommentController.createComment);
router.delete(
  "/comments/:id",
  authenticateToken,
  CommentController.deleteComment
);

// Routes likes
router.post("/likes", authenticateToken, LikeController.likePost);
router.delete("/likes/:id", authenticateToken, LikeController.unlikePost);

// Routes followers
router.post("/follow", authenticateToken, FollowController.followUser);
router.delete("/unfollow/:id",authenticateToken, FollowController.unfollowUser);

module.exports = router;