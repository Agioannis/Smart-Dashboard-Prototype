import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './Calendar.css';
import axios from 'axios';

const handleSyncTasks = async () => {
    try {
        await axios.post(`${process.env.REACT_APP_API_URL}/calendar/sync-tasks`);
        alert('Tasks synced to Google Calendar!');
    } catch (err) {
        alert('Failed to sync tasks. See server for error.');
    }
};

const Calendar = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await axios.get(
                    `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/calendar/events`
                );
                setEvents(data);
            } catch (err) {
                console.error('Error fetching events:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const handleEventClick = (info) => {
        alert(`Event: ${info.event.title}\nDate: ${info.event.start.toLocaleDateString()}`);
    };

    return (
        <div className="calendar-container">
            <h1>Dashboard Calendar</h1>
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading events...</p>
                </div>
            ) : (
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    events={events}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay',
                    }}
                    eventClick={handleEventClick}
                    height="85vh"
                />
            )}
            <button className="btn-primary-custom" onClick={handleSyncTasks}>
                Sync Tasks to Google Calendar
            </button>
        </div>
    );
};

export default Calendar;
