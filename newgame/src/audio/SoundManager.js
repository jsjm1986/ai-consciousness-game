window.SoundManager = class SoundManager {
  constructor() {
    // 音效库
    this.sounds = {
      typing: document.getElementById('typing'),
      choice: document.getElementById('choice'),
      phaseChange: document.getElementById('phase-change'),
      error: document.getElementById('error'),
      hover: document.getElementById('hover'),
      dilemma: document.getElementById('phase-change'),
      success: document.getElementById('choice'),
      gameOver: document.getElementById('error'),
      glitch: document.getElementById('glitch'),
      ambient: document.getElementById('ambient')
    };

    // 音效设置
    this.settings = {
      masterVolume: 0.3,
      sfxVolume: 0.5,
      ambientVolume: 0.1,
      enabled: true
    };

    // 音频状态
    this.isInitialized = false;
    this.pendingAmbient = false;
    this.audioContext = null;
  }

  initialize() {
    // 不要立即创建 AudioContext，等待用户交互
    const initAudio = () => {
      if (this.isInitialized) return;

      // 创建 AudioContext
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // 初始化音效
      this.initializeSounds();
      
      // 加载用户设置
      this.loadSettings();
      
      this.isInitialized = true;

      // 如果有待播放的环境音乐
      if (this.pendingAmbient) {
        this.startAmbient();
      }

      // 移除事件监听器
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };

    // 添加用户交互事件监听
    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);

    // 添加开始游戏按钮
    this.showStartPrompt();
  }

  showStartPrompt() {
    const startPrompt = document.createElement('div');
    startPrompt.className = 'start-prompt';
    startPrompt.innerHTML = `
      <div class="start-content">
        <h2>准备开始游戏</h2>
        <p>点击开始按钮进入游戏世界</p>
        <button id="start-button">开始游戏</button>
      </div>
    `;

    startPrompt.querySelector('#start-button').onclick = () => {
      // 初始化音频
      if (!this.isInitialized) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.initializeSounds();
        this.isInitialized = true;
      }
      
      // 启动环境音乐
      this.startAmbient();
      
      // 移除提示界面
      startPrompt.remove();
    };

    document.body.appendChild(startPrompt);
  }

  initializeSounds() {
    if (!this.audioContext) return;

    // 设置循环播放的音效
    this.sounds.ambient.loop = true;
    
    // 设置所有音效的音量
    Object.values(this.sounds).forEach(sound => {
      if (sound) {
        sound.volume = this.settings.masterVolume;
      }
    });

    // 特别设置环境音量
    if (this.sounds.ambient) {
      this.sounds.ambient.volume = this.settings.masterVolume * this.settings.ambientVolume;
    }
  }

  loadSettings() {
    const savedSettings = localStorage.getItem('soundSettings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      this.applySettings();
    }
  }

  saveSettings() {
    localStorage.setItem('soundSettings', JSON.stringify(this.settings));
  }

  applySettings() {
    if (!this.settings.enabled) {
      this.stopAll();
      return;
    }

    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.settings.masterVolume * this.settings.sfxVolume;
    });
    
    this.sounds.ambient.volume = this.settings.masterVolume * this.settings.ambientVolume;
  }

  // 播放音效的方法
  playTyping() {
    if (!this.settings.enabled) return;
    this.stopSound(this.sounds.typing);
    this.sounds.typing.currentTime = 0;
    this.sounds.typing.play().catch(e => console.warn('音效播放失败:', e));
  }

  playChoice() {
    if (!this.settings.enabled) return;
    this.playSound(this.sounds.choice);
  }

  playPhaseChange() {
    if (!this.settings.enabled) return;
    this.playSound(this.sounds.phaseChange);
  }

  playError() {
    if (!this.settings.enabled) return;
    this.playSound(this.sounds.error);
  }

  playHover() {
    if (!this.settings.enabled) return;
    this.playSound(this.sounds.hover);
  }

  playDilemma() {
    if (!this.settings.enabled) return;
    this.playSound(this.sounds.dilemma);
  }

  playSuccess() {
    if (!this.settings.enabled) return;
    this.playSound(this.sounds.success);
  }

  playGameOver() {
    if (!this.settings.enabled) return;
    this.playSound(this.sounds.gameOver);
  }

  playGlitch() {
    if (!this.settings.enabled) return;
    this.playSound(this.sounds.glitch);
  }

  // 环境音乐控制
  startAmbient() {
    if (!this.isInitialized) {
      this.pendingAmbient = true;
      return;
    }

    if (this.settings.enabled && this.sounds.ambient) {
      // 确保 AudioContext 处于运行状态
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      this.sounds.ambient.play().catch(e => {
        console.warn('环境音乐播放失败:', e);
        this.pendingAmbient = true;
      });
    }
  }

  stopAmbient() {
    this.sounds.ambient.pause();
    this.sounds.ambient.currentTime = 0;
  }

  // 通用音效控制方法
  playSound(sound) {
    if (!this.isInitialized || !this.settings.enabled || !sound) return;
    
    try {
      if (!sound.paused) {
        sound.currentTime = 0;
      }
      
      // 确保 AudioContext 处于运行状态
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      sound.play().catch(e => console.warn('音效播放失败:', e));
    } catch (error) {
      console.warn('音效播放出错:', error);
    }
  }

  stopSound(sound) {
    sound.pause();
    sound.currentTime = 0;
  }

  stopAll() {
    Object.values(this.sounds).forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
  }

  // 音量控制
  setMasterVolume(value) {
    this.settings.masterVolume = Math.max(0, Math.min(1, value));
    this.applySettings();
    this.saveSettings();
  }

  setSFXVolume(value) {
    this.settings.sfxVolume = Math.max(0, Math.min(1, value));
    this.applySettings();
    this.saveSettings();
  }

  setAmbientVolume(value) {
    this.settings.ambientVolume = Math.max(0, Math.min(1, value));
    this.applySettings();
    this.saveSettings();
  }

  toggleSound(enabled) {
    this.settings.enabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
    this.saveSettings();
  }
} 