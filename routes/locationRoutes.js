const express = require('express');
const getLocationList  = require('../controllers/locationListControllrer');
const router = express.Router();

router.get('/location',getLocationList);

module.exports = router;
