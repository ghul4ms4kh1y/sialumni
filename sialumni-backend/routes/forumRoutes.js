const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const { verifyToken, isAlumni } = require('../middleware/auth');

router.get('/', verifyToken, forumController.getAllPost);
router.get('/:id', verifyToken, forumController.getPostById);

router.post('/', verifyToken, isAlumni, forumController.createPost);
router.delete('/:id', verifyToken, forumController.deletePost);

router.post('/:id/komentar', verifyToken, isAlumni, forumController.addKomentar);
router.delete('/komentar/:komentarId', verifyToken, forumController.deleteKomentar);

module.exports = router;
