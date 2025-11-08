module.exports = {
  apps: [
    {
      name: 'oneflow-server-dev',
      script: 'npm.cmd',
      args: 'run dev',
      cwd: './server',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      interpreter: 'none',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      error_file: './logs/server-dev-error.log',
      out_file: './logs/server-dev-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
    },
    {
      name: 'oneflow-client-dev',
      script: 'npm.cmd',
      args: 'run dev',
      cwd: './client',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      interpreter: 'none',
      env: {
        NODE_ENV: 'development',
        VITE_API_URL: 'http://localhost:3000/api',
      },
      error_file: './logs/client-dev-error.log',
      out_file: './logs/client-dev-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
    }
  ],
}
