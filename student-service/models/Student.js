const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    Student_id: { type: String, required: true, unique: true, trim: true },
    Student_name: { type: String, required: true, trim: true },
    student_mobile: { type: String, required: true, trim: true },
    student_email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    student_password: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
