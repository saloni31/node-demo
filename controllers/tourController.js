/* eslint-disable node/no-unsupported-features/es-syntax */
// const fs = require('fs');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Handler = require('./handlerFactory')

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// exports.checkId = (req,res,next,val) => {
//     if(req.params.id * 1 >= tours.length){
//         return res.status(404).json({
//             status : 'fail',
//             message : 'Invalid Id'
//         })
//     }
//     next();
// }

// exports.checkBody = (req,res,next) => {
//     const {name,price} = req.body;
//     console.log(name);
//     console.log(price);
//     if(!name || !price){
//         return res.status(400).json({
//             status : 'fail',
//             message : 'Missing Name or Price.'
//         });
//     }
//     next();
// }

exports.aliasTop5Cheap = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,ratingAverage,price,summary,duration,difficulty';
  next();
};

exports.getAllTours = Handler.getAll(Tour)

exports.getTourById = Handler.getOne(Tour,{path : 'reviews'})

exports.createTour = Handler.createOne(Tour)

exports.updateTour = Handler.updateOne(Tour);

exports.deleteTour = Handler.deleteOne(Tour)

exports.tourStats = catchAsync(async (req,res,next) => {
  console.log(req.query)
  const stats = await Tour.aggregate([
      {
          $match : {ratingsAverage : {$gte : 4.5} }
      },
      {
          $group : {
              _id : { $toUpper : '$difficulty'},
              numTours  : { $sum : 1},
              numRatings: { $sum : '$ratingsQuantity'},
              avgRating : { $avg : '$ratingsAverage' },
              avgPrice  : { $avg: '$price' },
              minPrice  : { $min : '$price' },
              maxPrice  : { $max : '$price' }
          }
      },
      {
          $sort : { avgPrice : 1}
      },
      // {
      //     $match : { _id : { $ne : 'EASY'}}
      // }
  ]);

  res.status(200).json({
      status: 'success',
      stats
    });
})

exports.getMonthlyPlan = catchAsync(async (req,res,next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
      {
          $unwind : '$startDates'
      },
      {
          $match : {
              startDates : {
                  $gte : new Date(`${year}-01-01`) ,
                  $lte : new Date (`${year}-12-31`)
              }
          }
      },
      {
          $group : {
              _id : {$month : '$startDates'},
              numToursStart : {$sum : 1},
              tours : {$push : '$name'}
          }
      },
      {
          $addFields : { 'month' : '$_id'}
      },
      {
          $project : { _id : 0 }
      },
      {
          $sort : { numToursStart : -1 }
      },
      {
          $limit : 6
      }
  ]);

  res.status(200).json({
      status: 'success',
      plan
    });
})
