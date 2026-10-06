/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SpeechRecognitionResultHandler {
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

export class VoiceSpeechRecognizer {
  private recognition: any = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'pl-PL';
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public start(handlers: SpeechRecognitionResultHandler): boolean {
    if (!this.recognition) {
      handlers.onError('Przeglądarka nie obsługuje Web Speech API.');
      return false;
    }

    if (this.isListening) {
      return true;
    }

    try {
      let finalTranscript = '';

      this.recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const currentText = finalTranscript || interim;
        handlers.onResult(currentText);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        handlers.onError(event.error || 'Błąd rozpoznawania mowy');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        handlers.onEnd();
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (err: any) {
      this.isListening = false;
      const errorStr = err instanceof Error ? err.message : String(err);
      handlers.onError(errorStr || 'Nie udało się uruchomić mikrofonu');
      return false;
    }
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.isListening = false;
    }
  }
}
