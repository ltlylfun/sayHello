import express from "express";
import {
  login,
  logout,
  signup,
  updateProfile,
  checkAuth,
  refreshToken,
} from "../controllers/auth.controller.js";
import {
  protectRoute,
  verifyRefreshToken,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", protectRoute, logout);

router.post("/refresh", verifyRefreshToken, refreshToken);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

export default router;
