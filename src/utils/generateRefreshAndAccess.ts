import { User } from "../models/userSchema";
import { ErrorResponse } from "./ErrorResponse";

interface TokenResponse {
  accessToken: string | null;
  refreshToken: string | null;
}

export default async function generateRefreshAndAccess(
  userId: string
): Promise<TokenResponse> {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ErrorResponse(400, "Unable to find User");
    }

    const accessToken: string = user.generateAccessToken();
    const refreshToken: string = user.generateRefreshToken();

    if (refreshToken) {
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });
      return { accessToken, refreshToken };
    }

    return { accessToken: null, refreshToken: null };
  } catch (error) {
    throw new ErrorResponse(
      400,
      `Unable to generate Refresh and Access Token: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
