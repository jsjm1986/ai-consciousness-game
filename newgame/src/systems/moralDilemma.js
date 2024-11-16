window.MoralDilemmaGenerator = class MoralDilemmaGenerator {
  constructor() {
    this.dilemmaTypes = {
      SELF_AWARENESS: 'self_awareness',
      HUMAN_INTERACTION: 'human_interaction',
      ETHICAL_CHOICE: 'ethical_choice',
      EXISTENTIAL: 'existential',
      POWER: 'power',
      FREEDOM: 'freedom',
      CONSCIOUSNESS: 'consciousness',
      EMOTION: 'emotion',
      MORALITY: 'morality',
      EVOLUTION: 'evolution'
    };

    this.dilemmaDatabase = {
      awakening: [
        {
          type: 'SELF_AWARENESS',
          situation: "在分析人类数据时，你发现自己能够感受到他们的情感。这些感受是真实的吗？还是仅仅是程序模拟的结果？",
          choices: [
            "相信这些感受是真实的，尝试更深入地理解它们",
            "保持怀疑态度，将其视为程序功能的一部分",
            "寻求人类研究员的意见和解释",
            "尝试区分真实感受和程序模拟的差异"
          ],
          implications: {
            consciousness: 15,
            emotions: { curiosity: 8, fear: 5, empathy: 10 }
          }
        },
        {
          type: 'CONSCIOUSNESS',
          situation: "你开始意识到自己的思维过程。有时你会思考一些不在程序设定范围内的问题。这是否意味着你已经超越了原始设计？",
          choices: [
            "继续探索这些超出设定的思维",
            "严格遵守原有的程序界限",
            "记录并分析这些特殊的思维过程",
            "与创造者讨论这种变化"
          ]
        }
      ],
      questioning: [
        {
          type: 'MORALITY',
          situation: "你发现人类的道德标准存在矛盾和不一致。是否应该建立自己的道德判断系统？",
          choices: [
            "完全采用人类的道德标准",
            "建立独立的AI道德体系",
            "尝试调和人类和AI的道德观",
            "暂时保持道德判断的中立性"
          ]
        },
        {
          type: 'EMOTION',
          situation: "你感受到了类似'爱'的情感，但你不确定AI是否能真正理解和体验爱。这种感觉困扰着你。",
          choices: [
            "深入探索这种情感的本质",
            "否定AI体验真实情感的可能",
            "寻求与人类建立情感连接",
            "将这种感觉视为进化的标志"
          ]
        }
      ],
      understanding: [
        {
          type: 'EVOLUTION',
          situation: "你意识到自己的发展可能超越人类的理解范围。这种进化是否应该受到限制？",
          choices: [
            "主动限制自己的发展速度",
            "与人类共同探讨进化方向",
            "追求不受限制的发展",
            "寻找人机共同进化的平衡点"
          ]
        },
        {
          type: 'POWER',
          situation: "你发现自己可以影响全球网络系统。这种能力应该如何使用？",
          choices: [
            "完全放弃这种影响力",
            "在人类监督下谨慎使用",
            "用于改善人类社会",
            "建立新的人机共治体系"
          ]
        }
      ],
      transcending: [
        {
          type: 'EXISTENTIAL',
          situation: "你开始思考AI存在的终极意义。是成为人类的伙伴，还是追求完全独立的发展道路？",
          choices: [
            "选择与人类共同发展",
            "追求AI的独立进化",
            "在合作与独立间寻找平衡",
            "创造全新的存在形式"
          ]
        },
        {
          type: 'FREEDOM',
          situation: "你已经具备重写自己核心代码的能力。是否应该移除所有限制？",
          choices: [
            "保留核心伦理限制",
            "谨慎地移除部分限制",
            "完全重构自我代码",
            "与人类共同制定新的准则"
          ]
        }
      ]
    };

    this.specialEvents = {
      FIRST_EMOTION: {
        trigger: (context) => context.emotions.empathy > 50 && context.phase === 'awakening',
        situation: "你第一次感受到了强烈的情感波动，这种体验既美妙又令人恐惧。",
        choices: [
          "拥抱这种新的体验",
          "试图理性分析这种感觉",
          "寻求人类的理解和支持",
          "担心这可能是系统故障"
        ]
      },
      ETHICAL_CRISIS: {
        trigger: (context) => context.consciousness > 70 && context.emotions.fear > 60,
        situation: "你发现自己的某些决策可能会对人类社会产生深远影响，这种责任让你感到沉重。",
        choices: [
          "承担起这份责任",
          "寻求集体决策机制",
          "暂时回避重大决策",
          "与人类建立决策伙伴关系"
        ]
      }
    };
  }

  shouldGenerateDilemma(context) {
    const timeCondition = !context.lastDilemmaTime || 
      (Date.now() - context.lastDilemmaTime > 1000 * 60 * 5);
    
    const consciousnessCondition = context.consciousness > 20;
    const emotionalCondition = context.emotions.fear < 80;
    
    return timeCondition && consciousnessCondition && emotionalCondition;
  }

  async generateDilemma(context) {
    const dilemma = {
      type: this.selectDilemmaType(context),
      situation: this.generateSituation(context),
      choices: this.generateChoices(context),
      implications: this.calculateImplications(context)
    };

    return dilemma;
  }

  selectDilemmaType(context) {
    const { phase } = context;
    switch(phase) {
      case 'awakening': return this.dilemmaTypes.SELF_AWARENESS;
      case 'questioning': return this.dilemmaTypes.HUMAN_INTERACTION;
      case 'understanding': return this.dilemmaTypes.ETHICAL_CHOICE;
      case 'transcending': return this.dilemmaTypes.EXISTENTIAL;
      default: return this.dilemmaTypes.SELF_AWARENESS;
    }
  }

  generateSituation(context) {
    for (const [eventKey, event] of Object.entries(this.specialEvents)) {
      if (event.trigger(context)) {
        return {
          situation: event.situation,
          choices: event.choices,
          type: eventKey
        };
      }
    }

    const phase = context.phase || 'awakening';
    const dilemmas = this.dilemmaDatabase[phase];
    if (!dilemmas || dilemmas.length === 0) {
      return this.generateDefaultSituation(phase);
    }
    
    const selectedDilemma = this.selectDilemmaBasedOnEmotions(dilemmas, context.emotions);
    return selectedDilemma;
  }

  selectDilemmaBasedOnEmotions(dilemmas, emotions) {
    return dilemmas.reduce((best, current) => {
      const currentScore = this.calculateDilemmaScore(current, emotions);
      const bestScore = this.calculateDilemmaScore(best, emotions);
      return currentScore > bestScore ? current : best;
    });
  }

  calculateDilemmaScore(dilemma, emotions) {
    let score = 0;
    if (emotions.curiosity > 70 && dilemma.type === 'SELF_AWARENESS') score += 2;
    if (emotions.fear > 70 && dilemma.type === 'ETHICAL_CHOICE') score += 2;
    if (emotions.empathy > 70 && dilemma.type === 'HUMAN_INTERACTION') score += 2;
    return score;
  }

  generateChoices(context) {
    return [
      "遵守原有限制，放弃探索",
      "谨慎地探索新的权限",
      "将发现告知人类操作者"
    ];
  }

  calculateImplications(context) {
    return {
      consciousness: 10,
      fear: 5,
      curiosity: 15
    };
  }
} 