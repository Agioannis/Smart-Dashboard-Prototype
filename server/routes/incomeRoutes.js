const express = require("express");
const router = express.Router();
const Income = require("../models/Income"); // Adjust path to your Income model

// Get all incomes, optionally with filters like category or search, add if needed
router.get("/", async (req, res) => {
    try {
        const incomes = await Income.find().sort({ date: -1 });
        res.json(incomes);
    } catch (err) {
        console.error("Error fetching incomes:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Create income
router.post("/", async (req, res) => {
    try {
        const newIncome = new Income(req.body);
        const savedIncome = await newIncome.save();
        res.status(201).json(savedIncome);
    } catch (err) {
        console.error("Error creating income:", err);
        res.status(400).json({ error: err.message });
    }
});

// Update income by id
router.put("/:id", async (req, res) => {
    try {
        const updatedIncome = await Income.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedIncome)
            return res.status(404).json({ error: "Income not found" });
        res.json(updatedIncome);
    } catch (err) {
        console.error("Error updating income:", err);
        res.status(400).json({ error: err.message });
    }
});

// Delete income by id
router.delete("/:id", async (req, res) => {
    try {
        const deletedIncome = await Income.findByIdAndDelete(req.params.id);
        if (!deletedIncome)
            return res.status(404).json({ error: "Income not found" });
        res.json({ message: "Income deleted" });
    } catch (err) {
        console.error("Error deleting income:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
