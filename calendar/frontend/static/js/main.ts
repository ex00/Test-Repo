// frontend/static/js/main.ts

import { CalendarEvent } from './interfaces';

const API_BASE_URL = '/api'; // Proxy through Nginx in production, direct in dev

document.addEventListener('DOMContentLoaded', () => {
    const eventForm = document.getElementById('event-form') as HTMLFormElement;
    const eventsList = document.getElementById('events-list') as HTMLDivElement;
    const messageDiv = document.getElementById('message') as HTMLDivElement;

    let currentUserId: number | null = 1; // For simplicity, assume a single user with ID 1

    // Function to display messages
    function showMessage(message: string, type: 'success' | 'error') {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }

    // Function to fetch and display events
    async function fetchEvents() {
        if (!currentUserId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/users/${currentUserId}/events/`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const events: CalendarEvent[] = await response.json();
            renderEvents(events);
        } catch (error) {
            console.error('Error fetching events:', error);
            showMessage('Failed to load events.', 'error');
        }
    }

    // Function to render events in the DOM
    function renderEvents(events: CalendarEvent[]) {
        eventsList.innerHTML = '';
        if (events.length === 0) {
            eventsList.innerHTML = '<p>No events scheduled. Add one!</p>';
            return;
        }

        events.forEach((event: CalendarEvent) => {
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';
            eventItem.innerHTML = `
                <div>
                    <h3>${event.title}</h3>
                    <p>${event.description || 'No description'}</p>
                    <p>From: ${new Date(event.start_time).toLocaleString()}</p>
                    <p>To: ${new Date(event.end_time).toLocaleString()}</p>
                </div>
                <div class="event-actions">
                    <button class="edit-btn" data-id="${event.id}">Edit</button>
                    <button class="delete-btn" data-id="${event.id}">Delete</button>
                </div>
            `;
            eventsList.appendChild(eventItem);
        });

        // Add event listeners for edit and delete buttons
        eventsList.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = (e.target as HTMLButtonElement).dataset.id;
                if (id) editEvent(parseInt(id));
            });
        });

        eventsList.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = (e.target as HTMLButtonElement).dataset.id;
                if (id) deleteEvent(parseInt(id));
            });
        });
    }

    // Function to handle form submission (create/update event)
    eventForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = (document.getElementById('title') as HTMLInputElement).value;
        const description = (document.getElementById('description') as HTMLTextAreaElement).value;
        const startTime = (document.getElementById('start_time') as HTMLInputElement).value;
        const endTime = (document.getElementById('end_time') as HTMLInputElement).value;
        const eventId = (document.getElementById('event-id') as HTMLInputElement).value;

        if (!title || !startTime || !endTime) {
            showMessage('Please fill in all required fields (Title, Start Time, End Time).', 'error');
            return;
        }

        const eventData: CalendarEvent = {
            title,
            description,
            start_time: new Date(startTime).toISOString().slice(0, 19), // YYYY-MM-DDTHH:MM:SS
            end_time: new Date(endTime).toISOString().slice(0, 19),     // YYYY-MM-DDTHH:MM:SS
        };

        try {
            let response;
            if (eventId) {
                // Update existing event
                response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(eventData),
                });
                if (response.ok) {
                    showMessage('Event updated successfully!', 'success');
                } else {
                    throw new Error('Failed to update event.');
                }
            } else {
                // Create new event
                response = await fetch(`${API_BASE_URL}/users/${currentUserId}/events/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(eventData),
                });
                if (response.ok) {
                    showMessage('Event created successfully!', 'success');
                } else {
                    throw new Error('Failed to create event.');
                }
            }
            eventForm.reset();
            (document.getElementById('event-id') as HTMLInputElement).value = ''; // Clear hidden ID
            fetchEvents();
        } catch (error) {
            console.error('Error saving event:', error);
            showMessage('Failed to save event.', 'error');
        }
    });

    // Function to populate form for editing
    async function editEvent(id: number) {
        try {
            const response = await fetch(`${API_BASE_URL}/events/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const event: CalendarEvent = await response.json();

            (document.getElementById('event-id') as HTMLInputElement).value = event.id!.toString();
            (document.getElementById('title') as HTMLInputElement).value = event.title;
            (document.getElementById('description') as HTMLTextAreaElement).value = event.description;
            // Convert ISO string to local datetime format for input field
            (document.getElementById('start_time') as HTMLInputElement).value = new Date(event.start_time).toISOString().slice(0, 16);
            (document.getElementById('end_time') as HTMLInputElement).value = new Date(event.end_time).toISOString().slice(0, 16);

            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
        } catch (error) {
            console.error('Error fetching event for edit:', error);
            showMessage('Failed to load event for editing.', 'error');
        }
    }

    // Function to delete an event
    async function deleteEvent(id: number) {
        if (!confirm('Are you sure you want to delete this event?')) {
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/events/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                showMessage('Event deleted successfully!', 'success');
                fetchEvents();
            } else {
                throw new Error('Failed to delete event.');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            showMessage('Failed to delete event.', 'error');
        }
    }

    // Initial setup: Create a default user if none exists, then fetch events
    async function setupUserAndFetchEvents() {
        const defaultUsername = "student_user";
        const defaultEmail = "student@example.com";
        let userResponse = await fetch(`${API_BASE_URL}/users/1`); // Try to get user with ID 1

        if (userResponse.status === 404) {
            // User not found, create it
            console.log("Default user not found, creating one...");
            const createUserResponse = await fetch(`${API_BASE_URL}/users/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: defaultUsername, email: defaultEmail }),
            });
            if (createUserResponse.ok) {
                const newUser = await createUserResponse.json();
                currentUserId = newUser.id;
                console.log(`Created default user with ID: ${currentUserId}`);
                showMessage(`Welcome, ${newUser.username}!`, 'success');
            } else {
                console.error("Failed to create default user.");
                showMessage("Failed to initialize user.", "error");
                currentUserId = null;
            }
        } else if (userResponse.ok) {
            const existingUser = await userResponse.json();
            currentUserId = existingUser.id;
            console.log(`Using existing user with ID: ${currentUserId}`);
            showMessage(`Welcome back, ${existingUser.username}!`, 'success');
        } else {
            console.error("Failed to check for default user.");
            showMessage("Failed to initialize user.", "error");
            currentUserId = null;
        }

        if (currentUserId) {
            fetchEvents();
        }
    }

    setupUserAndFetchEvents();
});

export {};