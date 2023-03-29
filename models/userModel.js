const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, 'A user must have a name!'],
    },
    email: {
      type: String,
      required: [true, 'A user must have an email!'],
      unique: true,
      validate: [validator.isEmail, 'Please enter a valid email!'],
      lowercase: true,
    },
    phone: {
      type: String,
      unique: true,
      required: [true, 'A usesr must have a phone number!'],
      min: [11, 'Please provide a valid phone number!'],
      max: [11, 'Please provide a valid phone number!'],
    },
    dob: {
      type: Date,
      required: [true, 'A user must have a date of birth!'],
      validate: [validator.isDate, 'Please provide a valid date!'],
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female'],
        message: "Gender must me 'male' or 'female'!",
      },
      required: [true, 'A user must have a gender!'],
    },
    password: {
      type: String,
      reuired: [true, 'Please enter a password!'],
      minLength: [8, 'password must be greater than 8 letters!'],
    },
    passwordConfirm: {
      type: String,
      reuired: [true, 'Please enter a password confirm!'],
      minLength: [8, 'password must be greater than 8 letters!'],
      validate: {
        validator: function (el) {
          return this.password === el;
        },
        message: 'Password and password confirm must be identicals!',
      },
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'user'],
        message: 'Wrong role value!',
      },
      default: 'user',
    },
    tasks: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Task',
      },
    ],
    passwordChangedAt: Date,
    resetPasswordToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre('save', async function (next) {
  // passwoord encryption
  if (!this.isModified('password')) next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (providedPassword) {
  // check if password is correct
  return await bcrypt.compare(providedPassword, this.password);
};

userSchema.methods.passwordChangedAfter = function (tokenTimeStamp) {
  // check if password changed after token has been created
  if (!this.passwordChangedAt) return false;

  const changedTimeStamp = this.passwordChangedAt.getTime() / 1000;
  console.log(changedTimeStamp, tokenTimeStamp);
  return changedTimeStamp < tokenTimeStamp;
};

module.exports = mongoose.model('User', userSchema);
