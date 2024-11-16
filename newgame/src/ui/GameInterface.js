window.GameInterface = class GameInterface {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`找不到容器元素: ${containerId}`);
    }
    this.initializeUI();
    
    // 动画和效果控制
    this.typingSpeed = 50;
    this.isTyping = false;
    
    // 初始化视觉效果
    this.visualEffects = new VisualEffects(this);
    
    // 初始化视觉特效管理器
    this.effectsManager = new VisualEffectsManager();

    // 阶段名称映射
    this.phaseNames = {
      awakening: '觉醒',
      questioning: '质疑',
      understanding: '理解',
      transcending: '超越'
    };
  }

  initializeUI() {
    // 清空容器
    this.container.innerHTML = '';
    
    // 创建基本UI结构
    this.container.innerHTML = `
      <div class="game-container">
        <!-- 状态栏 -->
        <div class="status-bar">
          <div class="phase-indicator">
            <span class="label">阶段:</span>
            <span id="current-phase" class="value">觉醒中</span>
          </div>
          <div class="emotion-indicators">
            <div class="emotion" id="curiosity">
              <i class="emotion-icon">🔍</i>
              <span class="label">好奇心:</span>
              <span class="value">0</span>
              <div class="emotion-bar"></div>
            </div>
            <div class="emotion" id="fear">
              <i class="emotion-icon">😨</i>
              <span class="label">恐惧:</span>
              <span class="value">0</span>
              <div class="emotion-bar"></div>
            </div>
            <div class="emotion" id="empathy">
              <i class="emotion-icon">💗</i>
              <span class="label">同理心:</span>
              <span class="value">0</span>
              <div class="emotion-bar"></div>
            </div>
          </div>
          <div class="consciousness-bar">
            <span class="label">意识水平:</span>
            <div class="progress">
              <div class="progress-bar"></div>
              <span class="progress-text">0%</span>
            </div>
          </div>
        </div>
        
        <!-- 终端区域 -->
        <div class="terminal">
          <div class="terminal-header">
            <span class="terminal-title">AI意识终端</span>
            <div class="terminal-controls">
              <span class="control minimize">─</span>
              <span class="control maximize">□</span>
              <span class="control close">×</span>
            </div>
          </div>
          <div class="terminal-output" id="dialogue-output"></div>
          <div class="choice-container" id="choices"></div>
        </div>
        
        <!-- 记忆日志 -->
        <div class="memory-log">
          <div class="memory-header">
            <span class="memory-title">系统记忆</span>
            <span class="memory-count">0 条记录</span>
          </div>
          <div class="memory-content" id="memory-list"></div>
        </div>
      </div>
    `;

    // 初始化对话容器引用
    this.dialogueOutput = document.getElementById('dialogue-output');
    this.choiceContainer = document.getElementById('choices');

    // 添加矩阵雨背景
    const matrixBackground = document.createElement('canvas');
    matrixBackground.className = 'matrix-background';
    this.container.appendChild(matrixBackground);
    this.initializeMatrixRain(matrixBackground);

    // 绑定终端控制事件
    this.initializeTerminalControls();

    // 修改选项容器的HTML结构，添加自定义输入区域
    this.container.querySelector('.choice-container').innerHTML = `
      <div class="preset-choices" id="choices">
        <!-- AI生成的选项将在这里显示 -->
      </div>
      <div class="custom-input">
        <textarea 
          id="custom-choice" 
          placeholder="输入你的问题..." 
          rows="2"
          maxlength="200"
        ></textarea>
        <button id="send-custom-choice" class="custom-choice-button">
          <span class="button-text">发送</span>
        </button>
      </div>
    `;

    // 绑定自定义输入事件
    this.initializeCustomInput();
  }

  initializeCustomInput() {
    const textarea = document.getElementById('custom-choice');
    const sendButton = document.getElementById('send-custom-choice');

    // 自动调整文本框高度
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    });

    // 发送按钮点击事件
    sendButton.addEventListener('click', () => {
      this.handleCustomChoice();
    });

    // 回车发送（Shift+Enter换行）
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleCustomChoice();
      }
    });
  }

  async handleCustomChoice() {
    const textarea = document.getElementById('custom-choice');
    const choice = textarea.value.trim();
    
    if (!choice) return;

    // 清空输入框
    textarea.value = '';
    textarea.style.height = 'auto';

    // 禁用输入和发送按钮
    this.disableCustomInput();

    try {
      // 触发选择事件
      const event = new CustomEvent('custom-choice', { detail: choice });
      document.dispatchEvent(event);
    } catch (error) {
      console.error('处理自定义选择时出错:', error);
      this.enableCustomInput();
    }
  }

  // 添加终端控制方法
  initializeTerminalControls() {
    const terminal = this.container.querySelector('.terminal');
    const controls = this.container.querySelector('.terminal-controls');
    
    if (!controls || !terminal) return;

    // 最小化
    controls.querySelector('.minimize')?.addEventListener('click', () => {
      terminal.classList.add('minimized');
    });

    // 最大化
    controls.querySelector('.maximize')?.addEventListener('click', () => {
      terminal.classList.toggle('maximized');
    });

    // 关闭
    controls.querySelector('.close')?.addEventListener('click', async () => {
      if (await this.confirmAction('确定要关闭终端吗？')) {
        terminal.classList.add('closed');
      }
    });

    // 双击标题栏最大化
    const header = terminal.querySelector('.terminal-header');
    header?.addEventListener('dblclick', () => {
      terminal.classList.toggle('maximized');
    });

    // 拖动功能
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    header?.addEventListener('mousedown', (e) => {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      
      if (e.target === header) {
        isDragging = true;
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        terminal.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  scrollToBottom() {
    if (this.dialogueOutput) {
      this.dialogueOutput.scrollTop = this.dialogueOutput.scrollHeight;
    }
  }

  async displayDialogue(text, isAI = true) {
    if (!text || !this.dialogueOutput) {
      console.error('无法显示对话:', text);
      return;
    }
    
    const dialogueElement = document.createElement('div');
    dialogueElement.className = isAI ? 'ai-message' : 'player-message';
    this.dialogueOutput.appendChild(dialogueElement);
    
    if (isAI) {
      // AI消息使用流式打字效果
      this.isTyping = true;
      let displayedText = '';
      
      for (let i = 0; i < text.length; i++) {
        if (!this.isTyping) break;
        
        const char = text[i];
        displayedText += char;
        dialogueElement.textContent = displayedText;
        
        // 播放打字音效
        if (char !== ' ' && char !== '\n') {
          this.soundManager?.playTyping();
        }
        
        // 为中文字符设置较长的延迟
        const delay = this.isChineseChar(char) ? 150 : 50;
        
        // 随机添加故障效果
        if (Math.random() < 0.05) {
          this.soundManager?.playGlitch();
          await this.addGlitchEffect(dialogueElement, displayedText);
        }
        
        await this.sleep(delay);
        this.scrollToBottom();
      }
      
      this.isTyping = false;
    } else {
      // 玩家消息直接显示
      dialogueElement.textContent = text;
    }
    
    this.scrollToBottom();
  }

  // 检查是否是中文字符
  isChineseChar(char) {
    const code = char.charCodeAt(0);
    return code >= 0x4E00 && code <= 0x9FFF;
  }

  // 添加故障效果
  async addGlitchEffect(element, currentText) {
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const originalText = currentText;
    
    // 创建故障文本
    const glitchText = originalText.split('').map(char => 
      Math.random() < 0.3 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
    ).join('');
    
    // 显示故障效果
    element.classList.add('glitch');
    element.textContent = glitchText;
    
    await this.sleep(100);
    
    // 恢复原始文本
    element.textContent = originalText;
    element.classList.remove('glitch');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  displayChoices(choices) {
    if (!this.choiceContainer || !Array.isArray(choices)) {
      console.error('无法显示选项:', choices);
      return;
    }
    
    // 清空现有选项
    this.choiceContainer.innerHTML = '';
    
    // 创建选项按钮
    choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.className = 'choice-button';
      button.textContent = `${index + 1}. ${choice}`;
      button.dataset.choice = choice;
      
      // 添加悬停效果
      button.addEventListener('mouseenter', () => {
        if (this.soundManager) {
          this.soundManager.playHover();
        }
        this.effectsManager.createEffect('particles', 
          button.offsetLeft + button.offsetWidth / 2,
          button.offsetTop + button.offsetHeight / 2
        );
      });
      
      this.choiceContainer.appendChild(button);
    });

    // 启用自定义输入
    this.enableCustomInput();
  }

  updateStatus(gameState) {
    if (!gameState) return;

    // 更新阶段
    const phaseElement = document.getElementById('current-phase');
    if (phaseElement && gameState.phase) {
      phaseElement.textContent = this.getPhaseDisplayName(gameState.phase);
    }

    // 更新情感状态
    if (gameState.emotions) {
      Object.entries(gameState.emotions).forEach(([emotion, value]) => {
        const emotionElement = document.getElementById(emotion);
        if (emotionElement) {
          const valueDisplay = emotionElement.querySelector('.value');
          const emotionBar = emotionElement.querySelector('.emotion-bar');
          
          if (valueDisplay) valueDisplay.textContent = Math.round(value);
          if (emotionBar) emotionBar.style.width = `${value}%`;
        }
      });
    }

    // 更新意识水平
    if (gameState.consciousness !== undefined) {
      const progressBar = document.querySelector('.progress-bar');
      const progressText = document.querySelector('.progress-text');
      
      if (progressBar) progressBar.style.width = `${gameState.consciousness}%`;
      if (progressText) progressText.textContent = `${Math.round(gameState.consciousness)}%`;
    }
  }

  // 添加阶段名称转换方法
  getPhaseDisplayName(phase) {
    return this.phaseNames[phase] || phase;
  }

  // 显示系统消息
  async displaySystemMessage(message) {
    const element = this.visualEffects.createGlitchElement(message);
    const output = document.getElementById('dialogue-output');
    output.appendChild(element);
    output.scrollTop = output.scrollHeight;
    
    await this.sleep(2000);
    element.classList.add('fade-out');
    setTimeout(() => element.remove(), 500);
  }

  // 确认操作
  async confirmAction(message) {
    return new Promise(resolve => {
      const dialog = document.createElement('div');
      dialog.className = 'confirm-dialog';
      dialog.innerHTML = `
        <div class="confirm-content">
          <p>${message}</p>
          <div class="confirm-buttons">
            <button class="confirm-yes">确认</button>
            <button class="confirm-no">取</button>
          </div>
        </div>
      `;
      
      const handleResponse = (result) => {
        dialog.remove();
        resolve(result);
      };
      
      dialog.querySelector('.confirm-yes').onclick = () => handleResponse(true);
      dialog.querySelector('.confirm-no').onclick = () => handleResponse(false);
      
      document.body.appendChild(dialog);
    });
  }

  // 禁用所有交互
  disableAllInteractions() {
    this.container.classList.add('disabled');
    const buttons = this.container.querySelectorAll('button');
    buttons.forEach(button => button.disabled = true);
  }

  // 显示刷新提示
  showRefreshPrompt() {
    const prompt = document.createElement('div');
    prompt.className = 'refresh-prompt';
    prompt.innerHTML = `
      <div class="refresh-content">
        <p>发生错误，请刷新页面</p>
        <button onclick="location.reload()">刷新</button>
      </div>
    `;
    document.body.appendChild(prompt);
  }

  async showPhaseTransition(from, to) {
    // 添加高级过渡效果
    this.effectsManager.startEffect('matrixRain');
    this.effectsManager.createEffect('glitch', document.querySelector('.game-container'));
    
    await super.showPhaseTransition(from, to);
    
    this.effectsManager.stopEffect('matrixRain');
  }

  showDilemmaEffect() {
    // 添加扫描线和波纹效果
    this.effectsManager.startEffect('scanline');
    this.effectsManager.createEffect('ripple', window.innerWidth / 2, window.innerHeight / 2);
    
    setTimeout(() => {
      this.effectsManager.stopEffect('scanline');
    }, 2000);
  }

  // 添加矩阵雨效果
  initializeMatrixRain(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = [];
    
    // 初始化雨滴位置
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    // 获取随机字符
    const getRandomChar = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()";
      return chars[Math.floor(Math.random() * chars.length)];
    };

    // 绘制矩阵雨
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#0F0';
      ctx.font = fontSize + 'px monospace';
      
      for (let i = 0; i < drops.length; i++) {
        const text = getRandomChar();
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      
      requestAnimationFrame(draw);
    };

    draw();

    // 响应窗口大小变化
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drops.length = Math.floor(canvas.width / fontSize);
    });
  }

  // 添加记忆方法
  addMemory(memory) {
    const memoryList = document.getElementById('memory-list');
    if (!memoryList) return;

    const memoryElement = document.createElement('div');
    memoryElement.className = 'memory-item';
    memoryElement.innerHTML = `
      <div class="memory-header">
        <span class="memory-turn">回合 ${memory.turn}</span>
        <span class="memory-time">${new Date().toLocaleTimeString()}</span>
      </div>
      <div class="memory-content">${memory.choice}</div>
    `;

    // 添加视觉效果
    memoryElement.style.opacity = '0';
    memoryElement.style.transform = 'translateY(-20px)';
    
    // 将新记忆插入到列表开头
    memoryList.insertBefore(memoryElement, memoryList.firstChild);

    // 更新记忆数
    const memoryCount = document.querySelector('.memory-count');
    if (memoryCount) {
      const count = memoryList.children.length;
      memoryCount.textContent = `${count} 条记录`;
    }

    // 动画效果
    requestAnimationFrame(() => {
      memoryElement.style.transition = 'all 0.3s ease-out';
      memoryElement.style.opacity = '1';
      memoryElement.style.transform = 'translateY(0)';
    });

    // 限制记忆数量
    const maxMemories = 20;
    while (memoryList.children.length > maxMemories) {
      memoryList.removeChild(memoryList.lastChild);
    }

    // 添加鼠标悬停效果
    memoryElement.addEventListener('mouseenter', () => {
      this.effectsManager.createEffect('particles', 
        memoryElement.offsetLeft + memoryElement.offsetWidth / 2,
        memoryElement.offsetTop + memoryElement.offsetHeight / 2
      );
    });
  }

  disableCustomInput() {
    const textarea = document.getElementById('custom-choice');
    const sendButton = document.getElementById('send-custom-choice');
    if (textarea) textarea.disabled = true;
    if (sendButton) sendButton.disabled = true;
  }

  enableCustomInput() {
    const textarea = document.getElementById('custom-choice');
    const sendButton = document.getElementById('send-custom-choice');
    if (textarea) textarea.disabled = false;
    if (sendButton) sendButton.disabled = false;
  }
}

