const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: String,
  mobile: String,
  workplace: String,
  line: String,
  note: String,
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'Employee', // 指定關聯到Employee集合
    required: true
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'modified_at' } });

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;