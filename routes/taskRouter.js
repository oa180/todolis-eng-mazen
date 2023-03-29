const express = require('express');
const authController = require('../controllers/authController');
const taskController = require('../controllers/taskController');

const router = express.Router();

router.use(authController.protect);
router
  .route('')
  .get(taskController.findAll)
  .post(taskController.createTask)
  .delete(authController.restrictTo('admin'), taskController.deleteAllTasks);

router.get('/mytasks', taskController.getMyTasks);

router
  .route('/:tid')
  .get(taskController.findATask)
  .patch(taskController.updateATask)
  .delete(taskController.deleteATask);

// router.post('', taskController.createTask);

module.exports = router;
