const rateLimit = require('express-rate-limit')
const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const AppError = require('./utils/appError');
const globalError = require('./controllers/ErrorController');

const app = express();
// middleware to use req properties
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use(helmet())

// console.log(process.env.NODE_ENV);

// custom middleware
// app.use((req, res, next) => {
//   console.log('Hello from custom middleware');
//   next();
// });

// app.use((req, res, next) => {
//   req.requestedAt = new Date().toISOString();
//   next();
// });

const limiter = rateLimit({
    max : 100,
    windowsMs: 60 * 60 * 1000,
    message : "Too Many requests comes  from this IP, Please try again later !"
})

app.use("/api",limiter)

// parse request body , read data from req.body
app.use(express.json({limit : '10kb'}))

// Data sanitization against No SQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// Prevent parameter pollution
app.use(hpp({
    whitelist : ['duration','ratingsQuantity']
}))

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*',(req,res,next) => {
    next(new AppError('page not found',404));
})

app.use(globalError)

module.exports = app;
