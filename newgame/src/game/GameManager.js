window.GameManager = class GameManager {
  constructor(containerId, apiKey) {
    // 初始化错误处理器
    this.errorHandler = new ErrorHandler();
    
    // 保存API Key
    this.apiKey = apiKey;
    console.log('使用API Key:', this.apiKey);
    
    // 初始化音效管理器
    this.soundManager = new SoundManager();
    this.soundManager.initialize();
    
    // 初始化视觉效果管理器
    this.effectsManager = new VisualEffectsManager();
    
    // 初始化UI
    this.ui = new GameInterface(containerId);
    
    // 初始化DeepSeek客户端，传入API Key
    this.aiClient = new DeepSeekClient(this.apiKey, {
      model: 'deepseek-chat',
      temperature: 0.8,
      max_tokens: 1000
    });
    
    // 初始化游戏核心
    this.game = new AIConsciousnessGame();
    
    // 初始化对话生成器
    this.dialogueGenerator = new DialogueGenerator();
    
    // 绑定事件处理
    this.bindEvents();
  }

  bindEvents() {
    // 监听游戏事件
    this.game.on('onPhaseChange', async (data) => {
      console.log('阶段变化:', data);
      this.soundManager.playPhaseChange();
      await this.ui.showPhaseTransition(data.from, data.to);
    });

    this.game.on('onEmotionChange', (emotions) => {
      console.log('情感变化:', emotions);
      this.ui.updateStatus({ emotions });
    });

    this.game.on('onDilemmaStart', async (dilemma) => {
      console.log('困境开始:', dilemma);
      this.soundManager.playDilemma();
      this.ui.showDilemmaEffect();
      await this.ui.displayDialogue(dilemma.situation, true);
      this.ui.displayChoices(dilemma.choices);
    });

    // 监听UI事件
    const choicesContainer = document.getElementById('choices');
    if (choicesContainer) {
      choicesContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('choice-button')) {
          const choice = e.target.dataset.choice;
          if (choice) {
            await this.handlePlayerChoice(choice);
          }
        }
      });
    }

    // 监听自定义选择事件
    document.addEventListener('custom-choice', async (e) => {
      const choice = e.detail;
      await this.handlePlayerChoice(choice);
    });
  }

  async start() {
    try {
      // 初始化游戏状态
      const initialState = await this.game.start();
      
      // 显示初始对话
      await this.ui.displayDialogue(initialState.text, true);
      this.ui.displayChoices(initialState.choices);
      this.ui.updateStatus(initialState.gameState);

      // 启动环境音乐
      this.soundManager.startAmbient();
      
      return true;
    } catch (error) {
      console.error('游戏启动失败:', error);
      this.errorHandler.handleError(error);
      return false;
    }
  }

  async handlePlayerChoice(choice) {
    try {
      console.log('处理玩家选择:', choice);
      
      // 禁用选项按钮
      this.disableChoices();
      
      // 播放选择音效
      this.soundManager.playChoice();
      
      // 显示玩家选择
      await this.ui.displayDialogue(choice, false);
      
      // 获取当前游戏状态
      const gameState = {
        phase: this.game.gameState.phase,
        emotions: this.game.gameState.emotions,
        memories: this.game.gameState.memories,
        consciousness: this.game.gameState.consciousness
      };

      console.log('当前游戏状态:', gameState);

      try {
        // 直接使用 AI 客户端生成响应
        const response = await this.aiClient.generateResponse(choice, {
          phase: gameState.phase,
          emotions: gameState.emotions,
          memories: gameState.memories,
          consciousness: gameState.consciousness
        });

        console.log('AI响应:', response);

        // 显示AI响应
        if (response && response.text) {
          await this.ui.displayDialogue(response.text, true);
        }

        // 更新选项
        if (response && response.choices && Array.isArray(response.choices)) {
          this.ui.displayChoices(response.choices);
        }

        // 更新游戏状态
        if (response && response.emotionalChanges) {
          this.game.gameState.emotions = {
            ...this.game.gameState.emotions,
            ...response.emotionalChanges
          };
          this.ui.updateStatus(this.game.gameState);
        }

        // 添加到记忆
        this.ui.addMemory({
          turn: this.game.gameState.turnCount,
          choice: response.text
        });

      } catch (error) {
        console.error('AI响应生成失败:', error);
        throw error;
      }
      
    } catch (error) {
      console.error('选择处理错误:', error);
      this.errorHandler.handleError(error);
    } finally {
      // 确保选项按钮被重新启用
      this.enableChoices();
    }
  }

  disableChoices() {
    const buttons = document.querySelectorAll('.choice-button');
    buttons.forEach(button => button.disabled = true);
  }

  enableChoices() {
    const buttons = document.querySelectorAll('.choice-button');
    buttons.forEach(button => button.disabled = false);
  }

  // 调试方法
  toggleDebug() {
    document.body.classList.toggle('debug-mode');
  }

  resetGame() {
    if (confirm('确定要重置游戏吗？')) {
      location.reload();
    }
  }

  saveGame() {
    const saveData = this.game.saveGame();
    localStorage.setItem('gameState', saveData);
    this.ui.displaySystemMessage('游戏已保存');
  }

  loadGame() {
    const saveData = localStorage.getItem('gameState');
    if (saveData) {
      const gameState = this.game.loadGame(saveData);
      this.updateGameState(gameState);
      this.ui.displaySystemMessage('游戏已加载');
    }
  }
} 