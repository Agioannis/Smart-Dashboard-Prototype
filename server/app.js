const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const taskRoutes = require('./routes/taskRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const aiRoutes = require("./routes/aiRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const calendarRoutes = require('./routes/calendarRoutes');


const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Mount routes before 404 handler
app.use('/api/tasks', taskRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use("/api/ai", aiRoutes);
app.use('/api/calendar', calendarRoutes);


app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'Smart Dashboard API',
        version: '1.0.0',
        endpoints: {
            tasks: '/api/tasks',
            expenses: '/api/expenses',
            income: '/api/income',
            health: '/api/health',
            ai: '/api/ai/analyze'
        }
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;
