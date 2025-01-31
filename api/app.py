from flask import Flask, render_template,redirect,url_for,request,jsonify,session,flash,make_response
from chatbot import chat
from news import *
from db import *
from pdf_reader import *
import speech_recognition as sr
from pydub import AudioSegment
from datetime import datetime, timedelta

from pydub.utils import mediainfo
import uuid

app = Flask(__name__)

app.secret_key = '11223344'

@app.route('/')
def home():
    session["user_id"]=None
    session["chat_id"]=1
    # return render_template('firstpage.html')
    return render_template('newfirstpage.html')

@app.route('/aboutus')
def aboutus():
    return render_template('aboutus.html')

@app.route('/process_audio', methods=['POST'])
def process_audio():
    print("Received audio file")

    if 'audio' not in request.files:
        print("No audio file found")
        return jsonify({"error": "No audio file received"}), 400

    # Extract the audio file from the request
    audio_file = request.files['audio']
    print(f"Received audio file: {audio_file.filename}, type: {audio_file.content_type}")

    # Save the raw file data to disk for debugging (optional, if you want to inspect)
    try:
        file_path = "received_audio_raw.wav"
        audio_file.save(file_path)
        print(f"Audio saved as '{file_path}' for debugging.")
    except Exception as e:
        print(f"Error saving audio file: {e}")
        return jsonify({"error": "Failed to save audio file"}), 500

        # Read the file into memory
    audio_file.seek(0)
    audio_blob = audio_file.read()

    # Debugging: Check the size of the audio blob
    print(f"Audio blob size: {len(audio_blob)} bytes")

    # Convert OGG (Opus) to WAV in memory using pydub
    try:
        audio = AudioSegment.from_file(io.BytesIO(audio_blob), format="ogg")  # Explicitly specify 'ogg' format
        wav_audio = io.BytesIO()
        audio.export(wav_audio, format="wav")  # Export as WAV to a BytesIO buffer
        wav_audio.seek(0)  # Reset pointer to the beginning of the buffer
    except Exception as e:
        print(f"Error during audio conversion: {str(e)}")
        return jsonify({"error": "Audio conversion failed"}), 500

    # Initialize the recognizer
    recognizer = sr.Recognizer()

    # Use the in-memory WAV audio with SpeechRecognition
    with sr.AudioFile(wav_audio) as source:
        audio_data = recognizer.record(source)  # Process in-memory audio

    try:
        # Convert speech to text
        text = recognizer.recognize_google(audio_data)
        return jsonify({"text": text})
    except sr.UnknownValueError:
        return jsonify({"text": "Could not understand audio"})
    except sr.RequestError:
        return jsonify({"text": "Error with speech recognition service"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/chatbot')
def chatbot():
    if session["user_id"]!=None:
        response = make_response(render_template("chatbot.html"))
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        return response
    
    else:
        flash("You need to login or sign up first.", "error")
        return render_template('firstpage.html')

@app.route('/welcome')
def welcome():
    return render_template('welcome.html')

# Dashboard route
@app.route('/dashboard')
def dashboard():
    return redirect(url_for("chatbot"))

# Events route
@app.route('/events')
def events():
    return render_template('events_new.html')

# News route
@app.route('/news')
def news():
    print("news lelo")
    return render_template('news2.html')

# Summary route
@app.route('/summary')
def summary():
    return render_template('summary.html')

# Settings route
@app.route('/settings')
def settings():
    return render_template('settings.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        phone = request.form['phone']
        password = request.form['password']
        gender = request.form['gender']
        dob = request.form['dob']

        create_user(username,email,phone,password,dob,gender)

        session["user_id"]=get_user_id(username)

        flash("you registered successfully!", "success")

        return redirect(url_for("chatbot"))

@app.route('/login', methods=['GET', 'POST'])
def login():
        if request.method == 'POST':
            username = request.form['username']
            password = request.form['password']

            if(check_user_password(username,password)):
                session["user_id"]=get_user_id(username)
                return redirect(url_for("chatbot"))
            else:
                flash("Invalid credentials. Please try again.", "error")
                return render_template('firstpage.html')
        
# Logout route
@app.route('/logout')
def logout():
    # Logic for logging out the user, for example, session clearing.
    session.clear()
    return redirect(url_for('home'))  # Redirect to home after logout.

@app.route("/get_chats", methods=["POST"])
def get_chats():
    """
    Fetches all chat messages for the current chat ID from the session.
    """
    chat_id = session["chat_id"] # Retrieve chat_id from the session
    user_id= session["user_id"]

    if not chat_id:
        return jsonify({"error": "No chat_id found in session"}), 400

    chats = get_chats_by_chat_id_and_user_id(chat_id,user_id)  # Fetch chat messages

    # print("\n\nchat ka length lele\n\n")
    # print(session.get("chat_id"))
    # print(len(chats))

    return jsonify({"chats": chats})

@app.route("/new_chat", methods=["POST"])
def new_chat():
    """
    Creates a new chat by generating a unique chat ID and updating the session.
    """
    user_id = session.get("user_id")  # Ensure the user is logged in

    if not user_id:
        return jsonify({"error": "User not logged in."}), 400

    # Generate a new unique chat ID
    new_chat_id = session["chat_id"]+1   # Generates a unique chat ID (UUID)

    # Update the session with the new chat ID
    session["chat_id"] = new_chat_id

    return jsonify({"chat_id": new_chat_id, "message": "New chat started successfully."})


@app.route("/change_chat_id", methods=["POST"])
def change_chat_id():
    """
    Updates the session's chat ID.
    """
    try:
        data = request.json
        new_chat_id = data.get("chat_id")

        if not new_chat_id:
            return jsonify({"error": "Chat ID is required"}), 400

        session["chat_id"] = new_chat_id  # Store in session
        return jsonify({"success": True, "chat_id": new_chat_id})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get_chat_ids", methods=["POST"])
def get_chat_ids():
    """
    Fetches all distinct chat IDs for a given user from the database.
    """
    user_id = session.get("user_id")  # Get user_id from the session
    
    if not user_id:
        return jsonify({"error": "User not logged in."}), 400

    # Fetch distinct chat IDs for the user
    chat_ids = get_distinct_chat_ids(user_id)

    if not chat_ids:
        return jsonify({"error": "No chats found for this user."}), 400

    # Return chat IDs as a list
    return jsonify({"chat_ids": chat_ids})


@app.route("/delete_chat", methods=["POST"])
def delete_chat():
    try:
        data = request.json
        chat_id = data.get("chat_id")
        user_id = session.get("user_id")  # Assuming user is logged in

        if not chat_id or not user_id:
            return jsonify({"error": "Missing chat_id or user_id"}), 400

        # Call the delete_chat_from_db function
        is_deleted = delete_chat_from_db(chat_id, user_id)

        if is_deleted:
            return jsonify({"success": True, "message": "Chat deleted successfully"})
        else:
            return jsonify({"error": "Failed to delete chat"}), 500

    except Exception as e:
        return jsonify({"error": f"Server error: {e}"}), 500


@app.route('/schedule_event', methods=['POST'])
def handle_schedule_event():
    if 'user_id' not in session:
        return jsonify({"status": "error", "message": "User not logged in"}), 401

    data = request.get_json()
    event_name = data.get('event_name')
    event_date = data.get('event_date')  # Format: YYYY-MM-DD
    start_time = data.get('start_time')  # Format: HH:MM
    end_time = data.get('end_time')      # Format: HH:MM
    color = data.get('color')            # Event color (Hex code, optional)
    description = data.get('description')  # Event description (optional)
    every_year = data.get('everyYear', False)  # Boolean indicating if event is annual

    if not event_name or not event_date or not start_time or not end_time:
        return jsonify({"status": "error", "message": "Missing required fields"}), 400

    # Combine date and time into a single timestamp
    try:
        timestamp = f"{event_date} {start_time}:00"
        start_datetime = datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S")
        end_datetime = datetime.strptime(f"{event_date} {end_time}:00", "%Y-%m-%d %H:%M:%S")
        duration = (end_datetime - start_datetime).seconds // 60  # Duration in minutes
    except ValueError as e:
        return jsonify({"status": "error", "message": "Invalid date or time format"}), 400

    # Schedule the event
    user_id = session['user_id']
    try:
        schedule_event(user_id, event_name, start_datetime, duration, color, description, every_year)
        return jsonify({"status": "success", "message": "Event scheduled successfully"}), 200
    except mysql.connector.Error as e:
        print(f"Error scheduling event: {e}")
        return jsonify({"status": "error", "message": "Database error occurred while scheduling event"}), 500
    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/get_events', methods=['GET'])
def get_events():
    if 'user_id' not in session:
        return jsonify({"status": "error", "message": "User not logged in"}), 401
    
    user_id = session['user_id']
    
    try:
        # Fetch events for the logged-in user from the database
        events = get_user_events(user_id)
        
        # Format the events for the calendar
        formatted_events = []
        for event in events:
            formatted_events.append({
                'id': event['event_id'],  # Event's ID
                'name': event['event_name'],  # Event's name
                'date': event['timestamp'].split(' ')[0],  # Extract date part (YYYY-MM-DD)
                'time': [event['timestamp'].split(' ')[1],  # Extract time part (HH:MM:SS)
                         (datetime.strptime(event['timestamp'], "%Y-%m-%d %H:%M:%S") + timedelta(minutes=event['duration'])).strftime('%H:%M:%S')],  # Add duration to start time
                'description': event['description'],  # Event's description
                'color': event['color'],  # Event color
                'everyYear': event['everyYear']  # Whether event repeats every year
            })
        print(formatted_events)
        return jsonify(formatted_events)
    
    except Exception as e:
        print (e)
        return jsonify({"status": "error", "message": str(e)}), 500


# Search route (if you're processing search input)
@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('q')  # Get the search query from the form.
    # Add logic to process the search query and return results.
    return render_template('search_results.html', query=query)

@app.route("/summarize", methods=["POST"])
def summarize_pdf():
    # Read the PDF file from the request body
    pdf_bytes = request.data  # Get raw PDF data
    if not pdf_bytes:
        return jsonify({"error": "No PDF data received"}), 400

    text = read_pdf(pdf_bytes)  # Extract text from PDF
    if not text:
        return jsonify({"error": "No text found in PDF"}), 400

    summary = summarize_pdf_doc(text)  # Summarize extracted text
    return jsonify({"summary": summary})

@app.route("/translate_pdf", methods=["POST"])
def translate_pdf():
    # Read the PDF file from the request body
    pdf_bytes = request.data  # Get raw PDF data
    if not pdf_bytes:
        return jsonify({"error": "No PDF data received"}), 400

    text = read_pdf(pdf_bytes)  # Extract text from PDF
    if not text:
        return jsonify({"error": "No text found in PDF"}), 400

    summary=translate_text(text)  # Summarize extracted text
    return jsonify({"summary": summary})

# Notifications route
@app.route('/notifications')
def notifications():
    return render_template('notifications.html')

# Profile route
@app.route('/profile')
def profile():
    return render_template('profile.html')

# Assistant route (for your assistant input form)
@app.route('/assistant', methods=['GET','POST'])
async def assistant():
    data = request.get_json('query')
    query=data.get("query")

    # Process the query here (For now, just returning a mock response)
    # You can use your own assistant logic or model here
    response = chat(session['user_id'],session["chat_id"],query)
    
    # Return the response as JSON
    return jsonify({'response': response})

@app.route('/fetchnews', methods=['GET','POST'])
async def fetchnews():
    data = request.get_json()
    query = data.get("query")

    if not query:
        return jsonify({'error': 'No query provided'}), 400

    # Fetch personalized news using the provided function
    filtered_news = news_scrape()

    if not filtered_news:
        return jsonify({'newslist': [], 'message': 'No relevant news found.'})

    # Format the news items
    newslist = [
        {"title": news["title"], "link": news["link"], "image_url": news["image_link"]}
        for news in filtered_news
    ]

    #print(newslist)

    return jsonify({'newslist': newslist})

if __name__ == '__main__':
    app.run(debug=True)
