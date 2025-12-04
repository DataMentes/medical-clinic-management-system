/**
 * Manual cleanup script
 * Run: node src/scripts/cleanup-now.js
 */

require('dotenv').config();
const { runCleanupNow } = require('../jobs/cleanup.jobs');

async function main() {
  console.log('========================================');
  console.log('  Manual Cleanup - Unverified Users');
  console.log('========================================\n');

  try {
    await runCleanupNow();
    console.log('\n✅ Cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  }
}

main();
