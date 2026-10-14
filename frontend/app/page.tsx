
"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const Speech =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!Speech) {
      setMessage("Speech recognition is not supported in this browser.");
      return;
    }

    const speech = new Speech();

    speech.lang = "en-IN";
    speech.continuous = true;
    speech.interimResults = false;

    speech.onresult = (event: any) => {
      const result =
        event.results[event.results.length - 1][0].transcript;

      setText((previous) => previous + result + " ");
    };

    speech.onerror = () => {
      setListening(false);
      setMessage("Speech recognition failed. Check microphone permission.");
    };

    speech.onend = () => {
      setListening(false);
    };

    setRecognition(speech);

    return () => {
      speech.abort();
    };
  }, []);

  function startRecording() {
    if (!recognition) {
      setMessage("Speech recognition is not ready. Try Chrome.");
      return;
    }

    try {
      recognition.start();
      setListening(true);
      setMessage("Listening... Speak now.");
    } catch {
      setMessage("Unable to start recording. Please try again.");
    }
  }

  function stopRecording() {
    if (recognition) {
      recognition.stop();
    }

    setListening(false);
    setMessage("Recording stopped.");
  }

  async function saveText() {
    if (text.trim() === "") {
      setMessage("Please enter some text first.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/api/transcriptions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transcript: text.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save transcription.");
      }

      setText("");
      setMessage("Transcription saved successfully!");
    } catch {
      setMessage("Cannot connect to the backend.");
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-xl rounded-xl bg-white p-6 shadow">
        <h1 className="text-center text-3xl font-bold">
          Speech Transcription
        </h1>

        <p className="mt-2 text-center text-gray-500">
          Convert your voice into text
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={startRecording}
            disabled={listening}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            Start Recording
          </button>

          <button
            onClick={stopRecording}
            disabled={!listening}
            className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50"
          >
            Stop Recording
          </button>
        </div>

        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Your speech will appear here..."
          rows={6}
          className="mt-6 w-full rounded border p-3"
        />

        <button
          onClick={saveText}
          className="mt-4 w-full rounded bg-green-600 p-3 text-white"
        >
          Save Transcription
        </button>

        <p className="mt-4 text-center">{message}</p>
      </div>
    </main>
  );
}
