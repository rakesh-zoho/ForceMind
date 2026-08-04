import dotenv from 'dotenv';
dotenv.config();

class TeamsClient {
  constructor() {
    this.webhookUrl = process.env.TEAMS_WEBHOOK_URL;
    this.enabled = !!this.webhookUrl;
  }

  async sendFailureAlert({ title, file, line, status, duration, errorMessage, stackTrace, retry }) {
    if (!this.enabled) return;

    const facts = [
      { name: 'Status', value: status },
      { name: 'Duration', value: `${(duration / 1000).toFixed(2)}s` },
      { name: 'File', value: `${file}:${line}` },
      { name: 'Project', value: 'Salesforce Agentic Automation' }
    ];

    if (retry > 0) {
      facts.splice(2, 0, { name: 'Retry', value: `${retry}` });
    }

    const cardPayload = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: 'd63333',
      summary: 'Automation Failure Alert',
      sections: [{
        activityTitle: '🚨 **Automation Test Failure**',
        activitySubtitle: `Test: ${title}`,
        facts,
        text: `**Error Detail:**\n\`\`\`\n${errorMessage}\n\`\`\``,
        markdown: true
      }]
    };

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardPayload)
      });

      if (response.ok) {
        console.log(`✅ Teams alert sent: ${title}`);
      } else {
        const body = await response.text();
        console.warn(`⚠️  Teams webhook failed (${response.status}): ${body}`);
      }
    } catch (err) {
      console.error(`❌ Teams Webhook Error: ${err.message}`);
    }
  }
}

export { TeamsClient };
