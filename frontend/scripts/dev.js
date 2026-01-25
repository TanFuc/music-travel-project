const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Determine the path to the .env file
const envPath = path.resolve(__dirname, '../.env');
let port = 3000;

// simple regex to match PORT=xxxx
const portRegex = /^PORT=(.*)$/m;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(portRegex);
  if (match) {
    port = match[1].trim();
  }
}

console.log(`> Starting frontend on port ${port}...`);

// Determine the command to run
// Original script was: "next dev --turbo"
// We want: "next dev --turbo -p PORT"
const cmd = 'next';
const args = ['dev', '--turbo', '-p', port];

const child = spawn(cmd, args, {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname, '..'),
});

child.on('close', (code) => {
  process.exit(code);
});
