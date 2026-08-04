/**
 * Structured Logger for SF-Agentic Framework
 *
 * Provides consistent, filterable logging across tests, data factory,
 * and framework internals. Supports log levels and structured output.
 */

const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const currentLevel = LEVELS[process.env.LOG_LEVEL?.toUpperCase() || 'INFO'];

const COLORS = {
  DEBUG: '\x1b[90m',
  INFO: '\x1b[36m',
  WARN: '\x1b[33m',
  ERROR: '\x1b[31m',
  DATA: '\x1b[35m',
  PASS: '\x1b[32m',
  FAIL: '\x1b[31m',
  reset: '\x1b[0m',
};

function timestamp() {
  return new Date().toISOString().slice(11, 23);
}

function formatMsg(level, category, msg, data) {
  const ts = timestamp();
  const color = COLORS[level] || '';
  const prefix = `${color}[${ts}] [${level}]${COLORS.reset}`;
  const cat = category ? ` ${COLORS.DEBUG}[${category}]${COLORS.reset}` : '';
  const suffix = data ? ` ${COLORS.DATA}${JSON.stringify(data)}${COLORS.reset}` : '';
  return `${prefix}${cat} ${msg}${suffix}`;
}

export const logger = {
  debug(category, msg, data) {
    if (currentLevel <= LEVELS.DEBUG) {
      console.log(formatMsg('DEBUG', category, msg, data));
    }
  },

  info(category, msg, data) {
    if (currentLevel <= LEVELS.INFO) {
      console.log(formatMsg('INFO', category, msg, data));
    }
  },

  warn(category, msg, data) {
    if (currentLevel <= LEVELS.WARN) {
      console.warn(formatMsg('WARN', category, msg, data));
    }
  },

  error(category, msg, data) {
    if (currentLevel <= LEVELS.ERROR) {
      console.error(formatMsg('ERROR', category, msg, data));
    }
  },

  data(msg, data) {
    console.log(formatMsg('DATA', null, msg, data));
  },

  pass(msg) {
    console.log(`${COLORS.PASS}[${timestamp()}] PASS${COLORS.reset} ${msg}`);
  },

  fail(msg, reason) {
    console.log(`${COLORS.FAIL}[${timestamp()}] FAIL${COLORS.reset} ${msg}${reason ? ` - ${reason}` : ''}`);
  },

  suite(name) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`${COLORS.INFO}  SUITE: ${name}${COLORS.reset}`);
    console.log(`${'═'.repeat(60)}`);
  },

  step(name) {
    console.log(`  ${COLORS.DEBUG}▸${COLORS.reset} ${name}`);
  },

  divider() {
    console.log(`${'─'.repeat(60)}`);
  },
};

export default logger;
