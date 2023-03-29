const Task = require('../models/taskModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { createResponse } = require('../utils/CreateResponse');
const crud = require('../utils/crudFactory');

exports.createTask = catchAsync(async (req, res, next) => {
  const doc = await Task.create({ ...req.body, userRef: req.user.id });
  req.user.tasks.push(doc.id);
  req.user.save();
  createResponse(doc, res, 201);
});

exports.deleteATask = crud.deleteOne(Task);
exports.updateATask = crud.updateOne(Task);
exports.findATask = crud.findOne(Task);
exports.findAll = crud.findAll(Task);
exports.deleteAllTasks = crud.deleteAll(Task);

exports.getMyTasks = catchAsync(async (req, res, next) => {
  const myTasks = await Task.find({ userRef: req.user.id });

  console.log(myTasks);
  if (myTasks.length === 0 || !myTasks) {
    return next(new AppError('No Tasks found ', 404));
  }

  createResponse(myTasks, res, 200);
});
