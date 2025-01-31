import fitz  # PyMuPDF
from translatebot import translate_text
from gtts import gTTS
import os
import io
from chatbot import *

def speak(text,language="hi"):
    tts = gTTS(text=text, lang=language)
    tts.save("output.mp3")  # Save the speech as a file
    os.system("start output.mp3")  # Windows: Play the file (use 'afplay' on macOS, 'mpg321' on Linux)

def read_pdf(pdf_bytes):
    """Extracts text from a PDF file received as bytes."""
    text = ""
    with io.BytesIO(pdf_bytes) as f:
        doc = fitz.open(stream=f, filetype="pdf")
        for page in doc:
            text += page.get_text() + "\n"
    return text.strip()

def summarize_pdf_doc(text):
    """Sends text to chatbot for summarization."""
    response = one_time_chat( "Summarize this text briefly and tell full context:\n" + text)
    return response

def translate_pdf_doc(text):
    return translate_text(text)



