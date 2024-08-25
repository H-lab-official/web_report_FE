module.exports = {
  apps: [
    {
      name: 'Financial-Health-Check',
      script: 'serve',
      args: '-s dist',
      env: {
        PM2_SERVE_PATH: './dist',
        PM2_SERVE_PORT: 4173, // Unique port for Financial-Health-Check
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      }
    },
    {
      name: 'web_report_FE',
      script: 'serve',
      args: '-s dist',
      env: {
        PM2_SERVE_PATH: './dist',
        PM2_SERVE_PORT: 3174, // Unique port for web_report_FE
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      }
    }
  ]
};
