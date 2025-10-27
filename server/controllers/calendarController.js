const fs = require('fs');
const { google } = require('googleapis');
const Task = require('../models/Task'); // Adjust path as needed
const CALENDAR_ID = process.env.CALENDAR_ID;

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = 'token.json';

// Load or request OAuth2 client credentials
async function getAuthorizedClient() {
    const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    // Check if previously stored token exists
    if (fs.existsSync(TOKEN_PATH)) {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
        oAuth2Client.setCredentials(token);
        return oAuth2Client;
    }

    // If no token, manual authorization required (for setup only)
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    // Provide code from URL for initial token
    // Use readline or another method to get code and save token manually
    throw new Error('No token found. Run manual auth flow.');
}

// Sync all tasks to Google Calendar
async function syncTasksToGoogleCalendar(req, res) {
    try {
        const auth = await getAuthorizedClient();
        const calendar = google.calendar({ version: 'v3', auth });

        const tasks = await Task.find();

        for (const task of tasks) {
            const event = {
                summary: task.title,
                description: task.description || 'No description',
                start: { date: task.dueDate },
                end: { date: task.dueDate },
            };

            const response = await calendar.events.insert({
                calendarId: CALENDAR_ID,
                resource: event,
            });

            task.eventId = response.data.id;
            await task.save();
        }

        res.json({ message: 'All tasks synced to Google Calendar' });
    } catch (err) {
        console.error('Error syncing tasks:', err);
        res.status(500).json({ error: err.message });
    }
}

module.exports = { syncTasksToGoogleCalendar };
