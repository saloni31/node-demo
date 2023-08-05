const dotenv = require('dotenv');
// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

process.on('uncaughtException',err => {
  console.log('uncaughtException')
  console.log(err.name,err.message)
  process.exit(1)
})

const app = require('./app');

// const DB = process.env.DATABASE;
const DB = process.env.DATABASE.replace('<password>',process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('DB connection done suceesfully')
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('App running on port 3000');
});


process.on('unhandleRejection',err => {
  console.log(err.name,err.message)
  server.close(() => {
    process.exit(1)
  })
})
