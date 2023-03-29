const AppError = require('./AppError');
const catchAsync = require('./catchAsync');
const { createResponse } = require('./CreateResponse');

// exports.createOne = model =>
//   catchAsync(async (req, res, next) => {
//     const doc = await model.create({ ...req.body, userRef: req.user.id });
//     createResponse(doc, res, 201);
//   });

exports.findOne = model =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findById(req.params.tid);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    createResponse(doc, res, 201);
  });

exports.findAll = model =>
  catchAsync(async (req, res, next) => {
    const doc = await model.find({});
    if (doc.length === 0 || !doc) {
      return next(new AppError('No document found ', 404));
    }
    createResponse(doc, res, 201);
  });

exports.deleteAll = model =>
  catchAsync(async (req, res, next) => {
    await model.deleteMany();

    createResponse('All Docs Deleted', res, 201);
  });

exports.updateOne = model =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findById(req.params.tid);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    if (doc.userRef != req.user.id)
      return next(new AppError('Itis not your task!!!!', 404));

    const updatedDoc = await model.findByIdAndUpdate(req.params.tid, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    createResponse(updatedDoc, res, 201);
  });

exports.deleteOne = model =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findById(req.params.tid);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    if (doc.userRef != req.user.id)
      return next(new AppError('Itis not your task!!!!', 404));

    await model.findByIdAndDelete(req.params.tid);

    createResponse('Task Deleted', res, 201);
  });
