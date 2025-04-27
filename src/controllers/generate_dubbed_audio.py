# # import sys
# # from gtts import gTTS
# # import whisper
# # import os

# # video_path = sys.argv[1]
# # language = sys.argv[2]
# # srt_path = sys.argv[3]
# # audio_out = sys.argv[4]

# # # 1. Transcribe or translate subtitles (can also use Whisper for translation)
# # model = whisper.load_model("base")
# # result = model.transcribe(video_path, task="translate" if language != "en" else "transcribe")
# # segments = result["segments"]

# # # 2. Save subtitles (optional, already done)
# # with open(srt_path, "w", encoding="utf-8") as f:
# #     f.write(result["text"])  # Or build .vtt style from segments

# # # 3. Generate audio from text
# # tts = gTTS(result["text"], lang="hi")
# # tts.save(audio_out)

# # print("Audio dubbing created and subtitles saved.")
# import sys
# from gtts import gTTS
# import whisper
# import os
# from googletrans import Translator

# video_path = sys.argv[1]
# language = sys.argv[2]  # Target language (e.g., 'hi')
# srt_path = sys.argv[3]
# audio_out = sys.argv[4]

# # 1. Transcribe the video (don't use Whisper's translate task)
# model = whisper.load_model("base")
# result = model.transcribe(video_path, task="transcribe")  # Always transcribe, not translate
# segments = result["segments"]
# transcribed_text = result["text"]

# # 2. Translate the text using googletrans

# translator = Translator()
# translated = translator.translate(transcribed_text, dest=language)
# translated_text = translated.text
# # 3. Save translated subtitles (optional)
# with open(srt_path, "w", encoding="utf-8") as f:
#     f.write(translated_text)

# # 4. Generate dubbed audio in the correct language
# tts = gTTS(translated_text, lang=language)
# tts.save(audio_out)

# print("Audio dubbing created and subtitles saved.")
import sys
from google.cloud import speech
from google.cloud import translate_v2 as translate
from google.cloud import texttospeech
import os
import subprocess
import shutil

# Set up Google Cloud API keys
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "path_to_your_service_account_key.json"

# Get arguments from command line
video_path = sys.argv[1]
target_lang = sys.argv[2]
output_audio_path = sys.argv[3]  # should end with .mp3 for the translated audio
output_transcript_path = sys.argv[4]  # Path to save the transcript file (optional)

print("Processing video:", video_path)
print("Translating to language:", target_lang)
print("Output translated audio:", output_audio_path)

# Step 1: Extract audio from the video
audio_path = video_path.replace(".mp4", ".wav")
print("Extracting audio from video...")
try:
    subprocess.run(
        ["ffmpeg", "-y", "-i", video_path, "-ar", "16000", "-ac", "1", audio_path],
        check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE
    )
    print(f"Audio extracted and saved to: {audio_path}")
except subprocess.CalledProcessError as e:
    print(f"Error extracting audio: {e.stderr.decode()}")
    sys.exit(1)

# Step 2: Transcribe the audio using Google Cloud Speech-to-Text
def transcribe_audio(audio_path):
    client = speech.SpeechClient()
    with open(audio_path, "rb") as audio_file:
        content = audio_file.read()

    audio = speech.RecognitionAudio(content=content)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=16000,
        language_code="en-US",
    )

    response = client.recognize(config=config, audio=audio)
    transcript = ""
    for result in response.results:
        transcript += result.alternatives[0].transcript
    return transcript

try:
    print("Transcribing audio...")
    transcript = transcribe_audio(audio_path)
    print("Transcription successful:", transcript)
except Exception as e:
    print(f"Error during transcription: {e}")
    sys.exit(1)

# Step 3: Translate the transcription using Google Cloud Translation
def translate_text(text, target_lang):
    translate_client = translate.Client()
    translation = translate_client.translate(text, target_lang=target_lang)
    return translation["translatedText"]

print(f"Translating transcript to {target_lang}...")
translated_text = translate_text(transcript, target_lang)
print(f"Translation successful: {translated_text}")

# Step 4: Save original audio (copy to output folder)
original_audio_path = video_path.replace(".mp4", "_original.wav")
shutil.copy(audio_path, original_audio_path)
print(f"Original audio saved to: {original_audio_path}")

# Step 5: Generate translated audio using Google Text-to-Speech
def generate_audio_from_text(text, target_lang, output_path):
    client = texttospeech.TextToSpeechClient()
    synthesis_input = texttospeech.SynthesisInput(text=text)
    voice = texttospeech.VoiceSelectionParams(
        language_code=target_lang,
        ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL,
    )
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    response = client.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )

    with open(output_path, "wb") as out:
        out.write(response.audio_content)
    print(f"Translated audio saved to: {output_path}")

try:
    print("Generating translated audio...")
    generate_audio_from_text(translated_text, target_lang, output_audio_path)
except Exception as e:
    print(f"Error generating translated audio: {e}")
    sys.exit(1)

# Step 6: Optional - Save the transcription to a text file (if provided)
if output_transcript_path:
    try:
        with open(output_transcript_path, "w", encoding="utf-8") as f:
            f.write("Original Transcript:\n")
            f.write(transcript + "\n\n")
            f.write("Translated Transcript:\n")
            f.write(translated_text + "\n")
        print(f"Transcript saved to {output_transcript_path}")
    except Exception as e:
        print(f"Error saving transcript: {e}")

# Final outputs
print("Process completed successfully!")
print(f"Original audio file: {original_audio_path}")
print(f"Translated audio file: {output_audio_path}")
