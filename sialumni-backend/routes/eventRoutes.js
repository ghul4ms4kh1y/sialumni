const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { verifyToken, isAdmin, isAlumni } = require('../middleware/auth');

router.get('/', verifyToken, eventController.getAllEvent);
router.get('/:id', verifyToken, eventController.getEventById);

router.post('/', verifyToken, isAdmin, eventController.createEvent);
router.put('/:id', verifyToken, isAdmin, eventController.updateEvent);
router.delete('/:id', verifyToken, isAdmin, eventController.deleteEvent);

router.post('/:id/rsvp', verifyToken, isAlumni, eventController.rsvpEvent);

module.exports = router;
