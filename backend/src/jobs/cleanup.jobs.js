const cron = require('node-cron');
const cleanupService = require('../services/cleanup.service');

/**
 * Initialize scheduled cleanup jobs
 */
function initializeJobs() {
  console.log('🕐 Initializing scheduled jobs...');

  // Job 1: Delete expired OTPs (every hour)
  cron.schedule('0 * * * *', async () => {
    console.log('🧹 Running cleanup: Expired OTPs...');
    try {
      const result = await cleanupService.deleteExpiredOTPs();
      if (result.deleted > 0) {
        console.log(`  ✅ Deleted ${result.deleted} expired OTP(s)`);
      }
    } catch (error) {
      console.error('❌ OTP cleanup failed:', error);
    }
  });
  console.log('  ✅ Scheduled: Delete expired OTPs every hour');

  // Job 2: Delete unverified users (daily at 2:00 AM)
  cron.schedule('0 2 * * *', async () => {
    console.log('🧹 Running daily cleanup: Unverified users...');
    try {
      const result = await cleanupService.deleteUnverifiedUsers();
      if (result.deleted > 0) {
        console.log(`  ✅ Deleted ${result.deleted} unverified user(s)`);
      }
    } catch (error) {
      console.error('❌ User cleanup failed:', error);
    }
  });
  console.log('  ✅ Scheduled: Delete unverified users @ 2:00 AM daily');
  console.log('     (Users with Active=No and RegisterDate > 24 hours)');

  console.log('✅ All scheduled jobs initialized');
}

/**
 * Manually trigger cleanup (for testing)
 */
async function manualCleanup() {
  console.log('🧪 Running manual cleanup...');
  
  console.log('\n1️⃣ Deleting expired OTPs...');
  await cleanupService.deleteExpiredOTPs();
  
  console.log('\n2️⃣ Deleting unverified users...');
  await cleanupService.deleteUnverifiedUsers();
  
  console.log('\n✅ Manual cleanup complete!');
}

module.exports = {
  initializeJobs,
  manualCleanup
};