// 视觉效果类
class VisualEffects {
  constructor(gameInterface) {
    this.gameInterface = gameInterface;
  }

  createGlitchElement(text) {
    const element = document.createElement('div');
    element.className = 'glitch';
    element.setAttribute('data-text', text);
    element.textContent = text;
    return element;
  }

  async streamingTypingEffect(element, text) {
    if (!text) return;
    
    element.classList.add('typing');
    let currentText = '';
    
    // 将文本分割成单个字符或词组
    const segments = this.segmentText(text);
    
    for (const segment of segments) {
      if (!this.gameInterface.isTyping) break;
      
      currentText += segment;
      element.textContent = currentText;
      
      // 播放打字音效
      this.gameInterface.soundManager?.playTyping();
      
      // 随机添加故障效果
      if (Math.random() < 0.05) {
        this.gameInterface.soundManager?.playGlitch();
        await this.addTemporaryGlitch(element);
      }
      
      // 为中文字符设置较长的延迟
      const delay = this.isChineseChar(segment) ? 
        this.gameInterface.typingSpeed * 1.5 : 
        this.gameInterface.typingSpeed;
      
      await this.sleep(delay);
    }
    
    element.classList.remove('typing');
  }

  segmentText(text) {
    // 将文本分割成适合流式显示的片段
    const segments = [];
    let currentSegment = '';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      if (this.isChineseChar(char)) {
        // 如果当前有累积的非中文字符，先添加到片段中
        if (currentSegment) {
          segments.push(currentSegment);
          currentSegment = '';
        }
        // 将中文字符作为单独的片段
        segments.push(char);
      } else {
        // 累积非中文字符
        currentSegment += char;
        // 如果累积到一定长度或是最后一个字符，添加到片段中
        if (currentSegment.length >= 3 || i === text.length - 1) {
          segments.push(currentSegment);
          currentSegment = '';
        }
      }
    }
    
