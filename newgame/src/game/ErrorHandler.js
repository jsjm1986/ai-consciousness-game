window.ErrorHandler = class ErrorHandler {
  constructor() {
    this.errorTypes = {
      NETWORK: 'NETWORK_ERROR',
      AI_RESPONSE: 'AI_RESPONSE_ERROR',
      GAME_STATE: 'GAME_STATE_ERROR',
      USER_INPUT: 'USER_INPUT_ERROR',
      SYSTEM: 'SYSTEM_ERROR'
    };
  }

  handleError(error, context = {}) {
    console.error('[Game Error]', {
      timestamp: new Date(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        details: error.details
      },
      context
    });

    return {
      success: false,
      message: this.getErrorMessage(error),
      recovery: {
        type: 'retry'
      }
    };
  }

  getErrorMessage(error) {
    return error.message || '发生未知错误';
  }
}; 