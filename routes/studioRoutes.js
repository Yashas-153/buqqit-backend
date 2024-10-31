const express = require('express');
const {
  getStudioById,
  createStudio,
  updateStudio,
  deleteStudio,
  setAvailability,
  searchStudios,
  getStudios,
} = require('../controllers/studioController');
const {isHost, isUser} = require('../middleware/authMiddleware');
const { upload, uploadPhotos } = require('../controllers/photoUploadController');
const router = express.Router();
router.get('/',getStudios); // Accessible by all users
router.get('/:studio_id', getStudioById); // Accessible by all users
router.post('/', isHost,createStudio); // Accessible by hosts only
router.put('/:studio_id', isHost,updateStudio); // Accessible by hosts only
router.delete('/:studio_id', isHost,deleteStudio); // Accessible by hosts only
router.post('/search',searchStudios)
router.post('/upload-photos/:studio_id', upload.array('photos', 5), isHost,uploadPhotos); // Limit to 5 photos
router.post("/availability/:studio_id",isHost,setAvailability)


module.exports = router;
  