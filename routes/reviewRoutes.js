const express = require('express')
const reviewController = require('../controllers/reviewController')
const authController = require('../controllers/authController')

const Router = express.Router({ mergeParams : true});

Router.use(authController.protect)

// POST /reviews
// POST /tours/:tourId/reviews

Router
.route('/')
.get(reviewController.getAllReviews)
.post(authController.restrictTo('user'),reviewController.setTourUserId, reviewController.createReviews);

Router
 .route('/:id')
 .get(reviewController.getReviewById)
 .patch(authController.restrictTo('user','admin'),reviewController.updateReview)
 .delete(authController.restrictTo('user','admin'),reviewController.deleteReview)

module.exports = Router;