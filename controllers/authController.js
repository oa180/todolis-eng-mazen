const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const { createResponse } = require('../utils/CreateResponse');
const AppError = require('../utils/AppError');

// create jwt
const signToken = user => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Signup logic
exports.signup = catchAsync(async (req, res, next) => {
  // prevent assigning admin in signup
  if (req.body.role) delete req.body.role;
  const newuser = await User.create({ ...req.body });

  createResponse(newuser, res, 200);
});

// Signin logic
exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //   check if user provises email and password
  if (!email || !password)
    return next(new AppError('Please provide email and password!', 400));

  // check if email & password are correct

  const user = await User.findOne({ email });
  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError('Wrong email or password!', 401));
  }

  const token = signToken(user);
  createResponse(
    {
      id: user.id,
      name: user.fullname,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      role: user.role,
    },
    res,
    200,
    token
  );
});

// Assign Admin
exports.assignAdmin = catchAsync(async (req, res, next) => {
  const newAdmin = await User.findByIdAndUpdate(
    req.body.id,
    {
      role: 'admin',
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!newAdmin) return next(new AppError('No USer found!', 404));

  createResponse(
    {
      id: newAdmin.id,
      name: newAdmin.fullname,
      email: newAdmin.email,
      phone: newAdmin.phone,
      gender: newAdmin.gender,
      role: newAdmin.role,
    },
    res,
    200
  );
});

exports.protect = catchAsync(async (req, res, next) => {
  // Get jwt from header

  if (!req.headers.authorization)
    return next(
      new AppError(`You aren't looged in, please login and try again!`, 401)
    );

  const token = req.headers.authorization.split(' ').pop();
  // console.log(token);

  if (!token || token === 'null')
    return next(
      new AppError(`You aren't looged in, please login and try again!`, 401)
    );

  // verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError(`The user belonging to this token is no longer exists!`, 401)
    );

  // check if password chaned after signinin
  if (currentUser.passwordChangedAfter(decoded.iat))
    return next(
      new AppError(
        `Password changed after token is created, please login again!`,
        401
      )
    );

  req.user = currentUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(req.user);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`You don't have access to perform this action!`, 401)
      );
    }
    next();
  };
};
