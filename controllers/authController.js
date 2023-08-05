const crypto = require('crypto')
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const user = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

const signToken = (id) => jwt.sign({id : id},process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_EXPIRES
    })

const sendToken = (currentUser,statusCode,res) => {
    const token = signToken(currentUser._id);
    const cookieOptions = {
        expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000 ),
        httpOnly : true
    };

    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt',token,cookieOptions)

    // Remove password from response
    currentUser.password = undefined;
    
    res.status(statusCode).json({
        status : 'Success',
        token,
        newUser : currentUser
    })
}

exports.signup = catchAsync(async (req,res,next) => {
    const newUser = await user.create({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password,
        passwordConfirm : req.body.passwordConfirm,
        passwordChangedAt : req.body.passwordChangedAt,
        role : req.body.role
    });

    sendToken(newUser,201,res);
})

exports.login = catchAsync(async(req,res,next) => {
    const {email,password} = req.body;

    if(!email || !password){
        return next(new AppError('Please provide valid Email and Password',400))
    }

    const loggedUser = await user.findOne({email}).select('+password');

    if(!loggedUser || !(await loggedUser.comparePassword(password,loggedUser.password))){
        return next(new AppError('Invalid email or password',401));
    }

    sendToken(loggedUser,200,res);
})

exports.protect = catchAsync(async (req,res,next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token){
        return next(new AppError('You are not logged in! Please Logged in to get access',401))
    }

    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);

    const currentUser = await user.findById(decoded.id);

    if(!currentUser){
        return next(new AppError('The user belonging to this token no longer available !',401))
    }

    if(currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed the password. Please login again !', 401))
    }

    req.user = currentUser
    next();
})

exports.restrictTo = (...roles) => (req,res,next) => {
    if(!roles.includes(req.user.role)){
        return next(new AppError('You do not have permission to remove tour',403))
    }
    next();
}

exports.forgotPassword = catchAsync(async (req,res,next) => {
    const currentUser =  await user.findOne({ email : req.body.email })
    if(!currentUser){
        return next(new AppError('There is no user available with this email address',404))
    }

    const resetPasswordToken = currentUser.createResetPasswordToken();
    await currentUser.save({ validateBeforeSave : false})

    const resetUrl = `${req.protocol}:${req.get('host')}/api/v1/users/resetPassword/${resetPasswordToken}`;
    const message = `Forgot your password ? Please submit your request with password and confirm password to ${resetUrl} Or if you didn't forgot password then Please ignore it`;

    try{
        await sendEmail({
            email : currentUser.email,
            subject : 'Your Forgot Password Token (valid for only 10 mins)',
            message : message
        })
    
        res.status(200).json({
            status : "success",
            message : 'Token sent to email!'
        })
    }catch(err){
        currentUser.resetPasswordToken = undefined;
        currentUser.resetPasswordExpire = undefined;
        await currentUser.save({ validateBeforeSave : false})

        console.log(err)
        return next(new AppError('There is an error sending an Email. Please try again later!'),500)
    }
    
})

exports.resetPassword = catchAsync(async (req,res,next) => {
    const hashedToken = crypto.createHash('SHA256').update(req.params.token).digest('hex');

    const currentUSer = await user.findOne({resetPasswordToken : hashedToken, resetPasswordExpire : {$gt : Date.now()}});

    if(!currentUSer){
        return next(new AppError('Invalid token or has been expired !',400));
    }

    currentUSer.password = req.body.password;
    currentUSer.passwordConfirm = req.body.passwordConfirm;
    currentUSer.resetPasswordToken = undefined;
    currentUSer.resetPasswordExpire = undefined;

    await currentUSer.save();

    sendToken(currentUSer,201,res);
})

exports.updatePassword = catchAsync(async (req,res,next) => {
    console.log(req.user)
    const currentUser = await user.findOne({_id : req.user._id}).select('+password');

    console.log(currentUser)

    if(!currentUser.comparePassword(req.body.currentPassword, currentUser.password)){
        return next(new AppError("Your current password is not correct"), 401)
    }

    currentUser.password = req.body.password;
    currentUser.passwordConfirm = req.body.passwordConfirm;

    await currentUser.save();

    sendToken(currentUser,201,res);
}) 

exports.deleteMe = catchAsync(async (req,res,next) =>{
    const currentUser = req.user;
    console.log(currentUser)

    await user.findByIdAndUpdate(currentUser._id,{ active : false});

    res.status(204).json({
        status : 'success',
        data : null
    })
})