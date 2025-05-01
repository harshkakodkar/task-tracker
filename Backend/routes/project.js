const express = require('express');
const mongoose = require('mongoose'); 
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, async (req, res) => {
  const projectCount = await Project.countDocuments({ userId: req.user._id });
  if (projectCount >= 4) return res.status(400).send('Max 4 projects allowed');

  const project = new Project({ ...req.body, userId: req.user._id });
  await project.save();
  res.send(project);
});

router.get('/', auth, async (req, res) => {
    try {
      const projects = await Project.find({ userId: req.user._id });
      res.send(projects);
    } catch (err) {
      res.status(500).send('Server error');
    }
  });


// DELETE a project
router.delete('/:id', auth, async (req, res) => {
  try {
    const projectId = req.params.id;

    // Validate the project ID
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).send('Invalid project ID');
    }

    // Find the project by ID
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).send('Project not found');
    }

    // Check if the project has any associated tasks
    const tasks = await Task.find({ projectId: project._id });
    if (tasks.length > 0) {
      return res.status(400).send('Project cannot be deleted because it has tasks');
    }

    // Delete the project
    await Project.findByIdAndDelete(projectId);
    res.send('Project deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
  

module.exports = router;


