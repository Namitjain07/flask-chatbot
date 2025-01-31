from pydub import AudioSegment

# Load the audio file using pydub
try:
    audio = AudioSegment.from_wav('received_audio_raw.wav')
    print(f"Channels: {audio.channels}")
    print(f"Sample rate: {audio.frame_rate}")
    print(f"Duration: {len(audio) / 1000.0} seconds")
except Exception as e:
    print(f"Error loading audio: {e}")