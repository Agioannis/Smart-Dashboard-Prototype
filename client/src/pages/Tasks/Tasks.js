import React, { useState, useEffect } from 'react';
import './Tasks.css';
import taskService from '../../services/taskService';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    // NEW: Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [tasksPerPage] = useState(5);

    // NEW: Sorting state
    const [sortBy, setSortBy] = useState('createdAt'); // 'createdAt', 'dueDate', 'priority'
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        dueDate: ''
    });

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await taskService.getAllTasks();
            setTasks(response.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingTask) {
                await taskService.updateTask(editingTask._id, formData);
            } else {
                await taskService.createTask(formData);
            }

            setShowModal(false);
            resetForm();
            fetchTasks();
        } catch (err) {
            console.error('Error saving task:', err);
            alert('Failed to save task. Please try again.');
        }
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
        });
        setShowModal(true);
    };

    const handleDeleteClick = (task) => {
        setTaskToDelete(task);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            await taskService.deleteTask(taskToDelete._id);
            setShowDeleteConfirm(false);
            setTaskToDelete(null);
            fetchTasks();
        } catch (err) {
            console.error('Error deleting task:', err);
            alert('Failed to delete task. Please try again.');
        }
    };

    const handleToggleComplete = async (task) => {
        try {
            await taskService.toggleTaskComplete(task._id, !task.completed);
            fetchTasks();
        } catch (err) {
            console.error('Error updating task:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            priority: 'medium',
            status: 'pending',
            dueDate: ''
        });
        setEditingTask(null);
    };

    const handleModalClose = () => {
        setShowModal(false);
        resetForm();
    };

    // NEW: Sorting function
    const sortTasks = (tasksToSort) => {
        return [...tasksToSort].sort((a, b) => {
            let compareValue = 0;

            switch (sortBy) {
                case 'createdAt':
                    compareValue = new Date(a.createdAt) - new Date(b.createdAt);
                    break;
                case 'dueDate':
                    const dateA = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
                    const dateB = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
                    compareValue = dateA - dateB;
                    break;
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    compareValue = priorityOrder[b.priority] - priorityOrder[a.priority];
                    break;
                default:
                    compareValue = 0;
            }

            return sortOrder === 'asc' ? compareValue : -compareValue;
        });
    };

    // Filter and search logic
    const filteredTasks = tasks.filter(task => {
        const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    // NEW: Apply sorting
    const sortedTasks = sortTasks(filteredTasks);

    // NEW: Pagination logic
    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = sortedTasks.slice(indexOfFirstTask, indexOfLastTask);
    const totalPages = Math.ceil(sortedTasks.length / tasksPerPage);

    // NEW: Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Reset to page 1 when filters/search/sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, searchQuery, sortBy, sortOrder]);

    // Stats calculation
    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        completed: tasks.filter(t => t.completed).length
    };

    if (loading) {
        return (
            <div className="tasks-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="tasks-container">
            {/* Page Header */}
            <div className="tasks-header">
                <div>
                    <h1 className="page-title">Tasks</h1>
                    <p className="page-subtitle">Manage and track your tasks</p>
                </div>
                <button className="btn-primary-custom" onClick={() => setShowModal(true)}>
                    <i className="bi bi-plus-circle"></i>
                    Add Task
                </button>
            </div>

            {/* Stats Cards */}
            <div className="tasks-stats">
                <div className="stat-item">
                    <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                        <i className="bi bi-list-task"></i>
                    </div>
                    <div>
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Tasks</div>
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
                        <i className="bi bi-clock-history"></i>
                    </div>
                    <div>
                        <div className="stat-value">{stats.pending}</div>
                        <div className="stat-label">Pending</div>
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-icon" style={{ background: '#dbeafe', color: '#3b82f6' }}>
                        <i className="bi bi-arrow-repeat"></i>
                    </div>
                    <div>
                        <div className="stat-value">{stats.inProgress}</div>
                        <div className="stat-label">In Progress</div>
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
                        <i className="bi bi-check-circle"></i>
                    </div>
                    <div>
                        <div className="stat-value">{stats.completed}</div>
                        <div className="stat-label">Completed</div>
                    </div>
                </div>
            </div>

            {/* Filters, Search and Sort */}
            <div className="tasks-controls">
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'in-progress' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('in-progress')}
                    >
                        In Progress
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('completed')}
                    >
                        Completed
                    </button>
                </div>

                {/* NEW: Sort Controls */}
                <div className="sort-controls">
                    <label htmlFor="sortBy">Sort by:</label>
                    <select
                        id="sortBy"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="createdAt">Date Created</option>
                        <option value="dueDate">Due Date</option>
                        <option value="priority">Priority</option>
                    </select>
                    <button
                        className="sort-order-btn"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    >
                        <i className={`bi bi-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
                    </button>
                </div>

                <div className="search-box">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Tasks List */}
            <div className="tasks-list">
                {currentTasks.length === 0 ? (
                    <div className="empty-state">
                        <i className="bi bi-inbox"></i>
                        <h3>No tasks found</h3>
                        <p>
                            {searchQuery ? 'Try a different search term' : 'Click "Add Task" to create your first task'}
                        </p>
                    </div>
                ) : (
                    currentTasks.map(task => (
                        <TaskCard
                            key={task._id}
                            task={task}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                            onToggleComplete={handleToggleComplete}
                        />
                    ))
                )}
            </div>

            {/* NEW: Pagination */}
            {sortedTasks.length > tasksPerPage && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    totalItems={sortedTasks.length}
                    itemsPerPage={tasksPerPage}
                />
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <TaskModal
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmit}
                    onClose={handleModalClose}
                    isEditing={!!editingTask}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <DeleteConfirmModal
                    task={taskToDelete}
                    onConfirm={confirmDelete}
                    onCancel={() => {
                        setShowDeleteConfirm(false);
                        setTaskToDelete(null);
                    }}
                />
            )}
        </div>
    );
};

// NEW: Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="pagination-container">
            <div className="pagination-info">
                Showing {startItem}-{endItem} of {totalItems} tasks
            </div>
            <div className="pagination-controls">
                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <i className="bi bi-chevron-left"></i>
                </button>

                {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                        <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                    ) : (
                        <button
                            key={page}
                            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </button>
                    )
                ))}

                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <i className="bi bi-chevron-right"></i>
                </button>
            </div>
        </div>
    );
};

// Task Card Component (same as before)
const TaskCard = ({ task, onEdit, onDelete, onToggleComplete }) => {
    const priorityColors = {
        high: { bg: '#fee2e2', color: '#991b1b' },
        medium: { bg: '#fef3c7', color: '#92400e' },
        low: { bg: '#dbeafe', color: '#1e40af' }
    };

    const statusConfig = {
        pending: { label: 'Pending', class: 'status-pending' },
        'in-progress': { label: 'In Progress', class: 'status-progress' },
        completed: { label: 'Completed', class: 'status-completed' }
    };

    const formatDate = (date) => {
        if (!date) return 'No due date';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className={`task-card ${task.completed ? 'completed' : ''}`}>
            <div className="task-card-main">
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggleComplete(task)}
                    className="task-checkbox-large"
                />
                <div className="task-card-content">
                    <h3 className="task-card-title">{task.title}</h3>
                    {task.description && (
                        <p className="task-card-description">{task.description}</p>
                    )}
                    <div className="task-card-meta">
                        <span
                            className="priority-badge"
                            style={{
                                backgroundColor: priorityColors[task.priority].bg,
                                color: priorityColors[task.priority].color
                            }}
                        >
                            <i className="bi bi-flag-fill"></i>
                            {task.priority}
                        </span>
                        <span className={`status-badge-large ${statusConfig[task.status].class}`}>
                            {statusConfig[task.status].label}
                        </span>
                        <span className="due-date">
                            <i className="bi bi-calendar3"></i>
                            {formatDate(task.dueDate)}
                        </span>
                    </div>
                </div>
            </div>
            <div className="task-card-actions">
                <button className="action-btn edit-btn" onClick={() => onEdit(task)} title="Edit">
                    <i className="bi bi-pencil"></i>
                </button>
                <button className="action-btn delete-btn" onClick={() => onDelete(task)} title="Delete">
                    <i className="bi bi-trash"></i>
                </button>
            </div>
        </div>
    );
};


// Task Modal Component
const TaskModal = ({ formData, setFormData, onSubmit, onClose, isEditing }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditing ? 'Edit Task' : 'Add New Task'}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="title">Task Title *</label>
                            <input
                                type="text"
                                id="title"
                                className="form-control"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                placeholder="Enter task title"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                className="form-control"
                                rows="4"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Add task description (optional)"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="priority">Priority</label>
                                <select
                                    id="priority"
                                    className="form-control"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="status">Status</label>
                                <select
                                    id="status"
                                    className="form-control"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="dueDate">Due Date</label>
                            <input
                                type="date"
                                id="dueDate"
                                className="form-control"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary-custom" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary-custom">
                            {isEditing ? 'Update Task' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Delete Confirmation Modal Component
const DeleteConfirmModal = ({ task, onConfirm, onCancel }) => {
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-container modal-small" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Delete Task</h2>
                    <button className="modal-close" onClick={onCancel}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="delete-confirm-content">
                        <i className="bi bi-exclamation-triangle"></i>
                        <p>Are you sure you want to delete this task?</p>
                        <p className="task-name">"{task?.title}"</p>
                        <p className="warning-text">This action cannot be undone.</p>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary-custom" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="btn-danger-custom" onClick={onConfirm}>
                        Delete Task
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Tasks;



