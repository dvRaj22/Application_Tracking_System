const express = require('express');
const Application = require('../models/Application');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get overall analytics dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get counts by status
    const statusCounts = await Application.aggregate([
      { $match: { recruiter: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get counts by role
    const roleCounts = await Application.aggregate([
      { $match: { recruiter: userId } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get average experience
    const experienceStats = await Application.aggregate([
      { $match: { recruiter: userId } },
      {
        $group: {
          _id: null,
          averageExperience: { $avg: '$yearsOfExperience' },
          minExperience: { $min: '$yearsOfExperience' },
          maxExperience: { $max: '$yearsOfExperience' },
          totalCandidates: { $sum: 1 }
        }
      }
    ]);

    // Get monthly applications for the last 12 months
    const monthlyApplications = await Application.aggregate([
      { $match: { recruiter: userId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Get recent applications
    const recentApplications = await Application.find({ recruiter: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('candidateName role status createdAt');

    // Get status transition data (for funnel chart)
    const statusTransitions = await Application.aggregate([
      { $match: { recruiter: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgExperience: { $avg: '$yearsOfExperience' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get experience distribution for the chart
    const experienceDistribution = await Application.aggregate([
      { $match: { recruiter: userId } },
      {
        $bucket: {
          groupBy: '$yearsOfExperience',
          boundaries: [0, 2, 5, 8, 12, 15, 20, 25, 30],
          default: '30+',
          output: {
            count: { $sum: 1 }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate conversion rates with proper status mapping
    const totalApplied = statusCounts.find(s => s._id === 'applied')?.count || 0;
    const totalInterview = statusCounts.find(s => s._id === 'interview')?.count || 0;
    const totalOffer = statusCounts.find(s => s._id === 'offer')?.count || 0;
    const totalRejected = statusCounts.find(s => s._id === 'rejected')?.count || 0;

    const conversionRates = {
      appliedToInterview: totalApplied > 0 ? (totalInterview / totalApplied * 100).toFixed(1) : 0,
      interviewToOffer: totalInterview > 0 ? (totalOffer / totalInterview * 100).toFixed(1) : 0,
      offerToHire: totalOffer > 0 ? (totalOffer / totalOffer * 100).toFixed(1) : 100
    };

    // Format status counts for frontend
    const formattedStatusCounts = statusCounts.map(item => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      count: item.count,
      status: item._id
    }));

    res.json({
      success: true,
      data: {
        statusCounts: formattedStatusCounts,
        roleCounts,
        experienceStats: experienceStats[0] || {
          averageExperience: 0,
          minExperience: 0,
          maxExperience: 0,
          totalCandidates: 0
        },
        monthlyApplications,
        recentApplications,
        statusTransitions,
        conversionRates,
        summary: {
          totalCandidates: experienceStats[0]?.totalCandidates || 0,
          activeApplications: totalApplied + totalInterview,
          successfulPlacements: totalOffer,
          rejectionRate: totalApplied > 0 ? (totalRejected / totalApplied * 100).toFixed(1) : 0
        },
        experienceDistribution
      }
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analytics data' 
    });
  }
});

// Get detailed role analytics
router.get('/roles', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { role } = req.query;

    const matchStage = { recruiter: userId };
    if (role) {
      matchStage.role = { $regex: role, $options: 'i' };
    }

    const roleAnalytics = await Application.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$role',
          totalCandidates: { $sum: 1 },
          avgExperience: { $avg: '$yearsOfExperience' },
          statusBreakdown: {
            $push: {
              status: '$status',
              candidateName: '$candidateName',
              appliedDate: '$appliedDate'
            }
          }
        }
      },
      {
        $addFields: {
          statusCounts: {
            Applied: {
              $size: {
                $filter: {
                  input: '$statusBreakdown',
                  cond: { $eq: ['$$this.status', 'applied'] }
                }
              }
            },
            Interview: {
              $size: {
                $filter: {
                  input: '$statusBreakdown',
                  cond: { $eq: ['$$this.status', 'interview'] }
                }
              }
            },
            Offer: {
              $size: {
                $filter: {
                  input: '$statusBreakdown',
                  cond: { $eq: ['$$this.status', 'offer'] }
                }
              }
            },
            Rejected: {
              $size: {
                $filter: {
                  input: '$statusBreakdown',
                  cond: { $eq: ['$$this.status', 'rejected'] }
                }
              }
            }
          }
        }
      },
      { $sort: { totalCandidates: -1 } }
    ]);

    res.json({
      success: true,
      data: { roleAnalytics }
    });
  } catch (error) {
    console.error('Role analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch role analytics' 
    });
  }
});

// Get experience distribution
router.get('/experience', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const experienceDistribution = await Application.aggregate([
      { $match: { recruiter: userId } },
      {
        $bucket: {
          groupBy: '$yearsOfExperience',
          boundaries: [0, 2, 5, 8, 12, 15, 20, 25, 30],
          default: '30+',
          output: {
            count: { $sum: 1 },
            candidates: { $push: '$candidateName' }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: { experienceDistribution }
    });
  } catch (error) {
    console.error('Experience analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch experience analytics' 
    });
  }
});

// Get time-based analytics
router.get('/timeline', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = 'monthly', startDate, endDate } = req.query;

    let dateFormat, groupBy;
    if (period === 'weekly') {
      dateFormat = { $week: '$createdAt' };
      groupBy = { week: '$week', year: '$year' };
    } else if (period === 'daily') {
      dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
      groupBy = { date: '$date' };
    } else {
      dateFormat = { $month: '$createdAt' };
      groupBy = { month: '$month', year: '$year' };
    }

    const matchStage = { recruiter: userId };
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const timelineData = await Application.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          year: { $year: '$createdAt' },
          ...(period === 'monthly' && { month: { $month: '$createdAt' } }),
          ...(period === 'weekly' && { week: { $week: '$createdAt' } }),
          ...(period === 'daily' && { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } })
        }
      },
      {
        $group: {
          _id: groupBy,
          totalApplications: { $sum: 1 },
          byStatus: {
            $push: {
              status: '$status',
              candidateName: '$candidateName'
            }
          }
        }
      },
      {
        $addFields: {
          statusCounts: {
            Applied: {
              $size: {
                $filter: {
                  input: '$byStatus',
                  cond: { $eq: ['$$this.status', 'applied'] }
                }
              }
            },
            Interview: {
              $size: {
                $filter: {
                  input: '$byStatus',
                  cond: { $eq: ['$$this.status', 'interview'] }
                }
              }
            },
            Offer: {
              $size: {
                $filter: {
                  input: '$byStatus',
                  cond: { $eq: ['$$this.status', 'offer'] }
                }
              }
            },
            Rejected: {
              $size: {
                $filter: {
                  input: '$byStatus',
                  cond: { $eq: ['$$this.status', 'rejected'] }
                }
              }
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1, '_id.date': 1 } }
    ]);

    res.json({
      success: true,
      data: { timelineData, period }
    });
  } catch (error) {
    console.error('Timeline analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch timeline analytics' 
    });
  }
});

module.exports = router;
