import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

class JiraClient {
  constructor() {
    this.host = process.env.JIRA_HOST;
    this.email = process.env.JIRA_EMAIL;
    this.token = process.env.JIRA_API_TOKEN;
    this.projectKey = process.env.JIRA_PROJECT_KEY;
    this.baseUrl = `https://${this.host}`;
  }

  get authHeader() {
    return 'Basic ' + Buffer.from(`${this.email}:${this.token}`).toString('base64');
  }

  get headers() {
    return {
      'Authorization': this.authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async createIssue({ summary, description, priority = 'High', labels = [], attachments = [] }) {
    const issuePayload = {
      fields: {
        project: { key: this.projectKey },
        issuetype: { name: 'Bug' },
        summary,
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: description }]
            }
          ]
        },
        priority: { name: priority },
        labels: ['automation', 'playwright', ...labels]
      }
    };

    const response = await fetch(`${this.baseUrl}/rest/api/3/issue`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(issuePayload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`JIRA create issue failed (${response.status}): ${errorBody}`);
    }

    const issue = await response.json();
    console.log(`\n✅ JIRA Issue Created: ${this.baseUrl}/browse/${issue.key}`);

    // Attach files
    for (const filePath of attachments) {
      if (fs.existsSync(filePath)) {
        await this.attachFile(issue.key, filePath);
      }
    }

    return issue;
  }

  async attachFile(issueKey, filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webm': 'video/webm',
      '.mp4': 'video/mp4',
      '.zip': 'application/zip',
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.html': 'text/html'
    };
    const mimeType = mimeTypes[ext] || 'application/octet-stream';

    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer], { type: mimeType }), fileName);

    const response = await fetch(
      `${this.baseUrl}/rest/api/3/issue/${issueKey}/attachments`,
      {
        method: 'POST',
        headers: {
          'Authorization': this.authHeader,
          'X-Atlassian-Token': 'no-check'
        },
        body: formData
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.warn(`⚠️  Failed to attach ${fileName}: ${response.status} ${errorBody}`);
    } else {
      console.log(`📎 Attached: ${fileName}`);
    }
  }

  async findExistingIssue(summary) {
    const jql = `project = ${this.projectKey} AND summary ~ "${summary}" AND status != Done ORDER BY created DESC`;

    const response = await fetch(
      `${this.baseUrl}/rest/api/3/search/jql`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ jql, maxResults: 1, fields: ['summary', 'status'] })
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.issues && data.issues.length > 0 ? data.issues[0] : null;
  }

  async transitionIssue(issueKey, transitionId = '41') {
    const response = await fetch(
      `${this.baseUrl}/rest/api/3/issue/${issueKey}/transitions`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ transition: { id: transitionId } })
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.warn(`⚠️  Failed to transition ${issueKey}: ${response.status} ${errorBody}`);
    } else {
      console.log(`🔵 Status updated to "Captured In Automation" for ${issueKey}`);
    }
  }

  async addComment(issueKey, comment) {
    const commentPayload = {
      body: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: comment }]
          }
        ]
      }
    };

    const response = await fetch(
      `${this.baseUrl}/rest/api/3/issue/${issueKey}/comment`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(commentPayload)
      }
    );

    if (!response.ok) {
      console.warn(`⚠️  Failed to add comment to ${issueKey}`);
    }
  }

  // ─── Story Fetching Methods ───────────────────────────────────────

  /**
   * Search issues using any JQL query.
   * @param {string} jql - JQL query string
   * @param {object} options - { maxResults, fields, expand }
   * @returns {Promise<Array>} Array of issue objects
   */
  async searchIssues(jql, options = {}) {
    const maxResults = options.maxResults || 50;
    const fields = options.fields || 'summary,status,priority,issuetype,description,labels,assignee,sprint,story_points,customfield_10016,acceptance_criteria';
    const expand = options.expand || '';

    const params = new URLSearchParams({
      maxResults: String(maxResults),
      fields
    });
    if (expand) params.set('expand', expand);

    // Use the newer /search/jql endpoint (JIRA v3 migration)
    const body = { jql, maxResults, fields: fields.split(',') };

    const response = await fetch(
      `${this.baseUrl}/rest/api/3/search/jql?${params.toString()}`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`JIRA search failed (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    return {
      total: data.total,
      issues: (data.issues || []).map(issue => this._formatIssue(issue))
    };
  }

  /**
   * Fetch a single issue by key with all fields.
   * @param {string} issueKey - e.g. "SF-101"
   * @returns {Promise<object>} Formatted issue object
   */
  async getIssue(issueKey) {
    const params = new URLSearchParams({
      fields: 'summary,status,priority,issuetype,description,labels,assignee,sprint,story_points,customfield_10016,acceptance_criteria,subtasks,comment'
    });

    const response = await fetch(
      `${this.baseUrl}/rest/api/3/issue/${issueKey}?${params.toString()}`,
      { headers: this.headers }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`JIRA get issue failed (${response.status}): ${errorBody}`);
    }

    const issue = await response.json();
    return this._formatIssue(issue);
  }

  /**
   * Get all stories/tasks in a project, optionally filtered by sprint or status.
   * @param {string} projectKey - e.g. "SF"
   * @param {object} options - { sprint, status, type, maxResults }
   * @returns {Promise<object>} { total, issues }
   */
  async getIssuesByProject(projectKey, options = {}) {
    const clauses = [`project = ${projectKey}`];

    if (options.sprint) {
      clauses.push(`sprint = "${options.sprint}"`);
    }
    if (options.status) {
      clauses.push(`status = "${options.status}"`);
    }
    if (options.type) {
      clauses.push(`issuetype = "${options.type}"`);
    } else {
      // Default: stories and tasks only (not bugs, subtasks)
      clauses.push(`issuetype in (Story, Task, "User Story")`);
    }

    const jql = clauses.join(' AND ') + ' ORDER BY priority DESC, created DESC';
    return this.searchIssues(jql, { maxResults: options.maxResults || 50 });
  }

  /**
   * Get available boards for a project.
   * @param {string} projectKey
   * @returns {Promise<Array>}
   */
  async getBoards(projectKey) {
    const response = await fetch(
      `${this.baseUrl}/rest/agile/1.0/board?projectKeyOrId=${projectKey}`,
      { headers: this.headers }
    );

    if (!response.ok) return [];
    const data = await response.json();
    return data.values || [];
  }

  /**
   * Get sprints for a board.
   * @param {number} boardId
   * @returns {Promise<Array>}
   */
  async getSprints(boardId) {
    const response = await fetch(
      `${this.baseUrl}/rest/agile/1.0/board/${boardId}/sprint?state=active,future`,
      { headers: this.headers }
    );

    if (!response.ok) return [];
    const data = await response.json();
    return data.values || [];
  }

  /**
   * Format a raw JIRA issue into a clean object.
   * @param {object} issue - Raw JIRA API issue
   * @returns {object} Formatted issue
   */
  _formatIssue(issue) {
    const f = issue.fields || {};

    // Extract plain text from ADF (Atlassian Document Format)
    const extractText = (adf) => {
      if (!adf) return '';
      if (typeof adf === 'string') return adf;
      if (adf.content) {
        return adf.content
          .map(block => {
            if (block.content) {
              return block.content.map(inline => inline.text || '').join('');
            }
            return '';
          })
          .join('\n');
      }
      return '';
    };

    // Extract sprint name from sprint field (can be array or object)
    let sprintName = '';
    if (f.sprint) {
      const sprint = Array.isArray(f.sprint) ? f.sprint[0] : f.sprint;
      sprintName = sprint.name || sprint.state || '';
    }

    return {
      key: issue.key,
      summary: f.summary || '',
      description: extractText(f.description),
      status: f.status?.name || '',
      priority: f.priority?.name || '',
      issueType: f.issuetype?.name || '',
      labels: f.labels || [],
      assignee: f.assignee?.displayName || '',
      sprint: sprintName,
      storyPoints: f.story_points || f.customfield_10016 || null,
      url: `${this.baseUrl}/browse/${issue.key}`,
      acceptanceCriteria: extractText(f.acceptance_criteria) || ''
    };
  }
}

export { JiraClient };
