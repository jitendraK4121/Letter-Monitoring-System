const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');

// Placeholder for course controller - we'll implement these functions later
const courseController = {
    getAllCourses: (req, res) => {
        res.status(200).json({
            status: 'success',
            message: 'Get all courses route - To be implemented'
        });
    },
    getCourse: (req, res) => {
        res.status(200).json({
            status: 'success',
            message: `Get course ${req.params.id} route - To be implemented`
        });
    },
    createCourse: (req, res) => {
        res.status(201).json({
            status: 'success',
            message: 'Create course route - To be implemented'
        });
    },
    updateCourse: (req, res) => {
        res.status(200).json({
            status: 'success',
            message: `Update course ${req.params.id} route - To be implemented`
        });
    },
    deleteCourse: (req, res) => {
        res.status(200).json({
            status: 'success',
            message: `Delete course ${req.params.id} route - To be implemented`
        });
    }
};

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourse);

// Protected routes (require authentication)
router.use(protect);

// Restricted to instructors and admins
router.post('/', restrictTo('instructor', 'admin'), courseController.createCourse);
router.patch('/:id', restrictTo('instructor', 'admin'), courseController.updateCourse);
router.delete('/:id', restrictTo('instructor', 'admin'), courseController.deleteCourse);

module.exports = router; 