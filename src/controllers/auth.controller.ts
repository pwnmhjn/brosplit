import Jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { AsyncWrap } from '../utils/AsyncWrap';
import { ErrorResponse } from '../utils/ErrorResponse';
import { User } from '../models/userSchema';
import { SuccessResponse } from '../utils/SuccessResponse';
import generateRefreshAndAccess from '../utils/generateRefreshAndAccess';
import { SignInRequestBody, SignUpRequestBody } from '../types/user';
import generateUsername from '../utils/generateUsername';
import { AuthenticatedRequest } from '../types/profile';

const signUp = AsyncWrap(async (req: Request, res: Response) => {
  const { email, password } = req.body as SignUpRequestBody;

  if ([email, password].some((field) => field?.trim() === ' ')) {
    throw new ErrorResponse(400, 'All fields are required.');
  }
  const username = generateUsername(email ?? '');

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ErrorResponse(400, 'User with this email already exists.');
  }
  const user = await User.create({ email, password, username });

  const userFromDB = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  res
    .status(201)
    .json(
      new SuccessResponse(
        201,
        { user: userFromDB },
        'User created successfully'
      )
    );
});
const signIn = AsyncWrap(async (req: Request, res: Response) => {
  const { email, password, username } = req.body as SignInRequestBody;

  if (!password || !(email || username)) {
    throw new ErrorResponse(400, 'Email/Username and password are required.');
  }
  const orQuery = [];
  if (email) orQuery.push({ email });
  if (username) orQuery.push({ username });
  if (orQuery.length === 0) {
    throw new ErrorResponse(400, 'Email or username is required.');
  }

  const user = await User.findOne({ $or: orQuery });
  if (!user) {
    throw new ErrorResponse(400, 'User not found.');
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ErrorResponse(400, 'Password is incorrect.');
  }

  const { accessToken, refreshToken } = await generateRefreshAndAccess(
    user._id.toString()
  );

  const loggedUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  res
    .status(200)
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    })
    .json(
      new SuccessResponse(
        200,
        { user: loggedUser, accessToken },
        'User logged in'
      )
    );
});
const signOut = AsyncWrap(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ErrorResponse(400, 'User is not Authenticated');
  }
  const userId = req.user._id;
  await User.findByIdAndUpdate(
    userId,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  const option = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .clearCookie('refreshToken', option)
    .json(new SuccessResponse(200, null, 'User LogOut'));
});
const fetchUsers = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ErrorResponse(400, `User is Not Authenticated`);
    }
    const users = await User.find().select('-password -refreshToken');
    if (!users) {
      throw new ErrorResponse(400, 'Could not find User');
    }
    res
      .status(200)
      .json(new SuccessResponse(200, { users }, 'users fetched Successful'));
  }
);
const fetchCurrentUser = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ErrorResponse(400, `User is Not Authenticated`);
    }
    const user = await User.findById(req.user._id).select(
      '-refreshToken -password'
    );
    if (!user) {
      throw new ErrorResponse(400, 'Could not find User');
    }
    res
      .status(200)
      .json(
        new SuccessResponse(200, { user }, 'Current users fetched Successful')
      );
  }
);
const getAccessToken = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      throw new ErrorResponse(400, 'can not get Refresh Token');
    }

    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new ErrorResponse(
        500,
        'Refresh token secret is not set in environment variables.'
      );
    }
    const payload = Jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    );
    if (
      !payload ||
      typeof payload !== 'object' ||
      !('_id' in payload) ||
      !payload._id
    ) {
      throw new ErrorResponse(500, 'JWT Verify Error');
    }
    const user = await User.findById(payload._id).select(
      '-password -refreshToken'
    );
    if (!user) {
      throw new ErrorResponse(500, 'Cloud not Find User in DataBase');
    }

    const accessToken = await user.generateAccessToken();

    res.json(
      new SuccessResponse(
        200,
        { user, accessToken: accessToken },
        'AccessToken Generated'
      )
    );
  }
);

export {
  signUp,
  signIn,
  signOut,
  fetchUsers,
  fetchCurrentUser,
  getAccessToken,
};
