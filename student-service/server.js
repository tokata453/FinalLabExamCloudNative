require('dotenv').config();

const bcrypt = require('bcryptjs');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Student = require('./models/Student');

const app = express();
const port = process.env.PORT || 3002;
app.use(express.json());

const withoutPassword = (student) => {
  const data = student.toObject ? student.toObject() : student;
  delete data.student_password;
  return data;
};

app.get('/health', (_req, res) => res.json({ service: 'student-service', status: 'ok' }));

app.get('/api/students/search', async (req, res) => {
  try {
    const { id, name } = req.query;
    if (!id && !name) return res.status(400).json({ message: 'Provide id or name to search.' });
    const filter = id
      ? { Student_id: id }
      : { Student_name: { $regex: name, $options: 'i' } };
    const students = await Student.find(filter).select('-student_password');
    return res.json({ count: students.length, students });
  } catch (error) {
    return res.status(500).json({ message: 'Search failed.', error: error.message });
  }
});

app.post('/api/students/login', async (req, res) => {
  try {
    const { student_email, student_password } = req.body;
    if (!student_email || !student_password) return res.status(400).json({ message: 'Email and password are required.' });
    const student = await Student.findOne({ student_email: student_email.toLowerCase() });
    if (!student || !(await bcrypt.compare(student_password, student.student_password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const token = jwt.sign({ studentId: student.Student_id, email: student.student_email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ message: 'Login successful.', token, student: withoutPassword(student) });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed.', error: error.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const changes = {};
    if (req.body.student_mobile) changes.student_mobile = req.body.student_mobile;
    if (req.body.student_password) changes.student_password = await bcrypt.hash(req.body.student_password, 10);
    if (!Object.keys(changes).length) return res.status(400).json({ message: 'Provide student_mobile or student_password to update.' });
    const student = await Student.findOneAndUpdate({ Student_id: req.params.id }, changes, { new: true });
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    return res.json({ message: 'Student updated successfully.', student: withoutPassword(student) });
  } catch (error) {
    return res.status(500).json({ message: 'Update failed.', error: error.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({ Student_id: req.params.id });
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    return res.json({ message: 'Student deleted successfully.', student: withoutPassword(student) });
  } catch (error) {
    return res.status(500).json({ message: 'Delete failed.', error: error.message });
  }
});

mongoose.connect(process.env.MONGO_URL)
  .then(() => app.listen(port, () => console.log(`Student Service running on port ${port}`)))
  .catch((error) => { console.error('MongoDB connection failed:', error.message); process.exit(1); });
