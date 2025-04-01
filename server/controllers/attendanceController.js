const Attendance = require('../models/Attendance');
const Worker = require('../models/Worker');

// @desc    Mark attendance
// @route   POST /api/v1/attendance
// @access  Private
exports.markAttendance = async (req, res) => {
  try {
    const { workerId, present = true, site } = req.body;

    // Verify worker exists
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    const attendance = await Attendance.create({
      worker: workerId,
      present,
      site,
      markedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: attendance
    });

  } catch (err) {
    console.error('Attendance Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance'
    });
  }
};

// @desc    Get all attendance records
// @route   GET /api/v1/attendance
// @access  Private
exports.getAttendance = async (req, res) => {
  try {
    // Add pagination (page=1&limit=10)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [attendance, total] = await Promise.all([
      Attendance.find()
        .skip(skip)
        .limit(limit)
        .populate('worker', 'name role')
        .populate('markedBy', 'username')
        .sort('-date'),
      Attendance.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      count: attendance.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: attendance
    });

  } catch (err) {
    console.error('Get Attendance Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records'
    });
  }
};

// @desc    Get single attendance record
// @route   GET /api/v1/attendance/:id
// @access  Private
exports.getSingleAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('worker', 'name role')
      .populate('markedBy', 'username');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: attendance
    });

  } catch (err) {
    console.error('Get Single Attendance Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance record'
    });
  }
};

// @desc    Update attendance record
// @route   PUT /api/v1/attendance/:id
// @access  Private
exports.updateAttendance = async (req, res) => {
  try {
    const { present, site } = req.body;

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { present, site },
      { 
        new: true,
        runValidators: true
      }
    ).populate('worker', 'name role');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: attendance
    });

  } catch (err) {
    console.error('Update Attendance Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update attendance record'
    });
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/v1/attendance/:id
// @access  Private
exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });

  } catch (err) {
    console.error('Delete Attendance Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete attendance record'
    });
  }
};