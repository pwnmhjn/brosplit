import { cloudinary } from '../config/cloudinary.config';
import { ErrorResponse } from '../utils/ErrorResponse';

export const destroyCloudinaryUrl = async (obj: {
  url: string;
  type: string;
}): Promise<boolean> => {
  if (obj === null) return false;
  try {
    const result = await cloudinary.uploader.destroy(obj.url);
    console.log(result);
    return true;
  } catch {
    throw new ErrorResponse(
      400,
      'Cloudnt destroy avatar after profile creation fail'
    );
  }
};
