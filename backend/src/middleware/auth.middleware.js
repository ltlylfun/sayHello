import { verifyToken } from "../lib/utils.js";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Access Token Provided" });
    }

    const decoded = verifyToken(accessToken, "access");

    const user = await User.findById(decoded.userId).select(
      "-password -refreshToken"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("error in protectRoute middleware: ", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Access token expired",
        code: "ACCESS_TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid access token" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Refresh Token Provided" });
    }

    const decoded = verifyToken(refreshToken, "refresh");

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    if (user.refreshTokenVersion !== decoded.version) {
      return res
        .status(401)
        .json({ message: "Refresh token version mismatch" });
    }

    req.user = user;
    req.refreshTokenDecoded = decoded;
    next();
  } catch (error) {
    console.log("error in verifyRefreshToken middleware: ", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Refresh token expired",
        code: "REFRESH_TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};
