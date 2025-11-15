const mongoose = require('mongoose');

const SharedCodeSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  codeContent: {
    html: { type: String, default: '' },
    css: { type: String, default: '' },
    js: { type: String, default: '' }
  },
  senderEmail: { type: String, required: true },
  receiverEmail: { type: String, required: true },
  date: { type: Date, default: Date.now },
  link: { type: String, required: true }
});

module.exports = mongoose.model('SharedCode', SharedCodeSchema);
