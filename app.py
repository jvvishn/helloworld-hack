import json
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore
import PyPDF2 
import os
from dotenv import load_dotenv
from collections import Counter

# Load environment variables
load_dotenv()

# --- Setup and Initialization ---
cred = credentials.Certificate("hw-hackathon.json") 
firebase_admin.initialize_app(cred)
db = firestore.client()
app = Flask(__name__)
import google.generativeai as genai

# --- Make sure this is at the top of your file --- 
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash-latest')

# --- ENHANCED CORE LOGIC ---
def find_optimal_slots(data):
    """
    Enhanced version that considers day preferences and location data
    """
    schedules = data.get('schedules', {})
    users = data.get('users', [])
    duration_minutes = data.get('meeting_duration_minutes', 60)
    duration = timedelta(minutes=duration_minutes)
    
    # NEW: Day preferences (0=Monday, 6=Sunday)
    day_preferences = data.get('day_preferences', {})  # user_id: [0,1,2,3,4] for weekdays
    
    # NEW: Location data
    user_locations = data.get('user_locations', {})  # user_id: [{"location": "Building A", "end_time": "14:00", "day": "monday"}]
    
    # Use a default search range if not provided
    now = datetime.now()
    default_start = now.strftime("%Y-%m-%dT09:00:00")
    default_end = (now + timedelta(days=7)).strftime("%Y-%m-%dT17:00:00")
    
    search_range = data.get('search_range', {})
    search_start = datetime.fromisoformat(search_range.get('start', default_start))
    search_end = datetime.fromisoformat(search_range.get('end', default_end))

    # Convert schedule strings to datetime objects
    for user_id, user_schedules in schedules.items():
        for i, busy_slot in enumerate(user_schedules):
            schedules[user_id][i]['start'] = datetime.fromisoformat(busy_slot['start'])
            schedules[user_id][i]['end'] = datetime.fromisoformat(busy_slot['end'])

    potential_slots = []
    current_time = search_start
    interval = timedelta(minutes=15)

    while current_time + duration <= search_end:
        slot_start = current_time
        slot_end = current_time + duration
        available_users = []
        
        # NEW: Check day preference
        current_weekday = current_time.weekday()
        day_score = 0
        
        for user in users:
            is_user_available = True
            
            # Check regular schedule conflicts
            for busy_slot in schedules.get(user, []):
                if max(slot_start, busy_slot['start']) < min(slot_end, busy_slot['end']):
                    is_user_available = False
                    break
            
            # NEW: Check day preferences
            user_day_prefs = day_preferences.get(user, list(range(7)))  # Default: all days OK
            if current_weekday not in user_day_prefs:
                is_user_available = False
            else:
                day_score += 1  # Bonus for preferred day
            
            if is_user_available:
                available_users.append(user)

        if len(available_users) > 0:
            # NEW: Calculate location score
            location_score = calculate_location_score(available_users, user_locations, current_time)
            
            potential_slots.append({
                "start": slot_start.isoformat(),
                "end": slot_end.isoformat(),
                "attendees": available_users,
                "attendee_count": len(available_users),
                "day_preference_score": day_score,
                "location_score": location_score,
                "suggested_locations": get_suggested_locations(available_users, user_locations, current_time)
            })
        
        current_time += interval
    
    # NEW: Enhanced sorting with multiple factors
    sorted_slots = sorted(potential_slots, 
                         key=lambda x: (x['attendee_count'], x['location_score'], x['day_preference_score'], x['start']), 
                         reverse=True)
    return sorted_slots[:5]

def calculate_location_score(available_users, user_locations, meeting_time):
    """
    Calculate how convenient meeting locations would be based on users' class locations
    """
    if not user_locations:
        return 0
    
    meeting_day = meeting_time.strftime("%A").lower()
    meeting_hour = meeting_time.hour
    
    # Find recent class locations for available users
    recent_locations = []
    for user in available_users:
        user_locs = user_locations.get(user, [])
        for loc_info in user_locs:
            if loc_info.get('day', '').lower() == meeting_day:
                # If they have a class ending within 2 hours before the meeting
                class_end_hour = int(loc_info.get('end_time', '00:00').split(':')[0])
                if class_end_hour <= meeting_hour <= class_end_hour + 2:
                    recent_locations.append(loc_info.get('location', ''))
    
    # Score based on common locations
    if not recent_locations:
        return 0
    
    location_counts = Counter(recent_locations)
    most_common_count = location_counts.most_common(1)[0][1] if recent_locations else 0
    return most_common_count

