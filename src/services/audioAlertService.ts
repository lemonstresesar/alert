class AudioAlertService {
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private isSirenPlaying = false;
  private sirenInterval: any = null;

  playEmergencySiren(durationMs: number = 4000): void {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      if (this.isSirenPlaying) {
        this.stopSiren();
        return;
      }

      this.isSirenPlaying = true;
      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      gainNode.gain.setValueAtTime(0.15, this.audioCtx.currentTime);

      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);
      osc.start();

      let toggle = false;
      this.sirenInterval = setInterval(() => {
        if (!this.audioCtx) return;
        const targetFreq = toggle ? 780 : 440;
        osc.frequency.setTargetAtTime(targetFreq, this.audioCtx.currentTime, 0.1);
        toggle = !toggle;
      }, 350);

      this.oscillator = osc;

      // Auto stop after duration
      setTimeout(() => {
        this.stopSiren();
      }, durationMs);
    } catch (e) {
      console.warn('Audio synthesis not supported or blocked by browser', e);
    }
  }

  stopSiren(): void {
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch {}
      this.oscillator = null;
    }
    this.isSirenPlaying = false;
  }

  speakAlert(text: string): boolean {
    if (!('speechSynthesis' in window)) return false;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.05;
      utterance.pitch = 1.1;

      // Find French voice if available
      const voices = window.speechSynthesis.getVoices();
      const frVoice = voices.find((v) => v.lang.startsWith('fr'));
      if (frVoice) {
        utterance.voice = frVoice;
      }

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e) {
      console.warn('Speech synthesis error', e);
      return false;
    }
  }

  isPlaying(): boolean {
    return this.isSirenPlaying;
  }
}

export const audioAlertService = new AudioAlertService();
