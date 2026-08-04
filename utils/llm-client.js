/**
 * Unified LLM Client — OpenAI, Anthropic, GitHub Copilot
 *
 * Supports streaming and non-streaming chat completions.
 * Configure via .env:
 *   LLM_PROVIDER=openai|anthropic|github
 *   LLM_API_KEY=sk-... or anthropic key or github token
 *   LLM_MODEL=gpt-4o | claude-sonnet-4-20250514 | gpt-4o
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import path from 'path';

function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    const lines = readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {}
}

loadEnv();

const PROVIDERS = {
  openai: {
    name: 'OpenAI',
    url: 'https://api.openai.com/v1/chat/completions',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o',
    headers: (key) => ({
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    }),
    body: (model, messages, opts) => ({
      model,
      messages,
      stream: true,
      temperature: opts?.temperature ?? 0.3,
      max_tokens: opts?.maxTokens ?? 8192
    }),
    parseStream: parseOpenAIStream
  },
  anthropic: {
    name: 'Anthropic',
    url: 'https://api.anthropic.com/v1/messages',
    models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
    defaultModel: 'claude-sonnet-4-20250514',
    headers: (key) => ({
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    }),
    body: (model, messages, opts) => {
      const system = messages.find(m => m.role === 'system');
      const chatMessages = messages.filter(m => m.role !== 'system');
      return {
        model,
        max_tokens: opts?.maxTokens ?? 8192,
        system: system?.content || '',
        messages: chatMessages,
        stream: true
      };
    },
    parseStream: parseAnthropicStream
  },
  github: {
    name: 'GitHub Copilot',
    url: 'https://models.inference.ai.azure.com/v1/chat/completions',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o3-mini', 'Phi-4', 'Llama-3.3-70B-Instruct', 'DeepSeek-R1'],
    defaultModel: 'gpt-4o',
    headers: (key) => ({
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    }),
    body: (model, messages, opts) => ({
      model,
      messages,
      stream: true,
      temperature: opts?.temperature ?? 0.3,
      max_tokens: opts?.maxTokens ?? 4096
    }),
    parseStream: parseOpenAIStream
  }
};

// ─── Streaming ───────────────────────────────────────────────────────

function parseOpenAIStream(line) {
  if (!line.startsWith('data: ')) return null;
  const data = line.slice(6).trim();
  if (data === '[DONE]') return { done: true };
  try {
    const json = JSON.parse(data);
    const delta = json.choices?.[0]?.delta?.content;
    return delta ? { content: delta } : null;
  } catch {
    return null;
  }
}

function parseAnthropicStream(line) {
  if (line.startsWith('event: ')) return null;
  if (!line.startsWith('data: ')) return null;
  try {
    const json = JSON.parse(line.slice(6));
    if (json.type === 'message_stop') return { done: true };
    if (json.type === 'content_block_delta' && json.delta?.text) {
      return { content: json.delta.text };
    }
    return null;
  } catch {
    return null;
  }
}

function getProvider(name) {
  const key = (name || process.env.LLM_PROVIDER || 'openai').toLowerCase();
  const provider = PROVIDERS[key];
  if (!provider) throw new Error(`Unknown provider: "${key}". Supported: ${Object.keys(PROVIDERS).join(', ')}`);
  return provider;
}

function getConfig() {
  const provider = getProvider();
  const apiKey = process.env.LLM_API_KEY || process.env.GITHUB_TOKEN;
  const model = process.env.LLM_MODEL || provider.defaultModel;

  if (!apiKey) {
    throw new Error(`Missing API key. Set LLM_API_KEY (or GITHUB_TOKEN for GitHub) in .env`);
  }

  return { provider, apiKey, model };
}

export async function chatStream(messages, options = {}) {
  const { provider, apiKey, model } = getConfig();
  const useModel = options.model || model;

  const headers = provider.headers(apiKey);
  const body = provider.body(useModel, messages, options);

  const response = await fetch(provider.url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`${provider.name} API error (${response.status}): ${err}`);
  }

  return response.body;
}

export async function chatComplete(messages, options = {}) {
  const { provider, apiKey, model } = getConfig();
  const useModel = options.model || model;

  const headers = provider.headers(apiKey);
  const body = provider.body(useModel, messages, { ...options, stream: false });

  const response = await fetch(provider.url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`${provider.name} API error (${response.status}): ${err}`);
  }

  const json = await response.json();

  if (provider.name === 'Anthropic') {
    return json.content?.[0]?.text || '';
  }

  return json.choices?.[0]?.message?.content || '';
}

export function getProviders() {
  return Object.entries(PROVIDERS).map(([key, p]) => ({
    id: key,
    name: p.name,
    models: p.models,
    configured: !!(process.env.LLM_API_KEY || (key === 'github' && process.env.GITHUB_TOKEN))
  }));
}

export function getActiveConfig() {
  try {
    const { provider, model } = getConfig();
    return { provider: provider.name, model, configured: true };
  } catch {
    return { provider: process.env.LLM_PROVIDER || 'openai', model: process.env.LLM_MODEL || 'gpt-4o', configured: false };
  }
}

// ─── OKF Context ─────────────────────────────────────────────────────

export function getOkfContext() {
  const okfPath = path.join(process.cwd(), 'okf');
  if (!existsSync(okfPath)) return '';

  const context = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith('.md') && entry.name !== 'index.md' && entry.name !== 'log.md') {
        try {
          const content = readFileSync(fullPath, 'utf8');
          const relPath = path.relative(okfPath, fullPath).replace(/\\/g, '/');
          context.push(`--- ${relPath} ---\n${content}`);
        } catch {}
      }
    }
  };
  walk(okfPath);
  return context.join('\n\n');
}
