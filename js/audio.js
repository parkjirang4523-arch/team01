/**
 * audio.js - Web Audio API 기반 효과음 합성 모듈
 * 브라우저 자동 재생 정책(Autoplay Policy)을 완벽히 준수하여 사용자 제스처 후 활성화
 */

class SoundEffects {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.lastTensionTime = 0;
    this.isUserInteracted = false;

    // 사용자 제스처(클릭, 터치, 키다운) 감지 시 오디오 컨텍스트 활성화
    this.bindGestureActivation();
  }

  bindGestureActivation() {
    const unlock = () => {
      this.isUserInteracted = true;
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      // 한 번 활성화되면 이벤트 리스너 제거
      ['click', 'pointerdown', 'touchstart', 'keydown'].forEach(evt => {
        window.removeEventListener(evt, unlock);
      });
    };

    ['click', 'pointerdown', 'touchstart', 'keydown'].forEach(evt => {
      window.addEventListener(evt, unlock, { once: true, passive: true });
    });
  }

  init() {
    if (!this.isUserInteracted) return;
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return !this.isMuted;
  }

  // 실 당길 때 장력 마찰음
  playStringTension(rate = 1.0) {
    if (this.isMuted || !this.isUserInteracted) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime;
    if (now - this.lastTensionTime < 0.08) return;
    this.lastTensionTime = now;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const baseFreq = 160 + (rate * 280);
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 60, now + 0.06);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  // 도형이 100% 접혀 완성되었을 때 '찰칵' 스냅 사운드
  playSnap() {
    if (this.isMuted || !this.isUserInteracted) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  // 퀴즈 정답 사운드
  playCorrect() {
    if (this.isMuted || !this.isUserInteracted) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = now + idx * 0.07;
        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.28);
      });
    } catch (e) {}
  }

  // 퀴즈 오답 사운드
  playWrong() {
    if (this.isMuted || !this.isUserInteracted) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(130, now + 0.2);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }
}

window.soundFx = new SoundEffects();
