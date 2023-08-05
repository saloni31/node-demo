const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    review : {
        type : String,
        required : [true,'Please provide review for a tour']
    },
    rating:{
        type : Number,
        min : 1,
        max : 5,
        required : [true,'Please provide ratings for a tour']
    },
    createdAt:{
        type : Date,
        default : Date.now()
    },
    tour:{
            type: mongoose.Schema.ObjectId,
            ref:'Tour',
            required : [true,'Review must belongs to tour']
        },
    user : {
            type : mongoose.Schema.ObjectId,
            ref : 'User',
            required : [true,'user must belongs to tour']
        }
},
{
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
})

reviewSchema.pre(/^find/, function(next){
    this.populate({
        path:'user',
        select: 'name'
    }).populate({
        path:'tour',
        select:'name'
    })

    next();
})

const Review = mongoose.model('Review' , reviewSchema);

module.exports = Review;