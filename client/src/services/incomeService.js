import api from './api';

const getAllIncome = () => api.get('/income');
const createIncome = (data) => api.post('/income', data);
const deleteIncome = (id) => api.delete(`/income/${id}`);

const incomeService = {
    getAllIncome,
    createIncome,
    deleteIncome,
};

export default incomeService;
