import api from './api';

const taskService = {
    // Get all tasks
    getAllTasks: async () => {
        try {
            const response = await api.get('/tasks');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get single task
    getTask: async (id) => {
        try {
            const response = await api.get(`/tasks/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Create new task
    createTask: async (taskData) => {
        try {
            const response = await api.post('/tasks', taskData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update task
    updateTask: async (id, taskData) => {
        try {
            const response = await api.put(`/tasks/${id}`, taskData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete task
    deleteTask: async (id) => {
        try {
            const response = await api.delete(`/tasks/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Toggle task completion
    toggleTaskComplete: async (id, completed) => {
        try {
            const response = await api.put(`/tasks/${id}`, {
                completed: completed,
                status: completed ? 'completed' : 'in-progress'
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default taskService;
