const express = require('express');
const { isAuthenticated,isHost} = require('../middleware/authMiddleware');
const calendarController = require('../controllers/calendarController');

const router = express.Router();

router.get('/studios/:studioId/availability', 
  calendarController.getStudioAvailability);

// Default Hours Management
router.get('/studios/:studioId/default-hours', 
  isAuthenticated, 
  isHost, 
  calendarController.getStudioDefaultHours);

router.post('/studios/:studioId/default-hours', 
  isAuthenticated, 
  isHost, 
  calendarController.setStudioDefaultHours);

router.delete('/studios/:studioId/default-hours/:dayOfWeek', 
  isAuthenticated, 
  isHost, 
  calendarController.deleteStudioDefaultHours);

// Special Hours Management
router.get('/studios/:studioId/special-hours', 
  isAuthenticated, 
  isHost, 
  calendarController.getStudioSpecialHours);

router.post('/studios/:studioId/special-hours', 
  isAuthenticated, 
  isHost, 
  calendarController.setStudioSpecialHours);

router.delete('/studios/:studioId/special-hours/:date', 
  isAuthenticated, 
  isHost, 
  calendarController.deleteStudioSpecialHours);

// Recurring Pattern Management
router.get('/studios/:studioId/recurring-patterns', 
  isAuthenticated, 
  isHost, 
  calendarController.getStudioRecurringPatterns);

router.post('/studios/:studioId/recurring-patterns', 
  isAuthenticated, 
  isHost, 
  calendarController.createRecurringPattern);

router.put('/studios/:studioId/recurring-patterns/:patternId', 
  isAuthenticated, 
  isHost, 
  calendarController.updateRecurringPattern);

router.delete('/studios/:studioId/recurring-patterns/:patternId', 
  isAuthenticated, 
  isHost, 
  calendarController.deleteRecurringPattern);

// Slot Generation
router.post('/studios/:studioId/generate-slots', 
  isAuthenticated, 
  isHost, 
  calendarController.generateStudioSlots);

module.exports = router;