const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

//MIDDLEWARE

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRoutes);

module.exports = app;
