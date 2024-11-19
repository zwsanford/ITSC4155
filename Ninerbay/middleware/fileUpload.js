// middleware/fileUpload.js
import multer from 'multer';
import crypto from 'crypto';
import sharp from 'sharp';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import dotenv from 'dotenv';
import { Console } from 'console';
dotenv.config();

// AWS S3 configuration
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

// Initialize S3 client
const s3 = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
});

// Multer storage configuration (in memory)
const storage = multer.memoryStorage();

// Multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const mimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (mimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
  },
}).single('image');

// Middleware to handle file upload and upload to S3
export const fileUpload = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      err.status = 400;
      return next(err);
    }

    if (!req.file) {
      return next();
    }

    // Generate random image name for S3
    const s3Key = `images/${randomImageName()}`;

    // Resize image using Sharp
    const buffer = await sharp(req.file.buffer)
    .resize({
      width: 1080,
      height: 1080,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({
      lossless: false,
    })
    .toBuffer();

    // Create S3 upload parameters
    const params = {
      Bucket: bucketName,
      Key: s3Key,
      Body: buffer,
      ContentType: req.file.mimetype,
    };

    try {
      await s3.send(new PutObjectCommand(params));
      console.log('File uploaded to S3');
      req.file.s3Key = s3Key; // Attach S3 key to the request object
      next();
    } catch (uploadErr) {
      uploadErr.status = 500;
      next(uploadErr);
    }
  });
};

// Function to generate a signed URL for accessing the file
export const getFileUrl = async (key) => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    const url = await getSignedUrl(s3, new GetObjectCommand(params), { expiresIn: 3600 });
    console.log('Generated URL');
    return url;
  } catch (err) {
    throw err;
  }
};

// Function to delete a file from S3
export const deleteFile = async (key) => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    await s3.send(new DeleteObjectCommand(params));
    console.log('File deleted from S3');
  } catch (err) {
    throw err;
  }
};