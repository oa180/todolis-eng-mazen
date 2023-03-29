const express = require('express');
const globalErrorHandler = require('./controllers/errorController');
const authRouter = require('./routes/authRouter');
const taskRouter = require('./routes/taskRouter');

const app = express();

app.use(express.json());

app.use('/auth', authRouter);
app.use('/task', taskRouter);

app.use(globalErrorHandler);

module.exports = app;
