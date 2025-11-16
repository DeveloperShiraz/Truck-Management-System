export interface ErrorLog {
  message: string;
  stack?: string;
  timestamp: Date;
  userAgent?: string;
  url?: string;
  userId?: string;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100;

  log(error: Error, context?: { userId?: string; url?: string }) {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: context?.url || (typeof window !== 'undefined' ? window.location.href : undefined),
      userId: context?.userId,
    };

    this.logs.push(errorLog);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorLog);
    }

    // In production, you could send to an external service
    // this.sendToExternalService(errorLog);
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  // Placeholder for future external logging service integration
  private sendToExternalService(errorLog: ErrorLog) {
    // TODO: Integrate with services like Sentry, LogRocket, etc.
    // Example:
    // fetch('/api/log-error', {
    //   method: 'POST',
    //   body: JSON.stringify(errorLog),
    // });
  }
}

export const errorLogger = new ErrorLogger();
