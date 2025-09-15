#!/usr/bin/env node
import { execSync } from 'child_process';

const DB_NAME = 'testdb';
const DB_USER = 'testuser';
const DB_PASSWORD = 'testpass';
const DB_PORT = 5432;
const POSTGRES_CONTAINER = 'local-test-postgres';
const MAX_TRIES = 10;

console.log('⬢ Stopping existing Postgres container if any...');
try {
  execSync(`docker stop ${POSTGRES_CONTAINER}`, { stdio: 'ignore' });
  execSync(`docker rm ${POSTGRES_CONTAINER}`, { stdio: 'ignore' });
  console.log(`✅ Stopped and removed existing container '${POSTGRES_CONTAINER}'`);
} catch {
  console.log('No existing container to remove.');
}

console.log('⬢ Starting Postgres container...');
execSync(
  `docker run --name ${POSTGRES_CONTAINER} -e POSTGRES_USER=${DB_USER} -e POSTGRES_PASSWORD=${DB_PASSWORD} -e POSTGRES_DB=${DB_NAME} -p ${DB_PORT}:5432 -d postgres:16`,
  { stdio: 'inherit' }
);

// Wait until Postgres is actually ready
console.log('⬢ Waiting for Postgres to be ready...');
let ready = false;
for (let i = 0; i < MAX_TRIES; i++) {
  try {
    const status = execSync(`docker exec ${POSTGRES_CONTAINER} pg_isready -U ${DB_USER}`).toString();
    if (status.includes('accepting connections')) {
      console.log('✅ Postgres is ready!');
      ready = true;
      break;
    }
  } catch {
    // ignore errors during check
  }
  console.log(`Waiting for Postgres... (try ${i + 1}/${MAX_TRIES})`);
  await new Promise((r) => setTimeout(r, 2000));
}

if (!ready) {
  console.error('❌ Postgres did not become ready in time. Exiting.');
  process.exit(1);
}

// Run Flyway migrations
console.log('⬢ Running Flyway migrations...');
try {
  execSync(
    `flyway -url=jdbc:postgresql://localhost:${DB_PORT}/${DB_NAME} -user=${DB_USER} -password=${DB_PASSWORD} migrate`,
    { stdio: 'inherit' }
  );
  console.log('✅ Local Postgres ready with migrations applied.');
} catch (err) {
  console.error('❌ Flyway migrations failed:', err);
  process.exit(1);
}

console.log(`DATABASE_URL=postgres://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}`);
