const Revision = require('../models/Revision');
const Enquiry = require('../models/Enquiry');

// Get all revisions
const getRevisions = async (req, res) => {
  try {
    const { status, enquiryId } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (enquiryId) filter.enquiryId = enquiryId;

    const revisions = await Revision.find(filter)
      .populate('enquiryId', 'projectName clientName mobileNo status')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: revisions.length, data: revisions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new revision request
const createRevision = async (req, res) => {
  try {
    const { enquiryId, requestedChanges, scopeOfRevision, priority, assignedArchitect } = req.body;
    const enquiry = await Enquiry.findById(enquiryId);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    const prevCount = await Revision.countDocuments({ enquiryId });
    const revision = await Revision.create({
      enquiryId,
      revisionNo: prevCount + 1,
      projectName: enquiry.projectName,
      clientName: enquiry.clientName,
      mobileNo: enquiry.mobileNo,
      requestedChanges,
      scopeOfRevision: scopeOfRevision || 'Elevation Facade',
      priority: priority || 'Normal',
      assignedArchitect: assignedArchitect || 'Karthi (Founder)',
      status: 'Pending Review',
    });

    res.status(201).json({ success: true, data: revision, message: 'Revision created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update revision status or resolution
const updateRevision = async (req, res) => {
  try {
    const revision = await Revision.findById(req.params.id);
    if (!revision) {
      return res.status(404).json({ success: false, message: 'Revision not found' });
    }

    Object.assign(revision, req.body);
    if (req.body.status === 'Approved') {
      revision.resolvedDate = new Date();
    }
    await revision.save();

    res.json({ success: true, data: revision, message: 'Revision updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete revision
const deleteRevision = async (req, res) => {
  try {
    const revision = await Revision.findByIdAndDelete(req.params.id);
    if (!revision) {
      return res.status(404).json({ success: false, message: 'Revision not found' });
    }
    res.json({ success: true, message: 'Revision deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRevisions,
  createRevision,
  updateRevision,
  deleteRevision,
};
