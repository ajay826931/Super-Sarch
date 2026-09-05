const mongoose = require('mongoose');
require('dotenv').config({path: '.env.local'});
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Service = mongoose.model('Service', new mongoose.Schema({},{strict:false}), 'services');
  await Service.updateOne({ _id: '6a9962eeabf196d5ec5c99b4' }, { $set: { category: 'Mess' } });
  console.log('Fixed category back to Mess');
  process.exit(0);
});
