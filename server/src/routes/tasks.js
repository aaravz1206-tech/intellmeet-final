import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Fallback Model logic for Mongoose or Memory DB
import Task from '../models/Task.js';

// Check if mongoose model exists (let's define it in server/src/models/Task.js later)

// @desc    Get all Kanban tasks
// @route   GET /api/tasks
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let tasks = [];

    if (global.isMockDB) {
      tasks = global.mockDb.tasks;
    } else {
      tasks = await Task.find({}).sort({ createdAt: -1 });
    }

    res.json(tasks);
  } catch (error) {
    console.error('Fetch tasks error:', error);
    res.status(500).json({ message: 'Server error retrieving tasks' });
  }
});

// @desc    Create a new Kanban task
// @route   POST /api/tasks
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title, description, assignedTo, meetingId, status, priority, dueDate } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    let newTask = null;

    if (global.isMockDB) {
      newTask = {
        _id: new Date().getTime().toString(),
        title,
        description: description || '',
        assignedTo: assignedTo || 'Unassigned',
        meetingId: meetingId || '',
        status: status || 'todo',
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 3600000 * 24 * 7),
        creator: req.user.name,
        createdAt: new Date()
      };
      global.mockDb.tasks.push(newTask);
    } else {
      newTask = await Task.create({
        title,
        description: description || '',
        assignedTo: assignedTo || 'Unassigned',
        meetingId: meetingId || '',
        status: status || 'todo',
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 3600000 * 24 * 7),
        creator: req.user.name
      });
    }

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error creating task' });
  }
});

// @desc    Update task status / details
// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { id } = req.params;
  const { title, description, assignedTo, status, priority, dueDate } = req.body;

  try {
    let updatedTask = null;

    if (global.isMockDB) {
      const idx = global.mockDb.tasks.findIndex((t) => t._id.toString() === id && t.creator === req.user.name);
      if (idx !== -1) {
        if (title !== undefined) global.mockDb.tasks[idx].title = title;
        if (description !== undefined) global.mockDb.tasks[idx].description = description;
        if (assignedTo !== undefined) global.mockDb.tasks[idx].assignedTo = assignedTo;
        if (status !== undefined) global.mockDb.tasks[idx].status = status;
        if (priority !== undefined) global.mockDb.tasks[idx].priority = priority;
        if (dueDate !== undefined) global.mockDb.tasks[idx].dueDate = new Date(dueDate);
        updatedTask = global.mockDb.tasks[idx];
      }
    } else {
      // Prevent IDOR: Only creator can update
      updatedTask = await Task.findOneAndUpdate(
        { _id: id, creator: req.user.name },
        { title, description, assignedTo, status, priority, dueDate },
        { new: true }
      );
    }

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error updating task' });
  }
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  const { id } = req.params;

  try {
    let success = false;

    if (global.isMockDB) {
      const initialLength = global.mockDb.tasks.length;
      global.mockDb.tasks = global.mockDb.tasks.filter((t) => !(t._id.toString() === id && t.creator === req.user.name));
      success = global.mockDb.tasks.length < initialLength;
    } else {
      // Prevent IDOR: Only creator can delete
      const result = await Task.findOneAndDelete({ _id: id, creator: req.user.name });
      success = !!result;
    }

    if (!success) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error deleting task' });
  }
});

export default router;
