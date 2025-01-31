from app import app  # Import the Flask instance from app.py

if __name__ == "__main__":
    app.run(debug=True)
else:
    # This is the variable your WSGI server (e.g., Gunicorn) looks for
    application = app
