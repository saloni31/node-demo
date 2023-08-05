const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require("../controllers/authController");
const reviewRoutes = require("./reviewRoutes");

const router = express.Router();

// router.param('id', tourController.checkId);
router.use('/:tourId/reviews',reviewRoutes)

router
  .route('/top-5-cheap')
  .get(tourController.aliasTop5Cheap, tourController.getAllTours);

router
  .route('/tour-stats')
  .get(tourController.tourStats);

router
  .route('/monthly-plan/:year')
  .get(authController.protect,authController.restrictTo('admin','lead-guide','guide'),tourController.getMonthlyPlan);

router

  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.updateTour)
  .delete(authController.protect,authController.restrictTo('admin','lead-guide'), tourController.deleteTour);

module.exports = router;
