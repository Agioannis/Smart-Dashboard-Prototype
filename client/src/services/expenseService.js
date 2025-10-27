import api from './api';

const getAllExpenses = (params) => api.get('/expenses', { params });
const createExpense = (data) => api.post('/expenses', data);
const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);
const deleteExpense = (id) => api.delete(`/expenses/${id}`);

const expenseService = {
    getAllExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
};

export default expenseService;
