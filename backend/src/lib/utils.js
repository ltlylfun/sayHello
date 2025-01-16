import jwt from "jsonwebtoken";
export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("jwt", token, {
    maxAge: 1000 * 60 * 60 * 24 * 7, //7 days
    httpOnly: true, //防止 XSS 攻击(跨站脚本攻击)，阻止客户端 JavaScript 访问 Cookie
    sameSite: true, //防止 CSRF 攻击(跨站请求伪造)，只有在同一站点请求才会发送 Cookie
    secure: process.env.NODE_ENV !== "development",
  });
  return token;
};
