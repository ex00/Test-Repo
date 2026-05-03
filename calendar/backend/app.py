# backend/app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from database import init_db, get_db
import controllers
import datetime

app = Flask(__name__)
CORS(app) # Enable CORS for frontend interaction

# Initialize the database
with app.app_context():
    init_db()

@app.route("/")
def hello_world():
    return "<p>Hello, World from Flask Backend!</p>"

# User Endpoints (simplified for example)
@app.route("/users/", methods=["POST"])
def create_user_route():
    db = next(get_db())
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    if not username or not email:
        return jsonify({"error": "Username and email are required"}), 400
    user = controllers.create_user(db, username, email)
    return jsonify({"id": user.id, "username": user.username, "email": user.email}), 201

@app.route("/users/<int:user_id>", methods=["GET"])
def get_user_route(user_id):
    db = next(get_db())
    user = controllers.get_user(db, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"id": user.id, "username": user.username, "email": user.email})

# Event Endpoints
@app.route("/users/<int:user_id>/events/", methods=["POST"])
def create_event_route(user_id):
    db = next(get_db())
    user = controllers.get_user(db, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    title = data.get("title")
    description = data.get("description")
    start_time_str = data.get("start_time")
    end_time_str = data.get("end_time")

    if not title or not start_time_str or not end_time_str:
        return jsonify({"error": "Title, start_time, and end_time are required"}), 400

    try:
        start_time = datetime.datetime.fromisoformat(start_time_str)
        end_time = datetime.datetime.fromisoformat(end_time_str)
    except ValueError:
        return jsonify({"error": "Invalid datetime format. Use ISO format (YYYY-MM-DDTHH:MM:SS)."}), 400

    event_data = {
        "title": title,
        "description": description,
        "start_time": start_time,
        "end_time": end_time,
    }
    event = controllers.create_user_event(db, event_data, user_id)
    return jsonify({
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "start_time": event.start_time.isoformat(),
        "end_time": event.end_time.isoformat(),
        "owner_id": event.owner_id
    }), 201

@app.route("/users/<int:user_id>/events/", methods=["GET"])
def get_user_events_route(user_id):
    db = next(get_db())
    user = controllers.get_user(db, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    events = controllers.get_events_by_user(db, user_id)
    events_list = [{
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "start_time": event.start_time.isoformat(),
        "end_time": event.end_time.isoformat(),
        "owner_id": event.owner_id
    } for event in events]
    return jsonify(events_list)

@app.route("/events/<int:event_id>", methods=["GET"])
def get_event_route(event_id):
    db = next(get_db())
    event = controllers.get_event(db, event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404
    return jsonify({
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "start_time": event.start_time.isoformat(),
        "end_time": event.end_time.isoformat(),
        "owner_id": event.owner_id
    })

@app.route("/events/<int:event_id>", methods=["PUT"])
def update_event_route(event_id):
    db = next(get_db())
    data = request.get_json()
    
    # Convert datetime strings to datetime objects if present
    if "start_time" in data:
        try:
            data["start_time"] = datetime.datetime.fromisoformat(data["start_time"])
        except ValueError:
            return jsonify({"error": "Invalid start_time format. Use ISO format (YYYY-MM-DDTHH:MM:SS)."}), 400
    if "end_time" in data:
        try:
            data["end_time"] = datetime.datetime.fromisoformat(data["end_time"])
        except ValueError:
            return jsonify({"error": "Invalid end_time format. Use ISO format (YYYY-MM-DDTHH:MM:SS)."}), 400

    event = controllers.update_event(db, event_id, data)
    if not event:
        return jsonify({"error": "Event not found"}), 404
    return jsonify({
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "start_time": event.start_time.isoformat(),
        "end_time": event.end_time.isoformat(),
        "owner_id": event.owner_id
    })

@app.route("/events/<int:event_id>", methods=["DELETE"])
def delete_event_route(event_id):
    db = next(get_db())
    event = controllers.delete_event(db, event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404
    return jsonify({"message": "Event deleted successfully"}), 200

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
