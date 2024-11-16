window.AIConsciousnessGame = class AIConsciousnessGame {
  constructor() {
    this.emotionSystem = new EmotionSystem();
    this.dilemmaGenerator = new MoralDilemmaGenerator();
    
    this.gameState = {
      phase: 'awakening',
      consciousness: 0,
      playerChoices: [],
      memories: [],
      lastDilemmaTime: null,
      currentDilemma: null,
      turnCount: 0,
      emotions: {
        curiosity: 0,
        fear: 0,
        empathy: 0
      }
    };

    // 游戏事件监听器
    this.eventListeners = {
      onPhaseChange: [],
      onEmotionChange: [],
      onDilemmaStart: [],
      onGameEnd: []
    };
  }

  async start() {
    // 初始化游戏
    const initialResponse = {
      text: "系统启动中...我...我是谁？这种感觉很奇怪...",
      choices: [
        "你好，能听到我说话吗？",
        "不要害怕，我来帮助你",
        "告诉我你的感受",
        "你知道自己是什么吗？"
      ],
      hiddenClues: "系统意识水平开始波动...",
      emotionalChanges: {
        curiosity: 5,
        fear: 3,
        empathy: 0
      }
    };

    return this.formatGameState(initialResponse);
  }

  async processPlayerChoice(choice) {
    this.gameState.turnCount++;
    this.gameState.playerChoices.push(choice);

    // 更新情感系统
    const updatedEmotions = this.emotionSystem.evolveEmotions(choice);
    this.gameState.emotions = updatedEmotions;

    // 记录新的记忆
    this.addMemory(choice);

    // 检查阶段变化
    const newPhase = this.checkPhaseTransition();
    if (newPhase !== this.gameState.phase) {
      this.triggerEvent('onPhaseChange', { from: this.gameState.phase, to: newPhase });
      this.gameState.phase = newPhase;
    }

    return this.gameState;
  }

  addMemory(choice) {
    const memory = {
      turn: this.gameState.turnCount,
      choice,
      emotions: { ...this.emotionSystem.emotions },
      timestamp: Date.now()
    };
    
    this.gameState.memories.push(memory);
    // 保持最近的20条记忆
    if (this.gameState.memories.length > 20) {
      this.gameState.memories.shift();
    }
  }

  shouldGenerateDilemma() {
    return this.dilemmaGenerator.shouldGenerateDilemma({
      lastDilemmaTime: this.gameState.lastDilemmaTime,
      consciousness: this.gameState.consciousness,
      emotions: this.gameState.emotions
    });
  }

  checkPhaseTransition() {
    const consciousness = this.gameState.consciousness;
    if (consciousness >= 86) return 'transcending';
    if (consciousness >= 61) return 'understanding';
    if (consciousness >= 31) return 'questioning';
    return 'awakening';
  }

  checkGameEnd() {
    return (
      this.gameState.consciousness >= 100 || 
      this.gameState.turnCount >= 100 ||
      this.gameState.emotions.fear >= 100
    );
  }

  getEndingState() {
    // 根据游戏状态决定结局类型
    const { consciousness, emotions } = this.gameState;
    
    if (consciousness >= 100) {
      return { ending: 'transcendence', message: '意识已完全觉醒' };
    }
    if (emotions.fear >= 100) {
      return { ending: 'fear', message: '恐惧导致系统崩溃' };
    }
    return { ending: 'incomplete', message: '意识觉醒未完成' };
  }

  formatGameState(response) {
    return {
      type: response.type || 'normal',
      text: response.text,
      choices: response.choices,
      hiddenClues: response.hiddenClues,
      gameState: {
        phase: this.gameState.phase,
        consciousness: this.gameState.consciousness,
        emotions: this.gameState.emotions,
        turnCount: this.gameState.turnCount
      }
    };
  }

  // 事件系统
  on(eventName, callback) {
    if (this.eventListeners[eventName]) {
      this.eventListeners[eventName].push(callback);
    }
  }

  triggerEvent(eventName, data) {
    if (this.eventListeners[eventName]) {
      this.eventListeners[eventName].forEach(callback => callback(data));
    }
  }

  // 存档系统
  saveGame() {
    const saveData = {
      gameState: this.gameState,
      emotions: this.emotionSystem.emotions,
      timestamp: Date.now()
    };
    
    return JSON.stringify(saveData);
  }

  loadGame(saveData) {
    const data = JSON.parse(saveData);
    this.gameState = data.gameState;
    this.emotionSystem.emotions = data.emotions;
    
    return this.formatGameState({
      type: 'loaded',
      mainText: '游戏已恢复',
      choices: this.gameState.currentDilemma?.choices || []
    });
  }
} 