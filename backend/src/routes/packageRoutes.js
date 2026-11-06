const express = require('express');
const router = express.Router();
const { getPackage, updatePackage, calculateEstimate } = require('../controllers/packageController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getPackage);
router.put('/', protect, updatePackage);
router.post('/calculate', protect, calculateEstimate);

module.exports = router;
