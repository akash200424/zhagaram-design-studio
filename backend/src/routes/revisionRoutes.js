const express = require('express');
const router = express.Router();
const { getRevisions, createRevision, updateRevision, deleteRevision } = require('../controllers/revisionController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getRevisions);
router.post('/', protect, createRevision);
router.put('/:id', protect, updateRevision);
router.delete('/:id', protect, deleteRevision);

module.exports = router;
