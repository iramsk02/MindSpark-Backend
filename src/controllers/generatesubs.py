   
# import sys
# import whisper
# from deep_translator import GoogleTranslator
# import os

# video_path = sys.argv[1]
# target_lang = sys.argv[2]
# output_vtt = sys.argv[3]  # should end with .vtt
# print("Generating:", output_vtt)

# model = whisper.load_model("base")
# result = model.transcribe(video_path, task="translate", language="en")

# translator = GoogleTranslator(source='auto', target=target_lang)

# def format_timestamp(seconds: float):
#     hours = int(seconds // 3600)
#     minutes = int((seconds % 3600) // 60)
#     secs = int(seconds % 60)
#     millis = int((seconds - int(seconds)) * 1000)
#     return f"{hours:02}:{minutes:02}:{secs:02}.{millis:03}"

# with open(output_vtt, "w", encoding="utf-8") as f:
#     f.write("WEBVTT\n\n")
#     for segment in result["segments"]:
#         start = format_timestamp(segment["start"])
#         end = format_timestamp(segment["end"])
#         text = translator.translate(segment["text"])
#         f.write(f"{start} --> {end}\n")
#         f.write(text + "\n\n")
import sys
import whisper
from deep_translator import GoogleTranslator
import os

# Get arguments from command line
video_path = sys.argv[1]
target_lang = sys.argv[2]
output_vtt = sys.argv[3]  # should end with .vtt

print("Generating subtitles for:", video_path)
print("Subtitles will be in language:", target_lang)
print("Output file:", output_vtt)

# Load whisper model
model = whisper.load_model("base")
try:
    # Transcribe and translate the video
    result = model.transcribe(video_path, task="translate", language="en")
except Exception as e:
    print(f"Error during transcription: {e}")
    sys.exit(1)

# Initialize the translator
translator = GoogleTranslator(source='auto', target=target_lang)

# Helper function to format timestamp to match VTT format
def format_timestamp(seconds: float):
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds - int(seconds)) * 1000)
    return f"{hours:02}:{minutes:02}:{secs:02}.{millis:03}"

# Writing the subtitles to a VTT file
try:
    with open(output_vtt, "w", encoding="utf-8") as f:
        f.write("WEBVTT\n\n")
        for i, segment in enumerate(result["segments"]):
            start = format_timestamp(segment["start"])
            end = format_timestamp(segment["end"])
            text = translator.translate(segment["text"])  # Translate text

            # Writing subtitle entry to the file
            f.write(f"{i + 1}\n")
            f.write(f"{start} --> {end}\n")
            f.write(text + "\n\n")
    
    print(f"Subtitles successfully saved to {output_vtt}")

except Exception as e:
    print(f"Error while writing VTT file: {e}")
    sys.exit(1)
