const { Schema, model } = require('mongoose');

const TextSchema = new Schema({
 
  text: {
    type: String,
  },
  compressedText: {
    type: String,
  },
});


module.exports = model('Text', TextSchema);