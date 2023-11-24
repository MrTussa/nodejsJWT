import jwt from "jsonwebtoken";

const secretKey = "lafhasdkfjhwersdaflgkka";

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Отсутствует токен авторизации" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ error: "Недействительный токен авторизации" });
    }

    req.userId = decoded.userId;
    next();
  });
};

export default verifyToken;
