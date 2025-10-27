const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            required: [true, 'Please add an expense description'],
            trim: true,
            maxlength: [200, 'Description cannot be more than 200 characters']
        },
        amount: {
            type: Number,
            required: [true, 'Please add an amount'],
            min: [0, 'Amount cannot be negative']
        },
        category: {
            type: String,
            required: [true, 'Please add a category'],
            enum: ['Food', 'Transport', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping', 'Education', 'Software', 'Office', 'Marketing', 'Operations', 'Other'],
            default: 'Other'
        },
        date: {
            type: Date,
            default: Date.now
        },
        paymentMethod: {
            type: String,
            enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Other'],
            default: 'Cash'
        },
        status: {
            type: String,
            enum: ['Paid', 'Pending', 'Cancelled'],
            default: 'Paid'
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [500, 'Notes cannot be more than 500 characters']
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Expense', expenseSchema);
