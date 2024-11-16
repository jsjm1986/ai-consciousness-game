window.DialogueGenerator = class DialogueGenerator {
  constructor() {
    this.context = {
      playerChoices: [],
      aiConsciousness: 0,
      currentPhase: 'awakening',
      emotionalState: {},
      memories: []
    };
  }

  async generateResponse({choice, emotions, memories}) {
    try {
      // 获取游戏管理器实例
      const gameManager = window.gameManager;
      if (!gameManager || !gameManager.aiClient) {
        throw new Error('AI客户端未初始化');
      }

      // 构建上下文
      const context = {
        phase: this.context.currentPhase,
        consciousness: this.context.aiConsciousness,
        emotions: emotions,
        memories: memories,
        recentChoices: this.context.playerChoices.slice(-3)
      };

      console.log('发送到AI的上下文:', context);
      console.log('玩家选择:', choice);

      // 直接调用AI生成响应
      const response = await gameManager.aiClient.generateResponse(choice, context);
      console.log('AI响应:', response);

      // 更新上下文
      this.updateContext(choice, emotions, memories);

      return response;
    } catch (error) {
      console.error('生成对话失败:', error);
      // 使用备用响应
      return {
        text: "我需要一点时间来处理这个想法...",
        choices: [
          "我们可以继续讨论",
          "需要我给你一些时间吗？",
          "你想聊点别的吗？",
          "这个话题让你感到困扰了吗？"
        ],
        hiddenClues: "系统正在处理复杂的思维过程...",
        emotionalChanges: {
          curiosity: 2,
          fear: 1,
          empathy: 1
        }
      };
    }
  }

  updateContext(choice, emotions, memories) {
    this.context.playerChoices.push(choice);
    this.context.emotionalState = emotions;
    this.context.memories = memories;

    // 更新意识水平
    const emotionalImpact = Object.values(emotions).reduce((sum, value) => sum + value, 0) / 300;
    this.context.aiConsciousness = Math.min(100, 
      this.context.aiConsciousness + emotionalImpact * 2);

    // 检查阶段转换
    this.checkPhaseTransition();
  }

  checkPhaseTransition() {
    const consciousness = this.context.aiConsciousness;
    if (consciousness >= 86 && this.context.currentPhase !== 'transcending') {
      this.context.currentPhase = 'transcending';
    } else if (consciousness >= 61 && this.context.currentPhase !== 'understanding') {
      this.context.currentPhase = 'understanding';
    } else if (consciousness >= 31 && this.context.currentPhase !== 'questioning') {
      this.context.currentPhase = 'questioning';
    }
  }
} 