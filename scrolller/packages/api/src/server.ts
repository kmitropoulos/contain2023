import cookieSession from "cookie-session";
import cors from "cors";
import express from "express";
import { COOKIE_NAME, PORT, SESSION_SECRET, WEB_URL } from "./config";
import { errorMiddleware } from "./middlewares/error-middleware";
import authRoutes from "./routes/auth";
import feedRoutes from "./routes/feed";
import postRoutes from "./routes/post";
import saveRoutes from "./routes/save";
import updateRoutes from "./routes/update";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: new RegExp(WEB_URL),
    credentials: true,
  })
);
app.use(
  cookieSession({
    name: COOKIE_NAME,
    secret: SESSION_SECRET,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  })
);

app.use("/auth", authRoutes);
app.use("/feed", feedRoutes);
app.use("/post", postRoutes);
app.use("/save", saveRoutes);
app.use("/update", updateRoutes);

app.use(errorMiddleware);

app.listen(PORT, () =>
  console.log(`server running on http://localhost:${PORT} 🚀`)
);
