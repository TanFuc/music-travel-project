module.exports = {
  apps: [
    {
      name: 'fsell-backend',
      script: 'pnpm',
      args: 'run start:prod',
      cwd: './backend',
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'fsell-frontend',
      script: 'pnpm',
      args: 'start',
      cwd: './frontend',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
