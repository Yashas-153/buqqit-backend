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
const {isHost, isUser, isAuthenticated} = require('../middleware/authMiddleware');
const { upload, uploadPhotos, addImageURLs} = require('../controllers/photoUploadController');
const router = express.Router();
router.get('/:studio_id', getStudioById); 
router.get('/',getStudios);
router.post('/', isAuthenticated, isHost,createStudio);
router.put('/:studio_id', isAuthenticated, isHost, updateStudio); 
router.delete('/:studio_id', isHost,deleteStudio); 
router.post('/search',searchStudios)
router.post('/upload-photos/:studio_id', upload.array('photos', 5), isHost,uploadPhotos); // Limit to 5 photos
router.post("/availability/:studio_id",isHost,setAvailability)
router.post("/add-studio-urls",addImageURLs)

module.exports = router;
  