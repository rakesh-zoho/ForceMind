import { TeamsClient } from '../utils/teams-client.js';

class TeamsReporter {
  constructor() {
    this.teams = new TeamsClient();
    this.failedTests = [];
    this._pending = [];
  }

  onTestEnd(test, result) {
    if (result.status !== 'failed' && result.status !== 'timedOut') return;

    const promise = this._sendAlert(test, result).catch(err => {
      console.error(`❌ Teams Reporter Error: ${err.message}`);
    });
    this._pending.push(promise);
  }

  async onExit() {
    await Promise.allSettled(this._pending);
  }

  async _sendAlert(test, result) {
    if (!this.teams.enabled) return;

    await this.teams.sendFailureAlert({
      title: test.title,
      file: test.location.file,
      line: test.location.line,
      status: result.status,
      duration: result.duration,
      errorMessage: result.error?.message || 'No error message',
      stackTrace: result.error?.stack?.split('\n').slice(0, 10).join('\n') || 'N/A',
      retry: result.retry || 0
    });
  }
}

export { TeamsReporter };
export default TeamsReporter;
