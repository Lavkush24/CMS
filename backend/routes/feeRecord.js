const express = require('express');
const router = express.Router();

const Student = require('../models/Student');
const StudentBatch = require('../models/StudentBatch');
const FeeRecord = require('../models/FeeRecord');
const authMiddleware = require('../middleware/authmiddleware');


router.post('/:id', authMiddleware, async (req, res) => {

  try {

    const studentId = req.params.id;

    const {
      batchId,
      amountPaid,
      coveredMonths,
      paymentMethod,
      note
    } = req.body;


    // validation for batch
    if (!batchId) {
      return res.status(400).json({
        error: "Batch is required"
      });
    }

    if (!amountPaid || amountPaid <= 0) {
      return res.status(400).json({
        error: "Amount must be greater than 0"
      });
    }   

    // check that student exists
    const student = await Student.findOne({
      _id: studentId,
      ownerId: req.user.id
    });

    if (!student) {
      return res.status(404).json({
        error: "Student not found"
      });
    }

    
    // check student enrolled in the batch
    const enrollment = await StudentBatch.findOne({
      studentId,
      batchId,
      ownerId: req.user.id
    }).populate('batchId');

    if (!enrollment) {
      return res.status(404).json({
        error: "Student not enrolled in this batch"
      });
    }

    

    const feeRecord = await FeeRecord.create({

      studentId,

      batchId,

      ownerId: req.user.id,

      amountPaid,

      batchFees: enrollment.fees,

      coveredMonths: coveredMonths || [],

      paymentMethod: paymentMethod || 'CASH',

      note: note || '',

      isPartialPayment:
        amountPaid < enrollment.fees

    });

    res.status(201).json({
      message: "Fees recorded successfully",
      feeRecord
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Error recording fees"
    });
  }
});

router.get('/details/:id', authMiddleware, async (req, res) => {

  try {

    const studentId = req.params.id;

    // check student exists
    const student = await Student.findOne({
      _id: studentId,
      ownerId: req.user.id
    });

    if (!student) {
      return res.status(404).json({
        error: "Student not found"
      });
    }

    // finding all enrolled batches
    const enrollments = await StudentBatch.find({
      studentId,
      ownerId: req.user.id
    }).populate('batchId');

    
    // getting all feesRecords
    const feeRecords = await FeeRecord.find({
      studentId,
      ownerId: req.user.id
    });

    
    // batch details creating 
    const batchDetails = enrollments.map(enrollment => {

      const batchPayments = feeRecords.filter(fr =>
        fr.batchId.toString() ===
        enrollment.batchId._id.toString()
      );

      // total paid
      const totalPaid = batchPayments.reduce(
        (sum, p) => sum + p.amountPaid,
        0
      );

      // months since joined
      const joinedDate = new Date(enrollment.joinedAt);

      const today = new Date();

      const totalMonths =
        (today.getFullYear() - joinedDate.getFullYear()) * 12 +
        (today.getMonth() - joinedDate.getMonth()) + 1;

      // expected total
      const expectedFees =
        totalMonths * enrollment.fees;

      // remaining
      const remainingFees =
        Math.max(expectedFees - totalPaid, 0);

      return {

        batchId: enrollment.batchId._id,

        batchName: enrollment.batchId.name,

        subject: enrollment.batchId.subject,

        batchFees: enrollment.fees,

        joinedAt: enrollment.joinedAt,

        status: enrollment.status,

        totalMonths,

        expectedFees,

        totalPaid,

        remainingFees,

        paymentHistory: batchPayments.map(p => ({
          amountPaid: p.amountPaid,
          paymentMethod: p.paymentMethod,
          coveredMonths: p.coveredMonths,
          paidAt: p.paidAt
        }))
      };
    });

    // summary
    const totalExpected = batchDetails.reduce(
      (sum, b) => sum + b.expectedFees,
      0
    );

    const totalPaid = batchDetails.reduce(
      (sum, b) => sum + b.totalPaid,
      0
    );

    const totalRemaining = batchDetails.reduce(
      (sum, b) => sum + b.remainingFees,
      0
    );

    res.json({

      student: {
        _id: student._id,
        name: student.name,
        standard: student.standard,
        phone: student.phone
      },

      summary: {
        totalExpected,
        totalPaid,
        totalRemaining
      },

      batches: batchDetails
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Error fetching fee details"
    });
  }
});

module.exports = router;