import cookieParser from "cookie-parser";
import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import passport from "passport";
import { Env } from "./config/env.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import connectDatabase from "./config/database.config";
import "./config/passport.config";
import routes from "./routes";
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: Env.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.use(passport.initialize());

app.get(
  "/health",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(HTTPSTATUS.OK).json({
      status: "OK",
      message: "Server is healthy",
    });
  })
);

app.use("/api", routes);

app.use(errorHandler);

app.listen(Env.PORT, async () => {
  await connectDatabase();
  console.log(
    `Server is running on PORT: ${Env.PORT} in MODE: ${Env.NODE_ENV}`
  );
});
