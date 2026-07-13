import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import config from '../config';
import logger from './logger';

/**
 * Cloudinary credentials fall back to placeholder values in config when unset,
 * so treat those placeholders as "not configured" and serve files locally instead.
 */
const isCloudinaryConfigured = (): boolean =>
  !config.CLOUDINARY_CLOUD_NAME.startsWith('placeholder_') &&
  !config.CLOUDINARY_API_KEY.startsWith('placeholder_') &&
  !config.CLOUDINARY_API_SECRET.startsWith('placeholder_');

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

const removeLocalFile = (filePath: string): void => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

/**
 * Upload a locally stored file to Cloudinary and return its public URL.
 * When Cloudinary is not configured, the file is kept on disk and served
 * from the static /uploads route instead.
 */
export const uploadMedia = async (filePath: string, folderName: string): Promise<string> => {
  if (!isCloudinaryConfigured()) {
    logger.warn('Cloudinary is not configured; falling back to local file storage');
    return `/uploads/${path.basename(filePath)}`;
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `veya/${folderName}`,
    });

    // The remote copy is now canonical; drop the local temporary file.
    removeLocalFile(filePath);
    return result.secure_url;
  } catch (error) {
    removeLocalFile(filePath);
    throw error;
  }
};

export default uploadMedia;
