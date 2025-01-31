import speech_recognition as sr
from pdf_reader import *
from translatebot import *

recognizer = sr.Recognizer()
with sr.Microphone() as source:
    print("Say something...")
    audio = recognizer.listen(source)

try:
    text = recognizer.recognize_google(audio,language="hi-IN")
    print("You said:", text)
    print(translate_text(text,"hi","en"))
except sr.UnknownValueError:
    print("Could not understand audio")
except sr.RequestError:
    print("Could not request results")


