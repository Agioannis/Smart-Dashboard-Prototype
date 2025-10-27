import React, { useState } from 'react';
import './AIInsights.css';
import axios from 'axios';

const AIInsights = () => {
    const [insight, setInsight] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchInsights = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('http://localhost:5000/api/ai/analyze');
            setInsight(response.data.aiInsights);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching AI insights:', err);
            setError('Failed to fetch AI insights. Ensure server and API key are valid.');
            setLoading(false);
        }
    };

    return (
        <div className="ai-insights-container">
            <h1 className="ai-title">AI Insights 🧠</h1>
            <p className="ai-subtitle">Get data-driven intelligence about your productivity and spending.</p>

            <button className="btn-primary-custom" onClick={fetchInsights} disabled={loading}>
                {loading ? 'Analyzing…' : 'Generate AI Insights'}
            </button>

            {error && <div className="ai-error">{error}</div>}

            {insight && (
                <div className="ai-cards">
                    <div className="card">
                        <h3>Summary</h3>
                        <p>{insight.summary}</p>
                    </div>
                    <div className="card">
                        <h3>Task Recommendations</h3>
                        <ul>
                            {insight.recommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="card">
                        <h3>Spending Insight</h3>
                        <p>{insight.spendingInsight}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIInsights;
