const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);

// Protected test route
router.get("/me", protect, async (req, res) => {
  res.json({
    message: "This is a protected route",
    user: req.user
  });
});

module.exports = router;