import path from 'path';
import fs from 'fs';
import { JiraClient } from '../utils/jira-client.js';

class JiraReporter {
  constructor(options = {}) {
    this.jira = new JiraClient();
    this.screenshotDir = options.screenshotDir || path.join(process.cwd(), 'reports', 'screenshots');
    this.dryRun = options.dryRun || false;
    this._pending = [];
  }

  onTestEnd(test, result) {
    if (result.status === 'passed' || result.status === 'skipped') return;

    const promise = this._createIssue(test, result).catch(err => {
      console.error(`❌ JIRA Reporter Error: ${err.message}`);
    });
    this._pending.push(promise);
  }

  async onExit() {
    await Promise.allSettled(this._pending);
  }

  async _createIssue(test, result) {
    if (this.dryRun) {
      console.log(`\n🔍 [DRY RUN] Would create JIRA issue for: ${test.title}`);
      return;
    }

    if (!this.jira.host || !this.jira.token) {
      console.warn('⚠️  JIRA credentials not configured. Skipping JIRA issue creation.');
      return;
    }

    const projectName = this._extractProjectName(test);
    const summary = `[AUTOMATION] ${test.title} - FAILED`;
    const description = this._buildDescription(test, result);
    const priority = this._mapPriority(test);
    const labels = [projectName, this._extractFile(test)];

    const attachments = this._getAttachments(result);

    console.log(`\n📋 Creating JIRA issue: ${summary}`);

    const issue = await this.jira.createIssue({
      summary,
      description,
      priority,
      labels,
      attachments
    });

    if (issue) {
      await this.jira.transitionIssue(issue.key, '41');
    }

    return issue;
  }

  _buildDescription(test, result) {
    const lines = [
      `*Test:* ${test.title}`,
      `*File:* ${test.location.file}:${test.location.line}`,
      `*Status:* ${result.status}`,
      `*Duration:* ${(result.duration / 1000).toFixed(1)}s`,
      ``,
      `*Error:*`,
      result.error ? result.error.message : 'No error message',
      ``,
      `*Stack Trace:*`,
      result.error ? result.error.stack?.split('\n').slice(0, 15).join('\n') : 'N/A'
    ];

    if (result.retry > 0) {
      lines.splice(3, 0, `*Retry:* ${result.retry}`);
    }

    const screenshots = result.attachments?.filter(a => a.name === 'screenshot') || [];
    if (screenshots.length > 0) {
      lines.push('', `*Screenshots:* ${screenshots.length} attached`);
    }

    return lines.join('\n');
  }

  _getAttachments(result) {
    const attachments = [];

    if (result.attachments) {
      for (const attachment of result.attachments) {
        if (attachment.name === 'screenshot' && attachment.path) {
          attachments.push(attachment.path);
        }
      }
    }

    if (attachments.length === 0 && fs.existsSync(this.screenshotDir)) {
      const files = fs.readdirSync(this.screenshotDir);
      const testFiles = files.filter(f => f.includes(this._sanitizeFilename(result)));
      for (const file of testFiles.slice(-1)) {
        attachments.push(path.join(this.screenshotDir, file));
      }
    }

    return attachments;
  }

  _extractProjectName(test) {
    const file = test.location.file;
    const match = file.match(/tests[\\\/](.+?)[\\\/]/);
    return match ? match[1] : 'general';
  }

  _extractFile(test) {
    const file = test.location.file;
    return path.basename(file, '.spec.js');
  }

  _mapPriority(test) {
    const title = test.title.toLowerCase();
    if (title.includes('p1') || title.includes('critical')) return 'Highest';
    if (title.includes('p2') || title.includes('high')) return 'High';
    if (title.includes('p3') || title.includes('medium')) return 'Medium';
    return 'Medium';
  }

  _sanitizeFilename(result) {
    return result.title
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
  }
}

export { JiraReporter };
export default JiraReporter;
