import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import taskService from '../../services/taskService';
import expenseService from '../../services/expenseService';

const Dashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // NEW: Pagination and sorting for tasks
    const [taskPage, setTaskPage] = useState(1);
    const [taskSortBy, setTaskSortBy] = useState('createdAt');
    const tasksPerPage = 5;

    const [stats, setStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        activeTasks: 0,
        totalExpenses: 0,
        monthlyBudget: 5000,
        budgetUsed: 0
    });

    // Fetch data on component mount
    useEffect(() => {
        fetchData();
    }, []);

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch tasks and expenses concurrently
            const [tasksResponse, expensesResponse] = await Promise.all([
                taskService.getAllTasks(),
                expenseService.getAllExpenses()
            ]);

            const fetchedTasks = tasksResponse.data || [];
            const fetchedExpenses = expensesResponse.data || [];

            setTasks(fetchedTasks);
            setExpenses(fetchedExpenses);

            // Calculate stats
            const completedCount = fetchedTasks.filter(t => t.completed).length;
            const totalExpenseAmount = expensesResponse.total || 0;
            const budgetUsedPercent = ((totalExpenseAmount / 5000) * 100).toFixed(1);

            setStats({
                totalTasks: fetchedTasks.length,
                completedTasks: completedCount,
                activeTasks: fetchedTasks.length - completedCount,
                totalExpenses: totalExpenseAmount,
                monthlyBudget: 5000,
                budgetUsed: budgetUsedPercent
            });

            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data. Make sure the server is running.');
            setLoading(false);
        }
    };

    const handleToggleTask = async (taskId, currentStatus) => {
        try {
            await taskService.toggleTaskComplete(taskId, !currentStatus);
            fetchData(); // Refresh data
        } catch (err) {
            console.error('Error updating task:', err);
        }
    };

    // NEW: Sort tasks function
    const sortTasks = (tasksToSort) => {
        return [...tasksToSort].sort((a, b) => {
            switch (taskSortBy) {
                case 'createdAt':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'dueDate':
                    const dateA = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
                    const dateB = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
                    return dateA - dateB;
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                default:
                    return 0;
            }
        });
    };

    // NEW: Apply pagination to tasks
    const sortedTasks = sortTasks(tasks);
    const paginatedTasks = sortedTasks.slice(
        (taskPage - 1) * tasksPerPage,
        taskPage * tasksPerPage
    );
    const totalTaskPages = Math.ceil(tasks.length / tasksPerPage);

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="error-state">
                    <i className="bi bi-exclamation-triangle"></i>
                    <h3>Error Loading Data</h3>
                    <p>{error}</p>
                    <button className="btn-primary-custom" onClick={fetchData}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header Section */}
            <div className="dashboard-header">
                <div className="header-content">
                    <h1 className="page-title">Dashboard Overview</h1>
                    <div className="header-meta">
                        <span className="date-display">{formatDate(currentTime)}</span>
                        <span className="time-display">{formatTime(currentTime)}</span>
                    </div>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="metrics-grid">
                <MetricCard
                    title="Total Tasks"
                    value={stats.totalTasks}
                    subtitle={`${stats.activeTasks} active`}
                    trend="+12%"
                    trendPositive={true}
                    icon="clipboard-data"
                />
                <MetricCard
                    title="Completion Rate"
                    value={stats.totalTasks > 0 ? `${((stats.completedTasks / stats.totalTasks) * 100).toFixed(0)}%` : '0%'}
                    subtitle={`${stats.completedTasks}/${stats.totalTasks} completed`}
                    trend="+5%"
                    trendPositive={true}
                    icon="check-circle"
                />
                <MetricCard
                    title="Total Expenses"
                    value={`$${stats.totalExpenses.toLocaleString()}`}
                    subtitle="This month"
                    trend="-8%"
                    trendPositive={true}
                    icon="wallet2"
                />
                <MetricCard
                    title="Budget Status"
                    value={`${stats.budgetUsed}%`}
                    subtitle={`$${(stats.monthlyBudget - stats.totalExpenses).toLocaleString()} remaining`}
                    trend="On track"
                    trendPositive={true}
                    icon="graph-up-arrow"
                />
            </div>

            {/* Main Content Grid */}
            <div className="content-grid">
                {/* Tasks Panel with Sort and Pagination */}
                <div className="panel tasks-panel">
                    <div className="panel-header">
                        <h2 className="panel-title">
                            <i className="bi bi-list-task"></i>
                            Recent Tasks
                        </h2>
                        <div className="panel-controls">
                            <select
                                value={taskSortBy}
                                onChange={(e) => {
                                    setTaskSortBy(e.target.value);
                                    setTaskPage(1); // Reset to first page when sorting changes
                                }}
                                className="sort-select-small"
                            >
                                <option value="createdAt">Date Created</option>
                                <option value="dueDate">Due Date</option>
                                <option value="priority">Priority</option>
                            </select>
                            <button className="btn-secondary-sm" onClick={fetchData}>
                                <i className="bi bi-arrow-clockwise"></i> Refresh
                            </button>
                        </div>
                    </div>
                    <div className="panel-body">
                        {tasks.length === 0 ? (
                            <p className="empty-state">No tasks yet. Create your first task!</p>
                        ) : (
                            <>
                                {paginatedTasks.map((task) => (
                                    <TaskItem
                                        key={task._id}
                                        task={task}
                                        onToggle={handleToggleTask}
                                    />
                                ))}
                                {tasks.length > tasksPerPage && (
                                    <div className="dashboard-pagination">
                                        <button
                                            className="pagination-arrow"
                                            onClick={() => setTaskPage(Math.max(1, taskPage - 1))}
                                            disabled={taskPage === 1}
                                        >
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                        <span className="pagination-info">
                                            Page {taskPage} of {totalTaskPages}
                                        </span>
                                        <button
                                            className="pagination-arrow"
                                            onClick={() => setTaskPage(Math.min(totalTaskPages, taskPage + 1))}
                                            disabled={taskPage === totalTaskPages}
                                        >
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Quick Stats Panel */}
                <div className="panel stats-panel">
                    <div className="panel-header">
                        <h2 className="panel-title">
                            <i className="bi bi-bar-chart-line"></i>
                            Analytics
                        </h2>
                    </div>
                    <div className="panel-body">
                        <ProgressBar
                            label="Tasks Completed"
                            value={stats.totalTasks > 0 ? ((stats.completedTasks / stats.totalTasks) * 100).toFixed(0) : 0}
                            color="#2563eb"
                        />
                        <ProgressBar
                            label="Budget Utilization"
                            value={stats.budgetUsed}
                            color="#059669"
                        />
                        <ProgressBar
                            label="Weekly Goals"
                            value={62}
                            color="#d97706"
                        />
                        <ProgressBar
                            label="Project Progress"
                            value={88}
                            color="#7c3aed"
                        />
                    </div>
                </div>
            </div>
            <button
                className="btn-primary-custom"
                style={{ marginTop: '1rem' }}
                onClick={() => window.location.href = '/ai-insights'}
            >
                Get AI Insights 🧠
            </button>


            {/* Expenses Table */}
            <div className="panel expenses-panel">
                <div className="panel-header">
                    <h2 className="panel-title">
                        <i className="bi bi-receipt"></i>
                        Recent Transactions
                    </h2>
                    <button className="btn-secondary-sm" onClick={fetchData}>
                        <i className="bi bi-arrow-clockwise"></i> Refresh
                    </button>
                </div>
                <div className="panel-body">
                    {expenses.length === 0 ? (
                        <p className="empty-state">No expenses yet. Add your first expense!</p>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(expenses) && expenses.slice(0, 5).map(expense => (
                                    <ExpenseRow key={expense._id} expense={expense} />
                                ))}
                            </tbody>

                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

// Metric Card Component
const MetricCard = ({ title, value, subtitle, trend, trendPositive, icon }) => (
    <div className="metric-card">
        <div className="metric-icon">
            <i className={`bi bi-${icon}`}></i>
        </div>
        <div className="metric-content">
            <div className="metric-label">{title}</div>
            <div className="metric-value">{value}</div>
            <div className="metric-footer">
                <span className="metric-subtitle">{subtitle}</span>
                <span className={`metric-trend ${trendPositive ? 'positive' : 'negative'}`}>
                    <i className={`bi bi-arrow-${trendPositive ? 'up' : 'down'}`}></i>
                    {trend}
                </span>
            </div>
        </div>
    </div>
);

// Task Item Component
const TaskItem = ({ task, onToggle }) => {
    const statusConfig = {
        'completed': { label: 'Completed', class: 'status-completed' },
        'in-progress': { label: 'In Progress', class: 'status-progress' },
        'pending': { label: 'Pending', class: 'status-pending' }
    };

    const priorityConfig = {
        'high': { class: 'priority-high' },
        'medium': { class: 'priority-medium' },
        'low': { class: 'priority-low' }
    };

    const formatDueDate = (date) => {
        if (!date) return 'No due date';
        const dueDate = new Date(date);
        const today = new Date();
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays < 0) return 'Overdue';
        return dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className={`task-item ${task.completed ? 'completed' : ''}`}>
            <div className="task-checkbox">
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggle(task._id, task.completed)}
                />
            </div>
            <div className="task-content">
                <div className="task-title">{task.title}</div>
                <div className="task-meta">
                    <span className={`task-priority ${priorityConfig[task.priority].class}`}>
                        {task.priority}
                    </span>
                    <span className="task-due">{formatDueDate(task.dueDate)}</span>
                </div>
            </div>
            <div className={`task-status ${statusConfig[task.status].class}`}>
                {statusConfig[task.status].label}
            </div>
        </div>
    );
};

// Progress Bar Component
const ProgressBar = ({ label, value, color }) => (
    <div className="progress-item">
        <div className="progress-header">
            <span className="progress-label">{label}</span>
            <span className="progress-value">{value}%</span>
        </div>
        <div className="progress-bar-container">
            <div
                className="progress-bar-fill"
                style={{ width: `${value}%`, backgroundColor: color }}
            ></div>
        </div>
    </div>
);

// Expense Row Component
const ExpenseRow = ({ expense }) => {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <tr>
            <td>{formatDate(expense.date)}</td>
            <td><span className="category-badge">{expense.category}</span></td>
            <td>{expense.description}</td>
            <td className="amount">${expense.amount.toFixed(2)}</td>
            <td>
                <span className={`status-badge ${expense.status === 'Paid' ? 'status-paid' : 'status-pending'}`}>
                    {expense.status}
                </span>
            </td>
        </tr>
    );
};

export default Dashboard;
