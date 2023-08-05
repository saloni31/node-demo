const crypto = require('crypto')
const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name.'],
        trim: true,
        // maxlength : [40, 'A tour name must be less or equal to 40 characters'],
        // minlength : [10, 'A tour name must be greater or equal to 10 characters'],
        // validate  : [validator.isAlpha, 'A tour name only be contains characters']
      },
    email: {
        type:String,
        trim:true,
        required: [true,'Please provide your email.'],
        unique:true,
        lowercase:true,
        validate: [validator.isEmail,'Please provide a valid email']
    },
    photo: {
        type: String,
    },
    role: {
        type : String,
        enum: ['user','guide','lead-guide','admin'],
        default : 'user'
    },
    password: {
        type:String,
        required: [true, 'A user must have password'],
        select : false
    },
    passwordConfirm:{
        type:String,
        required: [true, 'Please confirm your password'],
        validate: 
        {
            validator: function(el){
                return el === this.password
            },
            message: "Password should match with confirm password"
        }
    },

    passwordChangedAt : Date,
    resetPasswordToken : String,
    resetPasswordExpire : Date,
    active : {
        type : Boolean,
        default : true,
        select : false
    }
    
})

userSchema.pre('save',async function(next) {
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password,12);

    this.passwordConfirm = undefined;

    next();

})

userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now();
    next();
})

userSchema.pre(/^find/,function(next) {
    this.find({active : {$ne : false}});
    next()
})

userSchema.methods.comparePassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
}

userSchema.methods.changedPasswordAfter = function(JwtTimeStamp){
    if(this.passwordChangedAt){
        const changedPasswordTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JwtTimeStamp < changedPasswordTimeStamp;
    }
    return false;
}

userSchema.methods.createResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.resetPasswordToken = crypto.createHash('SHA256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

const user = mongoose.model('User',userSchema);
module.exports = user;