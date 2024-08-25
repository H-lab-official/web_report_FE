module.exports = {
  apps: [
    {
      name: 'web_report_FE',
      script: 'serve',
      args: '-s dist',  // The '-s' flag indicates serving a single-page application
      env: {
        PM2_SERVE_PATH: './dist',
        PM2_SERVE_PORT: 3173,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      }
    }
  ]
};
