const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense'); // adjust path to your model

// GET /api/expenses?category=Food&search=rent
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/expenses - create new expense
router.post('/', async (req, res) => {
  try {
    const newExpense = new Expense(req.body);
    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (err) {
    console.error('Error creating expense:', err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/expenses/:id - update expense
router.put('/:id', async (req, res) => {
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(updatedExpense);
  } catch (err) {
    console.error('Error updating expense:', err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/expenses/:id - delete expense
router.delete('/:id', async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
    if (!deletedExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
