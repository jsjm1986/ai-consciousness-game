window.VisualEffectsManager = class VisualEffectsManager {
  constructor() {
    // 初始化基本属性
    this.activeEffects = new Set();
    this.particles = [];
    this.matrixRain = [];
    
    // 性能监控配置
    this.performanceConfig = {
      maxParticles: 1000,
      maxEffects: 5,
      qualityLevels: {
        low: { particleMultiplier: 0.5, effectQuality: 'low' },
        medium: { particleMultiplier: 1.0, effectQuality: 'medium' },
        high: { particleMultiplier: 1.5, effectQuality: 'high' }
      }
    };

    // 当前性能策略
    this.currentQuality = 'medium';
    this.particleMultiplier = 1.0;
    
    // 矩阵雨的配置
    this.matrixConfig = {
      fontSize: 14,
      characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,./<>?",
      color: '#0F0',
      speed: 1,
      density: 0.05
    };

    // 初始化画布和效果
    this.initializeEffects();

    // 监听性能事件
    this.setupPerformanceMonitoring();
  }

  createEffect(type, x, y) {
    switch (type) {
      case 'particles':
        this.createParticles(x, y);
        break;
      case 'ripple':
        this.createRipple(x, y);
        break;
      case 'glitch':
        this.createGlitchEffect(x, y);
        break;
      case 'matrixRain':
        this.startMatrixRain();
        break;
    }
  }

  startEffect(effectName) {
    this.activeEffects.add(effectName);
    switch (effectName) {
      case 'matrixRain':
        this.startMatrixRain();
        break;
      case 'scanline':
        this.startScanline();
        break;
    }
  }

  stopEffect(effectName) {
    this.activeEffects.delete(effectName);
  }

  createParticles(x, y, count = 20) {
    const adjustedCount = Math.floor(count * this.particleMultiplier);
    for (let i = 0; i < adjustedCount; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: Math.random() * 3,
        life: 1,
        decay: 0.02
      });
    }
  }

  createRipple(x, y) {
    const ripple = {
      x,
      y,
      radius: 0,
      maxRadius: 100,
      speed: 2,
      opacity: 1
    };
    this.activeEffects.add('ripple');
    this.updateRipple(ripple);
  }

  createGlitchEffect(x, y) {
    const glitch = {
      x,
      y,
      duration: 500,
      startTime: performance.now()
    };
    this.activeEffects.add('glitch');
    this.updateGlitchEffect(glitch);
  }

  startMatrixRain() {
    if (!this.canvas) return;
    
    // 初始化矩阵雨数组
    const columns = Math.ceil(this.canvas.width / this.matrixConfig.fontSize);
    this.matrixRain = new Array(columns).fill(0);

    // 随机设置一些初始位置
    for (let i = 0; i < columns; i++) {
      if (Math.random() < this.matrixConfig.density) {
        this.matrixRain[i] = Math.floor(Math.random() * this.canvas.height / this.matrixConfig.fontSize);
      }
    }
  }

  updateEffects() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 更新粒子
    this.updateParticles();

    // 更新矩阵雨
    if (this.activeEffects.has('matrixRain')) {
      this.updateMatrixRain();
    }

    // 继续动画循环
    requestAnimationFrame(() => this.updateEffects());
  }

  updateParticles() {
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= particle.decay;

      if (particle.life <= 0) return false;

      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(0, 255, 0, ${particle.life})`;
      this.ctx.fill();

      return true;
    });
  }

  initializeEffects() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'effects-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1000';
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.updateEffects();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // 重新初始化矩阵雨
    if (this.activeEffects.has('matrixRain')) {
      this.startMatrixRain();
    }
  }

  setupPerformanceMonitoring() {
    let lastTime = performance.now();
    let frames = 0;
    let fps = 0;

    const measureFPS = () => {
      const currentTime = performance.now();
      frames++;

      if (currentTime >= lastTime + 1000) {
        fps = Math.round((frames * 1000) / (currentTime - lastTime));
        frames = 0;
        lastTime = currentTime;
        this.adjustQualityBasedOnFPS(fps);
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  adjustQualityBasedOnFPS(fps) {
    if (fps < 30 && this.currentQuality !== 'low') {
      this.currentQuality = 'low';
      this.particleMultiplier = this.performanceConfig.qualityLevels.low.particleMultiplier;
    } else if (fps > 45 && fps < 55 && this.currentQuality !== 'medium') {
      this.currentQuality = 'medium';
      this.particleMultiplier = this.performanceConfig.qualityLevels.medium.particleMultiplier;
    } else if (fps > 58 && this.currentQuality !== 'high') {
      this.currentQuality = 'high';
      this.particleMultiplier = this.performanceConfig.qualityLevels.high.particleMultiplier;
    }
  }

  updateMatrixRain() {
    // 添加半透明的黑色层，创造拖尾效果
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = this.matrixConfig.color;
    this.ctx.font = `${this.matrixConfig.fontSize}px monospace`;

    // 更新每一列的雨滴
    for (let i = 0; i < this.matrixRain.length; i++) {
      // 随机生成字符
      const char = this.matrixConfig.characters.charAt(
        Math.floor(Math.random() * this.matrixConfig.characters.length)
      );

      // 计算x坐标
      const x = i * this.matrixConfig.fontSize;
      // 计算y坐标
      const y = this.matrixRain[i] * this.matrixConfig.fontSize;

      // 绘制字符
      this.ctx.fillText(char, x, y);

      // 更新雨滴位置
      if (y > this.canvas.height && Math.random() > 0.975) {
        this.matrixRain[i] = 0;
      } else {
        this.matrixRain[i]++;
      }
    }
  }

  stopMatrixRain() {
    this.matrixRain = [];
  }
} 