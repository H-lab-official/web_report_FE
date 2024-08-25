module.exports = {
  apps: [
    {
      name: 'financial-health-check',
      script: 'serve',
      args: '-s dist',  // The '-s' flag indicates serving a single-page application
      env: {
        PM2_SERVE_PATH: './dist',
        PM2_SERVE_PORT: 4173,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      }
    }
  ]
};
