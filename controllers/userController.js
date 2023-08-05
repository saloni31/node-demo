const user = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Handler = require('./handlerFactory');
const multer = require('multer');

const uploadStorage = multer.diskStorage({
    destination : (req,file,cb) =>{ 
        cb(null,"public/img/users");
    },

    filename : (req,file,cb) => {
        //user-userId-currentDate
        const ext = file.mimetype.split('/')[1];
        cb(null,`user-${req.user.id}-${Date.now()}.${ext}`)
    }
})

const multerFilter = (req,file,cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }else{
        cb(new AppError('Not an image ! Please upload only an image..',404),false)
    }
}
const upload = multer({
    storage : uploadStorage,
    fileFilter : multerFilter
});

exports.uploadUserPhoto = upload.single("photo");

exports.createUser = (req,res) => {
    res.status(500).json({
        status : 'error',
        message : 'This router is not defined yet !'
    })
}

exports.getMe = (req,res,next) => {
    req.params.id = req.user.id;
    next()
}

exports.getAllUsers = Handler.getAll(user)

exports.getUserById = Handler.getOne(user);

exports.updateUser = catchAsync( async (req,res,next) => {
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is noy use to update password'),200)
    }

    const filteredBody = filterObj(req.body,'name','email');
    if(req.file) filteredBody.photo = req.file.filename;

    const updatedUser = await user.findByIdAndUpdate(req.user.id,filteredBody,{
        new:true,
        runValidators:true
    });

    res.status(200).json({
        status: "success",
        updatedUser
    })
})

exports.deleteUser = Handler.deleteOne(user)