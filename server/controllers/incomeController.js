const Income = require("../models/Income");

exports.getAllIncome = async (req, res) => {
    try {
        const incomes = await Income.find().sort({ date: -1 });
        res.json({ success: true, data: incomes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
};

exports.createIncome = async (req, res) => {
    try {
        const income = new Income(req.body);
        await income.save();
        res.status(201).json({ success: true, data: income });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
};

exports.deleteIncome = async (req, res) => {
    try {
        await Income.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Income deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
};
