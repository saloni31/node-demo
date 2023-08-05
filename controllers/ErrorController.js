const AppError = require('../utils/appError');

const sendDevError = (err,res) => {
    res.status(err.statusCode).json({
        status : err.status,
        message : err.message,
        trace : err.trace
    })
}

const sendProdError = (err,res) => {
    if(err.isOperational){
        res.status(err.statusCode).json({
            status : err.status,
            message : err.message,
        })
    }else{
        
        res.status(500).json({
            status : 'error',
            message : 'internal server error'
        })
    }
    
}

const handleCastError = (err) => new AppError(`Invalid ${err.path}: ${err.value}`,404)

const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const msg = `Duplicate field value: ${value} .Please use another`;
    return new AppError(msg,404)
}

const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const msg = errors.join('. ');
    return new AppError(msg,404)
}

const handleJWTError = err => new AppError('Invalid token. Please logged in again !',401);

const handleJWTExpireError = err => new AppError('Yout token has been expired. Please logged in again !',401);

module.exports = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if(process.env.NODE_ENV.trim() === 'development'){
        sendDevError(err,res);
    }else if(process.env.NODE_ENV.trim() === 'production'){
        if(err.name === 'CastError'){
            err = handleCastError(err);
        }

        if(err.code === 11000) err = handleDuplicateFieldsDB(err)

        if(err.name === 'ValidationError') err = handleValidationError(err)

        if(err.name === 'JsonWebTokenError') err = handleJWTError(err)

        if(err.name === 'TokenExpiredError') err = handleJWTExpireError(err)

        sendProdError(err,res);

    }
}