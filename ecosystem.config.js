module.exports = {
  apps: [
    {
      name: 'fsell-backend',
      script: 'pnpm',
      args: 'run start:prod',
      cwd: './backend',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 2222
      }
    },
    {
      name: 'fsell-frontend',
      script: 'pnpm',
      args: 'run start',
      cwd: './frontend',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3333
      }
    }
  ]
};
