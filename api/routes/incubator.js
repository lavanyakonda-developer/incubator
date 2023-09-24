import express from 'express';
import { incubatorHomeDetails } from '../controllers/incubator.js';
import multer from 'multer';
import path from 'path'; // Import the path module to work with file paths
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

router.get('/incubator-home', incubatorHomeDetails);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Create an "uploads" folder in your project
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

export const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No files were uploaded.');
  }

  // Generate the file URL based on the file name and location
  const fileUrl = path.join(__dirname, '..', 'uploads', req.file.filename);

  res.json({ message: 'File uploaded successfully', fileUrl });
});

export default router;
