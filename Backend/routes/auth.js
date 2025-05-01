const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');

router.post('/signup', async (req, res) => {
    try {
      const user = new User(req.body);
      await user.save();
  
      // Generate token after successful signup
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
      res.json({ message: 'User registered', token });
    } catch (e) {
      res.status(400).send(e.message);
    }
  });

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(400).send('Invalid credentials');

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  res.json({ token });
});

module.exports = router;
