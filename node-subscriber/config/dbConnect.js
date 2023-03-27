const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGODB);
    console.log('Mongo DB Connected');
  } catch (err) {
    console.error(err);

    //exit process w failure
    process.exit(1);
  }
};

module.exports = {
  connectDB,
};
