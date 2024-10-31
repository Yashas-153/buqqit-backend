const express = require('express');
const { getReviewsByStudioId, createReview, updateReview } = require('../controllers/reviewController');
const {isUser} = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:studioId', getReviewsByStudioId); // Accessible by all users and hosts
router.post('/:studioId', isUser, createReview); // Accessible by users only
router.put('/:studioId', isUser, updateReview); // Accessible by users only

module.exports = router;
