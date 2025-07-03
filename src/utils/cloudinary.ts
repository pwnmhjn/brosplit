import { UploadApiResponse } from 'cloudinary';
import fs from 'fs';
import { cloudinary } from '../config/cloudinary.config';

const uploadOnCloudinary = async (
  localFilePath: string
): Promise<UploadApiResponse | null> => {
  try {
    if (!localFilePath) return null;

    const response: UploadApiResponse = await cloudinary.uploader.upload(
      localFilePath,
      {
        resource_type: 'auto',
      }
    );
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } catch (fsError) {
      console.error('Error deleting local file:', fsError);
    }
    return null;
  }
};

export { uploadOnCloudinary };
