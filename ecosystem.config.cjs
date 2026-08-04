module.exports = {
  apps: [{
    name: 'forcemind-dashboard',
    script: 'server/index.js',
    env: {
      DASHBOARD_PORT: 4000,
      NODE_ENV: 'production'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '256M',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: 'logs/error.log',
    out_file: 'logs/out.log'
  }]
};