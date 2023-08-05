const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync')
const APIFeatures = require('../utils/apiFeatures')

exports.deleteOne = Model => catchAsync(async (req, res,next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if(!doc){
        return next(new AppError('No Document Found With that ID',404))
    }
      res.status(204).json({
        status: 'success',
        data: null,
      });
  });

  exports.updateOne = Model => catchAsync(async (req, res,next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if(!doc){
        return next(new AppError('No Document Found With that ID',404))
      }

      res.status(201).json({
        status: 'success',
        doc,
      });
  });

  exports.createOne = Model => catchAsync(async (req, res,next) => {
    const doc = await Model.create(req.body);

    if(!doc){
      return next(new AppError('No Document Found With that ID',404))
    }

    res.status(201).json({
      status: 'success',
      doc,
    });
  });

  exports.getOne = (Model, populateOptions) => catchAsync(async (req, res,next) => {
    // const tour = await Tour.findById(req.params.id).populate('guides');
    let query = Model.findById(req.params.id);

    if(populateOptions) query = query.populate(populateOptions);

    const doc = await query;

    if(!doc){
      return next(new AppError('Record not found',404));
    }
    // doc.findOne({ _id : req.params.id })
    res.status(200).json({
      status: 'success',
      doc,
    });
  // const tour = tours.find(el => el.id === id);
});

exports.getAll = Model => catchAsync(async (req, res,next) => {
  const features = new APIFeatures(Model.find(), req.query)
    .filter()
    .sort()
    .limitingFields()
    .paginate();
  const docs = await features.query;

  if(!docs){
    return next(new AppError('Record not found',404));
  }

  res.status(200).json({
    status: 'success',
    results: docs.length,
    data: docs,
  });
});