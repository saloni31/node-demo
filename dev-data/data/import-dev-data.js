const fs = require('fs');
const dotenv = require('dotenv');
// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const Tour = require("../../models/tourModel");
const User = require("../../models/userModel");
const Review = require("../../models/reviewModel");

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<password>',process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('DB connection done suceesfully')
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'));

const importData = async () => {
  try{
    await Tour.create(tours);
    await User.create(users,{  validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data successfully inserted.');
    process.exit();
  }catch(err){
    console.log(err);
  }
  
}

const deleteData = async () => {
  try{
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted.')
    process.exit();
  }catch(err){
    console.log(err);
  }
}

if(process.argv[2] === '--import'){
  importData();
}else if(process.argv[2] === '--delete'){
  deleteData();
}