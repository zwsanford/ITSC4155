// middleware/fileUpload.js
import multer from 'multer';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

// AWS S3 configuration
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

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

    const s3Key = `images/${Date.now()}_${req.file.originalname}`;
    const params = {
      Bucket: bucketName,
      Key: s3Key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    try {
      await s3.send(new PutObjectCommand(params));
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
  } catch (err) {
    throw err;
  }
};