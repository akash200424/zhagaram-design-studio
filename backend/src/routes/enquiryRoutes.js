const express = require('express');
const router = express.Router();
const {
  getEnquiries,
  getEnquiryById,
  createEnquiry,
  updateEnquiry,
  moveToOrder,
  moveToCompleted,
  recordQuoteSent,
  deleteEnquiry,
  updatePaymentStatus,
  getDashboardStats,
} = require('../controllers/enquiryController');
const { protect } = require('../middleware/auth');

router.get('/stats/dashboard', protect, getDashboardStats);
router.get('/', protect, getEnquiries);
router.post('/', protect, createEnquiry);
router.get('/:id', protect, getEnquiryById);
router.put('/:id', protect, updateEnquiry);
router.post('/:id/move-to-order', protect, moveToOrder);
router.post('/:id/move-to-completed', protect, moveToCompleted);
router.post('/:id/send-quote', protect, recordQuoteSent);
router.patch('/:id/payment', protect, updatePaymentStatus);
router.delete('/:id', protect, deleteEnquiry);

module.exports = router;
