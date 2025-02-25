const express = require('express');
const { 
  createAmenity, 
  getAmenities,  // Fixed: Changed to match the function name in controller
  updateAmenity, 
  createAmenities,
  deleteAmenity
} = require('../controllers/amenityController');
const {isHost} = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/',createAmenity); 
router.get('/', getAmenities);  
router.put('/:amenityId', updateAmenity); 
router.post("/add-multiple",createAmenities)
router.delete('/:amenityId', deleteAmenity); 

module.exports = router;
