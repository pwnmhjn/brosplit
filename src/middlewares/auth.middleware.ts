import { Request, Response, NextFunction } from "express";
import { User, IUser } from "../models/userSchema";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ErrorResponse } from "../utils/ErrorResponse";

declare module "express-serve-static-core" {
  interface Request {
    user?: IUser;
  }
}

interface MyJwtPayload extends JwtPayload {
  _id: string;
}

export const verifyJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authToken: string | undefined =
      req.headers?.authorization?.toString() ||
      req.headers?.Authorization?.toString() ||
      req.body?.accessToken ||
      req.cookies?.accessToken;
    if (!authToken || !authToken.startsWith("Bearer ")) {
      throw new ErrorResponse(401, "No Token");
    }
    const token = authToken.split(" ")[1];

    const decode = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as MyJwtPayload;
    if (!decode._id) {
      throw new ErrorResponse(401, "Invalid Token Payload");
    }
    const user = await User.findById(decode._id);
    if (!user) {
      throw new ErrorResponse(404, "User Not Found");
    }
    req.user = user;
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      next(new ErrorResponse(403, error.message || "Unauthorized"));
    } else {
      next(new ErrorResponse(403, "Unauthorized"));
    }
  }
};
