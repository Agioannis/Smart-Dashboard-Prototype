const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a task title'],
            trim: true,
            maxlength: [200, 'Title cannot be more than 200 characters']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, 'Description cannot be more than 1000 characters']
        },
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'completed'],
            default: 'pending'
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        },
        dueDate: {
            type: Date
        },
        completed: {
            type: Boolean,
            default: false
        },
        tags: [{
            type: String,
            trim: true
        }],

        eventId: { type: String }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Task', taskSchema);
