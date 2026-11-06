const mongoose = require('mongoose');

const revisionSchema = new mongoose.Schema({
  enquiryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enquiry',
    required: true,
  },
  revisionNo: {
    type: Number,
    required: true,
    default: 1,
  },
  projectName: {
    type: String,
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  mobileNo: {
    type: String,
    default: '',
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
  requestedChanges: {
    type: String,
    required: true,
  },
  scopeOfRevision: {
    type: String,
    enum: ['Elevation Facade', 'Room Spatial Layout', 'Staircase / OTS Adjustment', 'Terrace Styling', 'Material & Color Palette', 'Full 3D Massing'],
    default: 'Elevation Facade',
  },
  status: {
    type: String,
    enum: ['Pending Review', 'In Modeling', 'Rendering Revision', 'Approved'],
    default: 'Pending Review',
  },
  priority: {
    type: String,
    enum: ['Normal', 'High', 'Urgent'],
    default: 'Normal',
  },
  assignedArchitect: {
    type: String,
    default: 'Karthi (Founder)',
  },
  resolutionNotes: {
    type: String,
    default: '',
  },
  resolvedDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Revision', revisionSchema);
