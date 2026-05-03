# Personal Calendar - MVC Example

This project demonstrates the Model-View-Controller (MVC) architectural pattern using a personal calendar application. It's designed to be clean, obvious, and serve as an educational example for students learning about MVC, REST APIs, and Dockerized applications.

## Architecture Overview

The project is split into two main services:

1.  **Backend (Controller & Model):**
    *   **Framework:** Flask (Python)
    *   **Database:** SQLite (managed by SQLAlchemy)
    *   **Role:** Provides a RESTful API for managing calendar events and users. It handles data storage (Model) and business logic (Controller).
    *   **MVC Mapping:**
        *   **Model:** `backend/models.py` (defines `User` and `Event` data structures)
        *   **Controller:** `backend/controllers.py` (contains logic for CRUD operations on users and events) and `backend/app.py` (routes requests to appropriate controller functions and handles API responses).

2.  **Frontend (View):**
    *   **Technologies:** HTML, CSS, TypeScript (compiled to JavaScript)
    *   **Role:** Provides the user interface for interacting with the calendar. It consumes the REST API from the backend to display, create, update, and delete events.
    *   **MVC Mapping:**
        *   **View:** `frontend/templates/index.html` (the structure), `frontend/static/css/style.css` (the styling), and `frontend/static/js/main.ts` (the logic for rendering data and handling user input).

## Project Structure

```
london_smp_projects/
├── docker-compose.yml          # Defines the multi-service Docker application
├── backend/
│   ├── Dockerfile              # Dockerfile for the Flask backend
│   ├── requirements.txt        # Python dependencies
│   ├── app.py                  # Main Flask application, defines API routes
│   ├── models.py               # SQLAlchemy models (User, Event)
│   ├── controllers.py          # Business logic for data manipulation
│   ├── database.py             # Database initialization and session management
│   └── instance/               # Directory for SQLite database file (persisted by Docker volume)
├── frontend/
│   ├── Dockerfile              # Dockerfile for the Nginx web server and frontend build
│   ├── nginx.conf              # Nginx configuration to serve static files and proxy API
│   ├── package.json            # Node.js dependencies for frontend (TypeScript, Webpack)
│   ├── tsconfig.json           # TypeScript configuration
│   ├── webpack.config.js       # Webpack configuration for bundling TypeScript
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css       # Basic styling for the calendar
│   │   └── js/
│   │       └── main.ts         # TypeScript logic for frontend interaction
│   └── templates/
│       └── index.html          # Main HTML file for the calendar interface
└── README.md                   # This file
```

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and demonstration purposes.

### Prerequisites

*   [Docker Desktop](https://www.docker.com/products/docker-desktop) (includes Docker Engine and Docker Compose) installed on your system.

### Installation and Setup

1.  **Clone the repository (if applicable) or navigate to the project root.**
    (Assuming you are already in `C:\Users\User\projects\london_smp_projects`)

2.  **Build and Run the Docker Containers:**
    Open your terminal or command prompt in the project root directory (`london_smp_projects`) and run:

    ```bash
    docker-compose build
    docker-compose up
    ```
    *   `docker-compose build`: This command builds the Docker images for both the `backend` and `frontend` services based on their respective `Dockerfile`s. This might take a few minutes on the first run.
    *   `docker-compose up`: This command starts the services defined in `docker-compose.yml`. The backend will run on port 5000 (inside Docker) and the frontend (Nginx) will run on port 80 (exposed to your host).

3.  **Access the Application:**
    Once the containers are up and running, open your web browser and navigate to:
    `http://localhost/`

    The frontend application will load, and it will automatically attempt to create a default user (ID 1) if one doesn't exist, then fetch and display any existing events for that user.

## How to Use

*   **Add Event:** Fill out the "Add/Edit Event" form with a title, description, start time, and end time, then click "Save Event".
*   **Edit Event:** Click the "Edit" button next to an event in the list. The form will be pre-filled with the event's details. Modify them and click "Save Event" to update.
*   **Delete Event:** Click the "Delete" button next to an event. Confirm the deletion when prompted.

## API Endpoints (Backend)

The Flask backend exposes the following RESTful API endpoints:

### Users

*   `POST /users/`
    *   **Description:** Creates a new user.
    *   **Request Body (JSON):** `{"username": "testuser", "email": "test@example.com"}`
    *   **Response (JSON):** `{"id": 1, "username": "testuser", "email": "test@example.com"}`
*   `GET /users/<int:user_id>`
    *   **Description:** Retrieves a user by ID.
    *   **Example:** `GET /users/1`
    *   **Response (JSON):** `{"id": 1, "username": "testuser", "email": "test@example.com"}`

### Events

*   `POST /users/<int:user_id>/events/`
    *   **Description:** Creates a new event for a specific user.
    *   **Request Body (JSON):** `{"title": "Meeting", "description": "Team sync", "start_time": "2026-04-26T10:00:00", "end_time": "2026-04-26T11:00:00"}` (ISO format for datetime)
    *   **Response (JSON):** Details of the created event.
*   `GET /users/<int:user_id>/events/`
    *   **Description:** Retrieves all events for a specific user.
    *   **Example:** `GET /users/1/events/`
    *   **Response (JSON):** An array of event objects.
*   `GET /events/<int:event_id>`
    *   **Description:** Retrieves a single event by its ID.
    *   **Example:** `GET /events/1`
    *   **Response (JSON):** Details of the event.
*   `PUT /events/<int:event_id>`
    *   **Description:** Updates an existing event.
    *   **Request Body (JSON):** `{"title": "Updated Meeting", "start_time": "2026-04-26T10:30:00"}` (partial updates are supported)
    *   **Response (JSON):** Details of the updated event.
*   `DELETE /events/<int:event_id>`
    *   **Description:** Deletes an event.
    *   **Example:** `DELETE /events/1`
    *   **Response (JSON):** `{"message": "Event deleted successfully"}`

## Stopping the Application

To stop the running Docker containers, press `Ctrl+C` in the terminal where `docker-compose up` is running.
To remove the containers, networks, and volumes (including the SQLite database), run:

```bash
docker-compose down -v
```
The `-v` flag ensures that the Docker volume for the SQLite database is also removed, effectively resetting the database. If you want to keep the data, omit `-v`.
