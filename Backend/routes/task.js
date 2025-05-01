const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.send(task);
});

router.get('/:projectId', auth, async (req, res) => {
  const tasks = await Task.find({ projectId: req.params.projectId });
  res.send(tasks);
});

router.put('/:id', auth, async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.send(task);
});

router.delete('/:id', auth, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.send({ message: 'Deleted' });
});

module.exports = router;
