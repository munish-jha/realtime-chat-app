import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validators";
import { loginService, registerService } from "../services/auth.service";
import { clearJwtAuthCookie, setJwtAuthCookie } from "../utils/cookie";
import { HTTPSTATUS } from "../config/http.config";

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse(req.body);

    const user = await registerService(body);

    const userId = user._id as unknown as string;

    return setJwtAuthCookie({ res, userId }).status(HTTPSTATUS.CREATED).json({
      message: "User created and login successfully",
    });
  }
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = loginSchema.parse(req.body);

    const user = await loginService(body);

    const userId = user._id as unknown as string;

    return setJwtAuthCookie({ res, userId }).status(HTTPSTATUS.CREATED).json({
      message: "User created and login successfully",
    });
  }
);

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    return clearJwtAuthCookie(res).status(HTTPSTATUS.OK).json({
      message: "User logged out successfully",
    });
  }
);

export const authStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    return res.status(HTTPSTATUS.OK).json({
      message: "Authenticated User",
      user,
    });
  }
);
