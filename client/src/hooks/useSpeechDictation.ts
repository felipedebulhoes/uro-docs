import { useCallback, useEffect, useRef, useState } from "react";

// Minimal typings for the Web Speech API (not in TS DOM lib by default)
interface ISpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      0: { transcript: string };
    };
  };
}

interface ISpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => ISpeechRecognition;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export interface UseSpeechDictationResult {
  supported: boolean;
  listening: boolean;
  /** Field id currently being dictated, or null */
  activeField: string | null;
  /** Toggle dictation for a given field. onText receives appended transcript chunks. */
  toggle: (fieldId: string, onText: (chunk: string) => void) => void;
  stop: () => void;
}

/**
 * Web Speech API based dictation for filling text fields hands-free.
 * Designed for use during surgery when hands are occupied.
 */
export function useSpeechDictation(lang = "pt-BR"): UseSpeechDictationResult {
  const [listening, setListening] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const onTextRef = useRef<((chunk: string) => void) | null>(null);
  const supported = getRecognitionCtor() !== null;

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* noop */
      }
    }
    setListening(false);
    setActiveField(null);
  }, []);

  const toggle = useCallback(
    (fieldId: string, onText: (chunk: string) => void) => {
      const Ctor = getRecognitionCtor();
      if (!Ctor) return;

      // If already listening on this field, stop.
      if (listening && activeField === fieldId) {
        stop();
        return;
      }

      // If listening on another field, stop first.
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          /* noop */
        }
      }

      const recognition = new Ctor();
      recognition.lang = lang;
      recognition.continuous = true;
      recognition.interimResults = false;
      onTextRef.current = onText;

      recognition.onresult = (event: ISpeechRecognitionEvent) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            const transcript = result[0].transcript.trim();
            if (transcript && onTextRef.current) {
              onTextRef.current(transcript);
            }
          }
        }
      };

      recognition.onerror = () => {
        setListening(false);
        setActiveField(null);
      };

      recognition.onend = () => {
        setListening(false);
        setActiveField(null);
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
        setListening(true);
        setActiveField(fieldId);
      } catch {
        setListening(false);
        setActiveField(null);
      }
    },
    [listening, activeField, lang, stop]
  );

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          /* noop */
        }
      }
    };
  }, []);

  return { supported, listening, activeField, toggle, stop };
}