def get_suggested_locations(available_users, user_locations, meeting_time):
    """
    Suggest meeting locations based on where users have recent classes
    """
    if not user_locations:
        return ["Library", "Student Center", "Main Campus"]  # Default suggestions
    
    meeting_day = meeting_time.strftime("%A").lower()
    meeting_hour = meeting_time.hour
    
    recent_locations = []
    for user in available_users:
        user_locs = user_locations.get(user, [])
        for loc_info in user_locs:
            if loc_info.get('day', '').lower() == meeting_day:
                class_end_hour = int(loc_info.get('end_time', '00:00').split(':')[0])
                if class_end_hour <= meeting_hour <= class_end_hour + 2:
                    recent_locations.append(loc_info.get('location', ''))
    
    if recent_locations:
        location_counts = Counter(recent_locations)
        suggestions = [loc for loc, count in location_counts.most_common(3)]
        return suggestions
    
    return ["Library", "Student Center", "Main Campus"]

# --- TEST DATA SETUP (for easy Firebase testing) ---
@app.route('/setup_test_data', methods=['POST'])
def setup_test_data():
    """Setup test data for enhanced features - useful for hackathon testing"""
    try:
        # User 1 with preferences
        db.collection('users').document('user1').set({
            'name': 'Alice Johnson',
            'email': 'alice@university.edu',
            'schedule': [
                {'start': '2025-09-22T09:00:00', 'end': '2025-09-22T10:15:00'},
                {'start': '2025-09-22T14:00:00', 'end': '2025-09-22T15:15:00'}
            ],
            'dayPreferences': [0, 1, 2, 3, 4],  # Weekdays only
            'classLocations': [
                {'location': 'LWSN B146', 'day': 'monday', 'end_time': '10:15', 'class_name': 'CS 180'},
                {'location': 'MATH G008', 'day': 'monday', 'end_time': '15:15', 'class_name': 'CALC 2'}
            ]
        })
        
        # User 2 with different preferences  
        db.collection('users').document('user2').set({
            'name': 'Bob Smith',
            'email': 'bob@university.edu',
            'schedule': [
                {'start': '2025-09-22T10:30:00', 'end': '2025-09-22T11:45:00'},
                {'start': '2025-09-22T13:00:00', 'end': '2025-09-22T14:15:00'}
            ],
            'dayPreferences': [0, 1, 2, 3, 4, 5],  # Weekdays + Saturday
            'classLocations': [
                {'location': 'LWSN B146', 'day': 'monday', 'end_time': '11:45', 'class_name': 'CS 240'},
                {'location': 'PHYS 114', 'day': 'monday', 'end_time': '14:15', 'class_name': 'Physics'}
            ]
        })

        # User 3 with different preferences
        db.collection('users').document('user3').set({
            'name': 'Carol Davis',
            'email': 'carol@university.edu',
            'schedule': [
                {'start': '2025-09-22T11:00:00', 'end': '2025-09-22T12:15:00'}
            ],
            'dayPreferences': [1, 2, 3, 4],  # Tuesday-Friday only
            'classLocations': [
                {'location': 'LWSN B146', 'day': 'monday', 'end_time': '12:15', 'class_name': 'Data Structures'}
            ]
        })

        # Update the test group
        db.collection('groups').document('testgroup1').set({
            'name': 'CS Study Group',
            'members': ['user1', 'user2', 'user3'],
            'created_at': firestore.SERVER_TIMESTAMP
        })
        
        return jsonify({"message": "Test data created successfully! Ready to test enhanced features."})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- ENHANCED API ENDPOINTS ---
@app.route('/api/users/preferences', methods=['POST'])
def update_user_preferences():
    """
    Update user's day preferences and location info
    """
    try:
        data = request.get_json()
        user_id = data.get('userId')
        
        if not user_id:
            return jsonify({"error": "userId is required"}), 400
        
        update_data = {}
        
        # Day preferences (0=Monday, 6=Sunday)
        if 'dayPreferences' in data:
            update_data['dayPreferences'] = data['dayPreferences']
        
        # Location info
        if 'classLocations' in data:
            update_data['classLocations'] = data['classLocations']
        
        user_ref = db.collection('users').document(user_id)
        user_ref.update(update_data)
        
        return jsonify({"message": "Preferences updated successfully"})
        
    except Exception as e:
        return jsonify({"error": f"Failed to update preferences: {e}"}), 500

