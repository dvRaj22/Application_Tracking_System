const express = require('express');
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all applications with filtering and pagination
router.get('/', auth, async (req, res) => {
  try {
    const { 
      status, 
      role, 
      experience, 
      search, 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { recruiter: req.user._id };
    
    // Apply filters
    if (status) filter.status = status;
    if (role) filter.role = { $regex: role, $options: 'i' };
    if (experience) {
      const exp = parseInt(experience);
      if (!isNaN(exp)) {
        filter.yearsOfExperience = { $gte: exp };
      }
    }
    if (search) {
      filter.$or = [
        { candidateName: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const applications = await Application.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('recruiter', 'name email');

    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Fetch applications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch applications' 
    });
  }
});

// Get application by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      recruiter: req.user._id
    }).populate('recruiter', 'name email');

    if (!application) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }

    res.json({
      success: true,
      data: { application }
    });
  } catch (error) {
    console.error('Fetch application error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch application' 
    });
  }
});

// Create new application
router.post('/', auth, [
  body('candidateName').trim().isLength({ min: 2 }),
  body('role').trim().isLength({ min: 2 }),
  body('yearsOfExperience').isInt({ min: 0, max: 50 }),
  body('resumeLink').optional().isURL()
], async (req, res) => {
  try {
    console.log('Received application data:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { candidateName, role, yearsOfExperience, resumeLink, notes } = req.body;

    // Clean up resumeLink if it's empty string
    if (resumeLink === '') {
      resumeLink = undefined;
    }

    const application = new Application({
      candidateName,
      role,
      yearsOfExperience,
      resumeLink: resumeLink || '',
      notes: notes || '',
      recruiter: req.user._id
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create application' 
    });
  }
});

// Update application
router.put('/:id', auth, [
  body('candidateName').optional().trim().isLength({ min: 2 }),
  body('role').optional().trim().isLength({ min: 2 }),
  body('yearsOfExperience').optional().isInt({ min: 0, max: 50 }),
  body('resumeLink').optional().isURL(),
  body('status').optional().isIn(['applied', 'interview', 'offer', 'rejected'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      recruiter: req.user._id
    });

    if (!application) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        application[key] = req.body[key];
      }
    });

    await application.save();

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update application' 
    });
  }
});

// Update application status (for drag and drop)
router.patch('/:id/status', auth, [
  body('status').isIn(['applied', 'interview', 'offer', 'rejected'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { status } = req.body;

    const application = await Application.findOneAndUpdate(
      {
        _id: req.params.id,
        recruiter: req.user._id
      },
      { 
        status,
        lastUpdated: new Date()
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update application status' 
    });
  }
});

// Delete application
router.delete('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      recruiter: req.user._id
    });

    if (!application) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete application' 
    });
  }
});

module.exports = router;
