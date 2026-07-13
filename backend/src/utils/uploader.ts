import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { BadRequestError } from './customErrors';

export const uploadDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
  },
});

const ALLOWED_TYPES = /jpeg|jpg|png|webp/;

/**
 * Multer instance for single-image uploads (5MB cap, image formats only).
 */
export const fileUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const mimetypeValid = ALLOWED_TYPES.test(file.mimetype);
    const extnameValid = ALLOWED_TYPES.test(path.extname(file.originalname).toLowerCase());

    if (mimetypeValid && extnameValid) {
      cb(null, true);
      return;
    }

    cb(new BadRequestError('Only images (jpg, jpeg, png, webp) are allowed'));
  },
});

export default fileUpload;