@app.route('/find_time_enhanced', methods=['POST'])
def handle_find_time_enhanced():
    """
    Enhanced API endpoint that includes all new features
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid input. Please send JSON data."}), 400
        
        # Get group members and their data
        users = data.get('users', [])
        enhanced_data = {
            "users": users,
            "schedules": {},
            "day_preferences": {},
            "user_locations": {},
            "meeting_duration_minutes": data.get('meeting_duration_minutes', 60),
            "search_range": data.get('search_range', {})
        }
        
        # Fetch user data from Firestore
        for user_id in users:
            user_ref = db.collection('users').document(user_id).get()
            if user_ref.exists:
                user_data = user_ref.to_dict()
                enhanced_data['schedules'][user_id] = user_data.get('schedule', [])
                enhanced_data['day_preferences'][user_id] = user_data.get('dayPreferences', list(range(7)))
                enhanced_data['user_locations'][user_id] = user_data.get('classLocations', [])
        
        best_slots = find_optimal_slots(enhanced_data)
        return jsonify(best_slots)
        
    except Exception as e:
        return jsonify({"error": f"An error occurred: {e}"}), 500

# --- EXISTING ROUTES (keeping your original functionality) ---
@app.route('/api/ai/generate-quiz', methods=['POST'])
def handle_generate_quiz():
    # Your existing quiz generation code
    data = request.get_json()
    material_id = data.get('materialId')
    question_count = data.get('questionCount', 5)
    difficulty = data.get('difficulty', 'medium')

    if not material_id:
        return jsonify({"error": "materialId is required"}), 400

    try:
        doc_ref = db.collection('materials').document(material_id).get()
        if not doc_ref.exists:
            return jsonify({"error": "Material not found"}), 404
        
        processed_text = doc_ref.to_dict().get('processedText')

        prompt = f"""
        Based on the following text, generate a quiz with {question_count} questions at a {difficulty} difficulty level.
        The quiz should be in a JSON format with a title and a list of questions.
        Each question should have a 'questionText', a list of 'options', and the 'correctAnswer'.

        Here is the text:
        ---
        {processed_text}
        ---
        """

        response = model.generate_content(prompt)
        print(f"Gemini raw response: {response.text}")
        
        cleaned_text = response.text.strip().strip('```json\n').strip('```')
        quiz_data = json.loads(cleaned_text)

        return jsonify({
            "success": True,
            "data": quiz_data
        })

    except Exception as e:
        return jsonify({"error": f"An error occurred: {e}"}), 500

@app.route("/")
def index():
    return "Enhanced Study Group Meeting Finder API is running! 🚀📚"

@app.route("/test_firebase")
def test_full_logic():
    # Your existing test logic
    try:
        group_ref = db.collection('groups').document('testgroup1').get()
        if not group_ref.exists:
            return "Test document 'testgroup1' not found!", 404

        member_ids = group_ref.to_dict().get('members', [])
        print(f"Found member IDs: {member_ids}")
        
        formatted_data = {
            "users": member_ids,
            "schedules": {},
            "meeting_duration_minutes": 60,
            "search_range": {
                "start": "2025-09-22T09:00:00",
                "end": "2025-09-22T18:00:00"
            }
        }

        for user_id in member_ids:
            user_ref = db.collection('users').document(user_id).get()
            if user_ref.exists:
                print(f"Processing user '{user_id}': Found schedule -> {user_ref.to_dict().get('schedule', 'No schedule field!')}")
                formatted_data['schedules'][user_id] = user_ref.to_dict().get('schedule', [])
            else:
                print(f"Processing user '{user_id}': User document NOT FOUND.")

        optimal_slots = find_optimal_slots(formatted_data)
        
        return jsonify(optimal_slots)

    except Exception as e:
        return f"An error occurred: {e}", 500

@app.route('/find_time', methods=['POST'])
def handle_find_time():
    # Your existing find_time logic
    schedule_data = request.get_json()
    if not schedule_data:
        return jsonify({"error": "Invalid input. Please send JSON data."}), 400
    best_slots = find_optimal_slots(schedule_data)
    return jsonify(best_slots)

# Your existing file upload functionality
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/api/ai/upload-material', methods=['POST'])
def handle_file_upload():
    # Your existing file upload code
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if file:
        filename = secure_filename(file.filename)
        
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])
            
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        processed_text = ""
        if filename.lower().endswith('.pdf'):
            try:
                with open(file_path, 'rb') as pdf_file:
                    reader = PyPDF2.PdfReader(pdf_file)
                    for page in reader.pages:
                        processed_text += page.extract_text()
            except Exception as e:
                return jsonify({"error": f"Failed to read PDF: {e}"}), 500

        doc_ref = db.collection('materials').document()
        doc_ref.set({
            'fileName': filename,
            'processedText': processed_text,
            'uploadedAt': firestore.SERVER_TIMESTAMP
        })

        return jsonify({
            "message": "File uploaded and processed successfully", 
            "id": doc_ref.id,
            "fileName": filename
        })

if __name__ == '__main__':
    app.run(debug=True)
