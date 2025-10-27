import React, { useState, useEffect } from 'react';
import './Expenses.css';
import expenseService from '../../services/expenseService';
import incomeService from '../../services/incomeService';

const categories = ['Food', 'Utilities', 'Travel', 'Entertainment', 'Other'];
const paymentMethods = ['Cash', 'Card', 'Bank Transfer', 'Other'];

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [incomes, setIncomes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterCategory, setFilterCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    // Add these states along with your existing states
    const [editingIncome, setEditingIncome] = useState(null);
    // incomeForm is presumably already declared, if not:
    // Modal states
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showIncomeModal, setShowIncomeModal] = useState(false);

    // For expense edit mode
    const [editingExpense, setEditingExpense] = useState(null);

    // Expense form state (with paymentMethod)
    const [expenseForm, setExpenseForm] = useState({
        category: 'Food',
        description: '',
        amount: '',
        date: '',
        status: 'Pending',
        paymentMethod: 'Cash'
    });

    // Income form state
    const [incomeForm, setIncomeForm] = useState({
        source: '',
        amount: '',
        date: '',
    });

    useEffect(() => {
        fetchData();
    }, [filterCategory, searchQuery]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [expensesRes, incomesRes] = await Promise.all([
                expenseService.getAllExpenses({ category: filterCategory, search: searchQuery }),
                incomeService.getAllIncome(), // Change to support filters if needed
            ]);
            setExpenses(Array.isArray(expensesRes.data) ? expensesRes.data : []);
            setIncomes(Array.isArray(incomesRes.data) ? incomesRes.data : []);
            setError(null);
        } catch (err) {
            setError("Failed to load data");
        } finally {
            setLoading(false);
        }
    };


    // Edit expense
    const handleEditExpense = (expense) => {
        setEditingExpense(expense);
        setExpenseForm({
            category: expense.category,
            description: expense.description || '',
            amount: expense.amount.toString(),
            date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
            status: expense.status,
            paymentMethod: expense.paymentMethod || 'Cash'
        });
        setShowExpenseModal(true);
    };

    // Delete expense
    const handleDeleteExpense = async (expenseId) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                await expenseService.deleteExpense(expenseId);
                await fetchData();
            } catch (err) {
                alert('Failed to delete expense. Please try again.');
            }
        }
    };

    // Expense add/edit handler
    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        if (!expenseForm.amount || !expenseForm.date || !expenseForm.category || !expenseForm.paymentMethod || !expenseForm.status) {
            alert('All fields except Description are required.');
            return;
        }
        try {
            if (editingExpense) {
                await expenseService.updateExpense(editingExpense._id, {
                    ...expenseForm,
                    amount: Number(expenseForm.amount)
                });
            } else {
                await expenseService.createExpense({
                    ...expenseForm,
                    amount: Number(expenseForm.amount)
                });
            }
            setShowExpenseModal(false);
            setExpenseForm({
                category: 'Food',
                description: '',
                amount: '',
                date: '',
                status: 'Pending',
                paymentMethod: 'Cash'
            });
            setEditingExpense(null);
            await fetchData();
        } catch (err) {
            alert('Error saving expense: ' + (err.response?.data?.error || err.message));
        }
    };

    // Income add handler
    const handleIncomeSubmit = async (e) => {
        e.preventDefault();
        if (!incomeForm.amount || !incomeForm.date || !incomeForm.source) {
            alert('All fields are required.');
            return;
        }
        try {
            await incomeService.createIncome({
                ...incomeForm,
                amount: Number(incomeForm.amount)
            });
            setShowIncomeModal(false);
            setIncomeForm({ source: '', amount: '', date: '' });
            await fetchData();
        } catch (err) {
            alert('Error saving income: ' + (err.response?.data?.error || err.message));
        }
    };



    // Edit income handler
    const handleEditIncome = (income) => {
        setEditingIncome(income);
        setIncomeForm({
            source: income.source,
            amount: income.amount.toString(),
            date: income.date ? new Date(income.date).toISOString().split('T')[0] : '',
        });
        setShowIncomeModal(true);
    };

    // Delete income handler
    const handleDeleteIncome = async (incomeId) => {
        if (window.confirm('Are you sure you want to delete this income?')) {
            try {
                await incomeService.deleteIncome(incomeId);
                await fetchData();
            } catch (err) {
                alert('Failed to delete income. Please try again.');
            }
        }
    };

    // Reset forms
    const resetExpenseForm = () => {
        setExpenseForm({
            category: 'Food',
            description: '',
            amount: '',
            date: '',
            status: 'Pending',
            paymentMethod: 'Cash'
        });
        setEditingExpense(null);
    };

    // Monthly sums
    const now = new Date();
    const monthlyExpenses = expenses
        .filter(e => new Date(e.date).getMonth() === now.getMonth() && new Date(e.date).getFullYear() === now.getFullYear())
        .reduce((a, c) => a + c.amount, 0);

    const isSameMonthYear = (dateStr, month, year) => {
        const d = new Date(dateStr);
        return d.getMonth() === month && d.getFullYear() === year;
    }

    const monthlyIncome = incomes
        .filter(i => {
            const d = new Date(i.date);
            return !isNaN(d) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((a, c) => a + c.amount, 0);


    const monthlySavings = monthlyIncome - monthlyExpenses;

    // Table
    const transactions = [
        ...expenses.map(e => ({ ...e, type: 'Expense' })),
        ...incomes.map(i => ({ ...i, type: 'Income' })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const filteredTransactions = transactions.filter(item => {
        const matchesCat = filterCategory === 'all' || (item.category ? item.category === filterCategory : true);
        const matchesSearch =
            (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.source?.toLowerCase().includes(searchQuery.toLowerCase())) || false;
        return matchesCat && matchesSearch;
    });

    if (loading) {
        return (
            <div className="expenses-container">
                <div className="loading-state"><div className="spinner"></div><p>Loading expenses and income...</p></div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="expenses-container">
                <div className="error-state">
                    <p>{error}</p>
                    <button className="btn-primary-custom" onClick={fetchData}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="expenses-container">
            <header className="expenses-header">
                <h1>Monthly Overview</h1>
                <div className="monthly-stats">
                    <div className="stat-card income-card">
                        <h3>Income</h3>
                        <p>${monthlyIncome.toFixed(2)}</p>
                    </div>
                    <div className="stat-card expenses-card">
                        <h3>Expenses</h3>
                        <p>${monthlyExpenses.toFixed(2)}</p>
                    </div>
                    <div className="stat-card savings-card" style={{ color: monthlySavings >= 0 ? 'green' : 'red' }}>
                        <h3>Savings</h3>
                        <p>${monthlySavings.toFixed(2)}</p>
                    </div>
                </div>
            </header>

            <section className="expenses-controls">
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                    <option value="all">All Categories</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <input
                    type="text"
                    placeholder="Search description or source..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                <button className="btn-primary-custom" onClick={() => { resetExpenseForm(); setShowExpenseModal(true); }} style={{ marginRight: '10px' }}>
                    Add Expense
                </button>
                <button className="btn-secondary-custom" onClick={() => setShowIncomeModal(true)}>
                    Add Income
                </button>
            </section>

            <div className="all-transactions-table">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Category / Source</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Payment Method</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.length === 0 ? (
                            <tr><td colSpan="8" className="empty-state">No transactions found.</td></tr>
                        ) : (
                            filteredTransactions.map(item => (
                                <tr key={item._id}>
                                    <td>{new Date(item.date).toLocaleDateString()}</td>
                                    <td>{item.type}</td>
                                    <td>{item.type === 'Income' ? item.source : item.category}</td>
                                    <td>{item.description || '-'}</td>
                                    <td>${item.amount.toFixed(2)}</td>
                                    <td>{item.type === 'Income' ? '-' : item.status}</td>
                                    <td>{item.type === 'Income' ? '-' : (item.paymentMethod || '-')}</td>
                                    <td>
                                        {item.type === 'Expense' ? (
                                            <>
                                                <button className="btn-secondary-custom" onClick={() => handleEditExpense(item)}>Edit</button>
                                                <button className="btn-danger-custom" onClick={() => handleDeleteExpense(item._id)}>Delete</button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="btn-secondary-custom" onClick={() => handleEditIncome(item)}>Edit</button>
                                                <button className="btn-danger-custom" onClick={() => handleDeleteIncome(item._id)}>Delete</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Expense Modal */}
            {showExpenseModal && (
                <div className="modal-overlay" onClick={() => { setShowExpenseModal(false); resetExpenseForm(); }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2>
                        <form onSubmit={handleExpenseSubmit}>
                            <label>
                                Category
                                <select value={expenseForm.category}
                                    onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })} required>
                                    {categories.map(cat =>
                                        <option key={cat} value={cat}>{cat}</option>
                                    )}
                                </select>
                            </label>
                            <label>
                                Description
                                <input value={expenseForm.description}
                                    onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                    type="text"
                                    placeholder="Optional"
                                />
                            </label>
                            <label>
                                Amount
                                <input value={expenseForm.amount}
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                Date
                                <input value={expenseForm.date}
                                    type="date"
                                    onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                Status
                                <select value={expenseForm.status}
                                    onChange={e => setExpenseForm({ ...expenseForm, status: e.target.value })} required>
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                </select>
                            </label>
                            <label>
                                Payment Method
                                <select value={expenseForm.paymentMethod}
                                    onChange={e => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })} required>
                                    {paymentMethods.map(method =>
                                        <option key={method} value={method}>{method}</option>
                                    )}
                                </select>
                            </label>
                            <div className="form-actions">
                                <button type="submit" className="btn-primary-custom">{editingExpense ? 'Update' : 'Add'}</button>
                                <button type="button" className="btn-secondary-custom" onClick={() => { setShowExpenseModal(false); resetExpenseForm(); }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Income Modal */}
            {showIncomeModal && (
                <div className="modal-overlay" onClick={() => { setShowIncomeModal(false); setEditingIncome(null); }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>{editingIncome ? 'Edit Income' : 'Add Income'}</h2>
                        <form onSubmit={async e => {
                            e.preventDefault();
                            try {
                                if (editingIncome) {
                                    await incomeService.updateIncome(editingIncome._id, {
                                        ...incomeForm,
                                        amount: Number(incomeForm.amount)
                                    });
                                } else {
                                    await incomeService.createIncome({
                                        ...incomeForm,
                                        amount: Number(incomeForm.amount)
                                    });
                                }
                                setShowIncomeModal(false);
                                setIncomeForm({ source: '', amount: '', date: '' });
                                setEditingIncome(null);
                                await fetchData();
                            } catch (err) {
                                alert('Error saving income: ' + (err.response?.data?.error || err.message));
                            }
                        }}>
                            <label>
                                Source
                                <input type="text" required value={incomeForm.source} onChange={e => setIncomeForm({ ...incomeForm, source: e.target.value })} />
                            </label>
                            <label>
                                Amount
                                <input type="number" min="0.01" step="0.01" required value={incomeForm.amount} onChange={e => setIncomeForm({ ...incomeForm, amount: e.target.value })} />
                            </label>
                            <label>
                                Date
                                <input type="date" required value={incomeForm.date} onChange={e => setIncomeForm({ ...incomeForm, date: e.target.value })} />
                            </label>
                            <div className="form-actions">
                                <button type="submit" className="btn-primary-custom">{editingIncome ? 'Update' : 'Add'}</button>
                                <button type="button" className="btn-secondary-custom" onClick={() => { setShowIncomeModal(false); setEditingIncome(null); }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Expenses;
