const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  active: { type: Boolean,  default: true },
  title: { type: String,  default: '後台管理人員' },
}, { timestamps: { createdAt: 'created_at' } });

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;