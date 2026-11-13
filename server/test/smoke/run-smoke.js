const { spawn, execSync } = require('child_process');
const fs = require('fs');

async function main() {
  console.log('--- 1. Building server ---');
  execSync('npm run build --prefix server', { encoding: 'utf8', stdio: 'inherit' });

  console.log('--- 2. Seeding throwaway database ---');
  const seedOutput = execSync('node server/test/smoke/seed.js', { encoding: 'utf8' }).trim();
  console.log('Seed output:', seedOutput);
  fs.writeFileSync('server/test/smoke/.ids.json', seedOutput, 'utf8');

  console.log('--- 3. Starting test server on port 5055 ---');
  const env = {
    ...process.env,
    PORT: '5055',
    MONGO_URI: 'mongodb://localhost:27017/vendora_smoketest',
    PLATFORM_ADMIN_USERNAME: 'padmin',
    PLATFORM_ADMIN_PASSWORD: 'ptest123',
    JWT_SECRET: 'vendora_jwt_secret_dev_key_2026',
    JWT_REFRESH_SECRET: 'vendora_jwt_refresh_dev_key_2026',
    JWT_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
    SMTP_USER: '',
    SMTP_PASS: '',
  };

  const serverProcess = spawn('node', ['server/dist/main.js'], { env });
  let serverStarted = false;

  await new Promise((resolve, reject) => {
    serverProcess.stdout.on('data', (d) => {
      const s = d.toString();
      if (s.includes('Nest application successfully started') || s.includes('running on')) {
        serverStarted = true;
        resolve();
      }
    });
    serverProcess.stderr.on('data', (d) => {
      const s = d.toString();
      if (!serverStarted) {
        console.error(s);
      }
    });
    serverProcess.on('exit', (code) => {
      if (!serverStarted) {
        reject(new Error(`Server exited prematurely with code ${code}`));
      }
    });
    setTimeout(() => {
      if (!serverStarted) resolve();
    }, 20000);
  });

  console.log('--- 3. Server started on port 5055. Running smoke test suite ---');
  let exitCode = 0;
  try {
    const smokeEnv = {
      ...process.env,
      SMOKE_API_URL: 'http://localhost:5055/api/v1',
      SMOKE_DB_NAME: 'vendora_smoketest',
    };
    const smoke = spawn('node', ['server/test/smoke/smoke.js', seedOutput], { env: smokeEnv, stdio: 'inherit' });
    exitCode = await new Promise((resolve) => {
      smoke.on('exit', (c) => resolve(c || 0));
    });
  } finally {
    console.log('--- 4. Shutting down test server ---');
    try {
      if (process.platform === 'win32') {
        execSync(`taskkill /pid ${serverProcess.pid} /T /F`);
      } else {
        serverProcess.kill('SIGTERM');
      }
    } catch {
      // process already exited
    }
  }

  if (exitCode !== 0) {
    process.exit(exitCode);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
