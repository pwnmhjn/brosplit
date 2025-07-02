import { Request, Response } from "express";
import { AsyncWrap } from "../utils/AsyncWrap";
import { ErrorResponse } from "../utils/ErrorResponse";
import { User } from "../models/userSchema";
import { SuccessResponse } from "../utils/SuccessResponse";
import generateRefreshAndAccess from "../utils/generateRefreshAndAccess";

const signup = AsyncWrap(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if ([email, password].some((field) => field?.trim() === " ")) {
    throw new ErrorResponse(400, "All fields are required.");
  }

  console.log(email,password)
  const existingUser = await User.findOne({ email });
  console.log(existingUser);
  if (existingUser) {
    throw new ErrorResponse(400, "User with this email already exists.");
  }
  const user = await User.create({ email, password });

  const userFromDB = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  res
    .status(201)
    .json(
      new SuccessResponse(
        201,
        { user: userFromDB },
        "User created successfully"
      )
    );
});

const signin = AsyncWrap(async (req: Request, res: Response) => {
  const { email, password, username } = req.body as {
    email?: string;
    password?: string;
    username?: string;
  };

  if (!password || !(email || username)) {
    throw new ErrorResponse(400, "Email/Username and password are required.");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ErrorResponse(400, "User not found.");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ErrorResponse(400, "Password is incorrect.");
  }

  const { accessToken, refreshToken } = await generateRefreshAndAccess(
    user._id.toString()
  );

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  res
    .status(200)
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    })
    .json(
      new SuccessResponse(
        200,
        { user: loggedUser, accessToken },
        "User logged in"
      )
    );
});

export { signup, signin };
