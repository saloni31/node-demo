const Review = require('../models/reviewModel')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Handler = require('./handlerFactory')

exports.setTourUserId = (req,res,next) => {
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    next();
}

exports.createReviews = Handler.createOne(Review)

exports.getAllReviews = Handler.getAll(Review)
exports.getAllReviews = catchAsync(async (req,res,next) => {
    let filter = {}

    if(req.params.tourId) filter = {tour : req.params.tourId}
    const reviews = await Review.find(filter);

    res.status(200).json({
        staus: "Success",
        results : reviews.length,
        reviews
    })
})

exports.deleteReview = Handler.deleteOne(Review)
exports.updateReview = Handler.updateOne(Review)
exports.getReviewById = Handler.getOne(Review)