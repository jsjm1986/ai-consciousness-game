window.PerformanceMonitor = class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: 0,
      memory: {},
      particleCount: 0
    };
  }

  initialize() {
    this.startFPSMonitoring();
  }

  startFPSMonitoring() {
    let lastTime = performance.now();
    let frames = 0;

    const measureFPS = () => {
      const currentTime = performance.now();
      frames++;

      if (currentTime >= lastTime + 1000) {
        this.metrics.fps = Math.round((frames * 1000) / (currentTime - lastTime));
        frames = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  updateParticleCount(count) {
    this.metrics.particleCount = count;
  }
} 