import json
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore
import PyPDF2 
import os
from dotenv import load_dotenv

# --- Setup and Initialization ---
cred = credentials.Certificate("hw-hackathon.json") 
firebase_admin.initialize_app(cred)
db = firestore.client()
app = Flask(__name__)
import google.generativeai as genai

# --- Make sure this is at the top of your file --- 
# Add your API key here
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash-latest')
# ---

@app.route('/api/ai/generate-quiz', methods=['POST'])
def handle_generate_quiz():
    # 1. Get the parameters from the request
    data = request.get_json()
    material_id = data.get('materialId')
    question_count = data.get('questionCount', 5) # Default to 5 questions
    difficulty = data.get('difficulty', 'medium') # Default to medium

    if not material_id:
        return jsonify({"error": "materialId is required"}), 400

    try:
        # 2. Fetch the processed text from Firestore
        doc_ref = db.collection('materials').document(material_id).get()
        if not doc_ref.exists:
            return jsonify({"error": "Material not found"}), 404
        
        processed_text = doc_ref.to_dict().get('processedText')

        # 3. Create a prompt and call the Gemini API
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

        # The response from Gemini should be a JSON string, so we load it
        
        cleaned_text = response.text.strip().strip('```json\n').strip('```')
        quiz_data = json.loads(cleaned_text)

        return jsonify({
            "success": True,
            "data": quiz_data
        })

    except Exception as e:
        return jsonify({"error": f"An error occurred: {e}"}), 500

# --- 1. CORE LOGIC DEFINITION ---
# This function must be defined before it is called by the routes below.
def find_optimal_slots(data):
    """
    Finds the best time slots for a meeting based on user schedules.
    """
    schedules = data.get('schedules', {})
    users = data.get('users', [])
    duration_minutes = data.get('meeting_duration_minutes', 60)
    duration = timedelta(minutes=duration_minutes)
    
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
        
        for user in users:
            is_user_available = True
            for busy_slot in schedules.get(user, []):
                if max(slot_start, busy_slot['start']) < min(slot_end, busy_slot['end']):
                    is_user_available = False
                    break
            
            if is_user_available:
                available_users.append(user)

        if len(available_users) > 0:
            potential_slots.append({
                "start": slot_start.isoformat(),
                "end": slot_end.isoformat(),
                "attendees": available_users,
                "attendee_count": len(available_users)
            })
        
        current_time += interval
        
    sorted_slots = sorted(potential_slots, key=lambda x: (x['attendee_count'], x['start']), reverse=True)
    return sorted_slots[:5]

# --- 2. API ENDPOINTS / ROUTES ---

@app.route("/")
def index():
    """A simple route to check if the server is running."""
    return "The Time Finder API server is running! 🚀"

@app.route("/test_firebase")
@app.route("/test_firebase")
def test_full_logic():
    try:
        group_ref = db.collection('groups').document('testgroup1').get()
        if not group_ref.exists:
            return "Test document 'testgroup1' not found!", 404

        member_ids = group_ref.to_dict().get('members', [])
        print(f"Found member IDs: {member_ids}") # DEBUG PRINT 1
        
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
                # ADD THIS NEW PRINT STATEMENT
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
    """The main API endpoint for finding meeting times."""
    schedule_data = request.get_json()
    if not schedule_data:
        return jsonify({"error": "Invalid input. Please send JSON data."}), 400
    best_slots = find_optimal_slots(schedule_data)
    return jsonify(best_slots)

from werkzeug.utils import secure_filename
import os

# --- Add this right after you create the app instance ---
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# ---

@app.route('/api/ai/upload-material', methods=['POST'])


@app.route('/api/ai/upload-material', methods=['POST'])
@app.route('/api/ai/upload-material', methods=['POST'])
def handle_file_upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # This 'if' statement and everything inside it must be indented
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