const app = require('./app');
const connectDB = require('./config/database');
const calendarRoutes = require('./routes/calendarRoutes');
app.use('/api/calendar', calendarRoutes);


// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode`);
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log(`📋 API Docs: http://localhost:${PORT}/api`);
    console.log(`\n✅ Press Ctrl+C to stop\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`❌ Error: ${err.message}`);
    server.close(() => process.exit(1));
});