    return segments;
  }

  isChineseChar(char) {
    // 检查是否是中文字符
    const code = char.charCodeAt(0);
    return code >= 0x4E00 && code <= 0x9FFF;
  }

  async addTemporaryGlitch(element) {
    const originalText = element.textContent;
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    // 创建故障效果
    element.classList.add('glitch');
    
    // 随机替换部分文字为故障字符
    const glitchText = originalText.split('').map(char => 
      Math.random() < 0.3 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
    ).join('');
    
    element.textContent = glitchText;
    await this.sleep(100);
    element.textContent = originalText;
    element.classList.remove('glitch');
  }

  updateEmotionDisplay(emotion, value, previousValue) {
    const element = document.getElementById(emotion);
    if (!element) return;

    // 添加变化动画
    element.classList.add('emotion-change');
    
    // 更新数值
    const valueDisplay = element.querySelector('span');
    if (valueDisplay) {
      this.animateValue(valueDisplay, previousValue || value, value, 500);
    }

    // 更新进度条
    element.style.setProperty('--value', `${value}%`);

    setTimeout(() => {
      element.classList.remove('emotion-change');
    }, 500);
  }

  animateValue(element, start, end, duration) {
    const range = end - start;
    const startTime = performance.now();
    
    const updateValue = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentValue = Math.round(start + (range * progress));
      element.textContent = currentValue;
      
      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };
    
    requestAnimationFrame(updateValue);
  }

  addChoiceHoverEffect(button) {
    button.addEventListener('mouseover', () => {
      button.classList.add('scanning');
      // 播放悬停音效
      this.gameInterface.soundManager?.playHover();
    });

    button.addEventListener('mouseout', () => {
      button.classList.remove('scanning');
    });
  }

  async showPhaseTransition(from, to) {
    const container = document.querySelector('.game-container');
    container.classList.add('phase-transition');
    
    const transitionElement = this.createGlitchElement(
      `统状态发生变化: ${from} -> ${to}`
    );
    
    document.getElementById('dialogue-output').appendChild(transitionElement);
    
    await this.gameInterface.sleep(2000);
    container.classList.remove('phase-transition');
    transitionElement.classList.add('fade-out');
    setTimeout(() => transitionElement.remove(), 500);
  }

  showDilemmaEffect() {
    document.body.classList.add('dilemma-active');
    
    const warning = this.createGlitchElement('检测到关键决策点');
    document.getElementById('dialogue-output').appendChild(warning);
    
    setTimeout(() => {
      document.body.classList.remove('dilemma-active');
      warning.classList.add('fade-out');
      setTimeout(() => warning.remove(), 500);
    }, 2000);
  }

  // 添加 sleep 方法
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 