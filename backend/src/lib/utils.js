import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateAccessToken = (userId) => {
  return jwt.sign({ userId, type: "access" }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (userId, version = 0) => {
  return jwt.sign(
    { userId, version, type: "refresh" },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export const generateTokens = (userId, version, res) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId, version);

  res.cookie("accessToken", accessToken, {
    maxAge: 1000 * 60 * 15,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });

  res.cookie("refreshToken", refreshToken, {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });

  return { accessToken, refreshToken };
};

export const verifyToken = (token, type = "access") => {
  try {
    const secret =
      type === "refresh"
        ? process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        : process.env.JWT_SECRET;

    const decoded = jwt.verify(token, secret);

    if (decoded.type !== type) {
      throw new Error(
        `Invalid token type. Expected ${type}, got ${decoded.type}`
      );
    }

    return decoded;
  } catch (error) {
    throw error;
  }
};

export const clearTokens = (res) => {
  res.cookie("accessToken", "", { maxAge: 0 });
  res.cookie("refreshToken", "", { maxAge: 0 });
};
