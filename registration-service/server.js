require('dotenv').config();

const bcrypt = require('bcryptjs');
const express = require('express');
const mongoose = require('mongoose');
const Student = require('./models/Student');

const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());

app.get('/health', (_req, res) => res.json({ service: 'registration-service', status: 'ok' }));

app.post('/api/register', async (req, res) => {
  try {
    const { Student_id, Student_name, student_mobile, student_email, student_password } = req.body;
    if (!Student_id || !Student_name || !student_mobile || !student_email || !student_password) {
      return res.status(400).json({ message: 'All student fields are required.' });
    }

    const existing = await Student.findOne({
      $or: [{ Student_id }, { student_email: student_email.toLowerCase() }]
    });
    if (existing) return res.status(409).json({ message: 'Student ID or email already exists.' });

    const student = await Student.create({
      Student_id,
      Student_name,
      student_mobile,
      student_email,
      student_password: await bcrypt.hash(student_password, 10)
    });

    const response = student.toObject();
    delete response.student_password;
    return res.status(201).json({ message: 'Student registered successfully.', student: response });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
});

mongoose.connect(process.env.MONGO_URL)
  .then(() => app.listen(port, () => console.log(`Registration Service running on port ${port}`)))
  .catch((error) => { console.error('MongoDB connection failed:', error.message); process.exit(1); });
