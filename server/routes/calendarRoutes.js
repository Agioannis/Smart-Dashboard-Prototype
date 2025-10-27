const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Expense = require('../models/Expense');
const Income = require('../models/Income');

router.get('/events', async (req, res) => {
    try {
        const tasks = await Task.find({}, 'title dueDate');
        const expenses = await Expense.find({}, 'category date amount');
        const incomes = await Income.find({}, 'source date amount');

        const allEvents = [
            ...tasks.map(t => ({
                title: `Task: ${t.title}`,
                start: t.dueDate,
                color: '#2196f3',
            })),
            ...expenses.map(e => ({
                title: `Expense: ${e.category} - $${e.amount}`,
                start: e.date,
                color: '#e53935',
            })),
            ...incomes.map(i => ({
                title: `Income: ${i.source} +$${i.amount}`,
                start: i.date,
                color: '#43a047',
            })),
        ];

        res.json(allEvents);
    } catch (err) {
        console.error('Error fetching calendar data:', err);
        res.status(500).json({ error: 'Failed to load calendar data' });
    }
});

module.exports = router;
