import { execSync } from 'child_process';

const POSTGRES_CONTAINER = 'local-test-postgres';
const REMOVE_VOLUMES = true;

console.log('⬢ Cleaning up local Postgres container...');

try {
  // Stop container if running
  execSync(`docker stop ${POSTGRES_CONTAINER}`, { stdio: 'ignore' });
  console.log(`✅ Stopped container '${POSTGRES_CONTAINER}'`);
} catch {
  console.log(
    `⚠️ Container '${POSTGRES_CONTAINER}' not running or already stopped.`,
  );
}

try {
  // Remove container
  execSync(`docker rm ${POSTGRES_CONTAINER}`, { stdio: 'ignore' });
  console.log(`✅ Removed container '${POSTGRES_CONTAINER}'`);
} catch {
  console.log(`⚠️ Container '${POSTGRES_CONTAINER}' could not be removed.`);
}

if (REMOVE_VOLUMES) {
  console.log('⬢ Removing associated Docker volumes...');
  try {
    const volumes = execSync(
      `docker volume ls -q --filter name=${POSTGRES_CONTAINER}`,
    )
      .toString()
      .split('\n')
      .filter(Boolean);
    for (const v of volumes) {
      try {
        execSync(`docker volume rm ${v}`, { stdio: 'ignore' });
        console.log(`✅ Removed volume '${v}'`);
      } catch {
        console.log(`⚠️ Could not remove volume '${v}'`);
      }
    }
  } catch {
    console.log('⚠️ No associated volumes found or failed to list volumes.');
  }
}

console.log('✅ Cleanup complete.');
