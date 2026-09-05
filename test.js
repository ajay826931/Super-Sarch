const mongoose = require('mongoose');
require('dotenv').config({path: '.env.local'});
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Property = mongoose.model('Property', new mongoose.Schema({},{strict:false}), 'properties');
  const res = await Property.aggregate([
    { $lookup: { from: 'services', localField: '_id', foreignField: 'property_id', as: 'services' } }
  ]);
  console.log(JSON.stringify(res, null, 2));
  process.exit(0);
});
