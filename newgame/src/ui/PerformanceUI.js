class PerformanceUI {
  constructor(performanceMonitor) {
    this.performanceMonitor = performanceMonitor;
    this.initializeUI();
    this.updateInterval = null;
  }

  initializeUI() {
    // 创建性能监控面板
    const panel = document.createElement('div');
    panel.className = 'performance-panel';
    panel.innerHTML = `
      <div class="performance-header">
        <span>性能监控</span>
        <button class="toggle-button">_</button>
      </div>
      <div class="performance-content">
        <div class="performance-metrics">
          <div class="metric">
            <label>FPS:</label>
            <span id="fps-value">0</span>
          </div>
          <div class="metric">
            <label>内存使用:</label>
            <span id="memory-value">0 MB</span>
          </div>
          <div class="metric">
            <label>粒子数量:</label>
            <span id="particle-count">0</span>
          </div>
          <div class="metric">
            <label>活动效果:</label>
            <span id="active-effects">无</span>
          </div>
          <div class="metric">
            <label>性能策略:</label>
            <span id="current-strategy">MEDIUM</span>
          </div>
        </div>
        <div class="performance-controls">
          <select id="quality-select">
            <option value="LOW">低质量</option>
            <option value="MEDIUM" selected>中等质量</option>
            <option value="HIGH">高质量</option>
          </select>
          <button id="apply-quality">应用</button>
        </div>
        <div class="performance-graph">
          <canvas id="performance-canvas"></canvas>
        </div>
      </div>
    `;

    document.body.appendChild(panel);
    this.initializeEvents();
    this.initializeGraph();
  }

  initializeEvents() {
    // 切换面板显示/隐藏
    const toggleButton = document.querySelector('.toggle-button');
    const content = document.querySelector('.performance-content');
    
    toggleButton.addEventListener('click', () => {
      content.classList.toggle('collapsed');
      toggleButton.textContent = content.classList.contains('collapsed') ? '+' : '_';
    });

    // 质量设置控制
    const qualitySelect = document.getElementById('quality-select');
    const applyButton = document.getElementById('apply-quality');
    
    applyButton.addEventListener('click', () => {
      const newStrategy = qualitySelect.value;
      this.performanceMonitor.applyStrategy(newStrategy);
    });

    // 快捷键控制
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        panel.classList.toggle('hidden');
      }
    });
  }

  initializeGraph() {
    const canvas = document.getElementById('performance-canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置画布大小
    canvas.width = 200;
    canvas.height = 100;

    // 存储历史数据
    this.performanceHistory = {
      fps: new Array(60).fill(0),
      memory: new Array(60).fill(0)
    };

    // 开始绘制循环
    this.drawGraph(ctx);
  }

  drawGraph(ctx) {
    const draw = () => {
      // 清除画布
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      
      // 绘制FPS曲线
      ctx.beginPath();
      ctx.strokeStyle = '#00ff00';
      this.performanceHistory.fps.forEach((fps, i) => {
        const x = (i / 60) * ctx.canvas.width;
        const y = ctx.canvas.height - (fps / 60) * ctx.canvas.height;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // 绘制内存使用曲线
      ctx.beginPath();
      ctx.strokeStyle = '#ff0000';
      this.performanceHistory.memory.forEach((mem, i) => {
        const x = (i / 60) * ctx.canvas.width;
        const y = ctx.canvas.height - (mem / 100) * ctx.canvas.height;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      requestAnimationFrame(draw);
    };

    draw();
  }

  startMonitoring() {
    this.updateInterval = setInterval(() => {
      const status = this.performanceMonitor.getPerformanceStatus();
      this.updateMetrics(status);
      this.updateHistory(status);
    }, 1000);
  }

  stopMonitoring() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  updateMetrics(status) {
    // 更新FPS
    document.getElementById('fps-value').textContent = status.fps;
    
    // 更新内存使用
    const memoryMB = status.memory.usedJSHeapSize 
      ? Math.round(status.memory.usedJSHeapSize / (1024 * 1024)) 
      : 0;
    document.getElementById('memory-value').textContent = `${memoryMB} MB`;
    
    // 更新粒子数量
    document.getElementById('particle-count').textContent = status.particleCount;
    
    // 更新活动效果
    document.getElementById('active-effects').textContent = 
      status.activeEffects.length ? status.activeEffects.join(', ') : '无';
    
    // 更新当前策略
    document.getElementById('current-strategy').textContent = status.strategy;
    
    // 更新选择框
    document.getElementById('quality-select').value = status.strategy;
  }

  updateHistory(status) {
    // 更新FPS历史
    this.performanceHistory.fps.shift();
    this.performanceHistory.fps.push(status.fps);
    
    // 更新内存使用历史
    const memoryPercentage = status.memory.usedJSHeapSize 
      ? (status.memory.usedJSHeapSize / status.memory.totalJSHeapSize) * 100 
      : 0;
    this.performanceHistory.memory.shift();
    this.performanceHistory.memory.push(memoryPercentage);
  }
} 