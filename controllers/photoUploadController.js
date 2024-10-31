const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client'); // Import Prisma Client

const prisma = new PrismaClient(); // Initialize Prisma Client

// Set up storage engine with destination and filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to save photos
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique name for the uploaded file
  }
});

// Initialize multer with the storage engine
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed!'));
    }
  }
});

// Controller function for handling photo uploads
const uploadPhotos = async (req, res) => {
  console.log("reached photo uploader controller")
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  try {
    const studioId = parseInt(req.params.studio_id); // Studio ID sent in request body
    console.log("userId is",studioId)
    const filePaths = req.files.map(file => `/uploads/${file.filename}`); // Paths of uploaded files

    // Insert the file paths into the database for each uploaded file
    const photoPromises = filePaths.map(async (url) => {
      return await prisma.photo.create({
        data: {
          studio_id: studioId,
          url: url,
          upload_date: new Date(),
        }
      });
    });

    await Promise.all(photoPromises); // Wait for all photos to be inserted

    res.status(200).json({ message: 'Files uploaded and saved successfully', filePaths });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading files', error });
  }
};

module.exports = { upload, uploadPhotos };
