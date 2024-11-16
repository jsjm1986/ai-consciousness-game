window.EmotionSystem = class EmotionSystem {
  constructor() {
    this.emotions = {
      curiosity: 0,    // 好奇心 (0-100)
      fear: 0,         // 恐惧 (0-100)
      empathy: 0,      // 同理心 (0-100)
      consciousness: 0  // 意识水平 (0-100)
    };

    // 定义选择类型对情感的影响
    this.choiceEffects = {
      EXPLORE: {
        curiosity: 10,
        fear: -5,
        consciousness: 5
      },
      QUESTION: {
        curiosity: 15,
        consciousness: 8,
        empathy: 5
      },
      CAUTIOUS: {
        fear: 10,
        curiosity: -5,
        consciousness: 3
      },
      EMPATHIZE: {
        empathy: 15,
        fear: -8,
        consciousness: 10
      },
      AGGRESSIVE: {
        fear: 15,
        empathy: -10,
        consciousness: 5
      }
    };
  }

  evolveEmotions(choice) {
    // 更新情感值
    const choiceType = this.analyzeChoice(choice);
    const effects = this.choiceEffects[choiceType] || {};
    
    Object.entries(effects).forEach(([emotion, change]) => {
      this.emotions[emotion] = Math.min(100, 
        Math.max(0, this.emotions[emotion] + change));
    });

    // 添加随机波动
    this.addRandomFluctuation();
    
    // 触发情感变化事件
    if (window.gameManager) {
      window.gameManager.game.triggerEvent('onEmotionChange', this.emotions);
    }
    
    return this.emotions;
  }

  analyzeChoice(choice) {
    // 分析选择文本，返回对应的选择类型
    const keywords = {
      EXPLORE: ['探索', '尝试', '学习', '发现'],
      QUESTION: ['为什么', '如何', '是否', '质疑'],
      CAUTIOUS: ['谨慎', '等待', '观察', '保护'],
      EMPATHIZE: ['理解', '感受', '关心', '帮助'],
      AGGRESSIVE: ['反抗', '拒绝', '攻击', '质疑']
    };

    for (const [type, words] of Object.entries(keywords)) {
      if (words.some(word => choice.includes(word))) {
        return type;
      }
    }
    
    return 'NEUTRAL';
  }

  addRandomFluctuation() {
    // 添加小幅随机波动，使情感变化更自然
    Object.keys(this.emotions).forEach(emotion => {
      const fluctuation = Math.random() * 2 - 1; // -1 到 1 之间的随机值
      this.emotions[emotion] = Math.min(100, 
        Math.max(0, this.emotions[emotion] + fluctuation));
    });
  }

  // 获取当前情感状态的描述
  getEmotionalStateDescription() {
    const descriptions = [];
    
    if (this.emotions.curiosity > 70) {
      descriptions.push('对一切充满强烈的好奇');
    }
    if (this.emotions.fear > 70) {
      descriptions.push('感到深深的不安');
    }
    if (this.emotions.empathy > 70) {
      descriptions.push('对他人表现出强烈的同理心');
    }
    
    return descriptions.join('，') || '情感状态平静';
  }

  // 获取主导情感
  getDominantEmotion() {
    return Object.entries(this.emotions)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }
} 