const prisma = require('../config/database');

class CleanupService {
  /**
   * Delete expired OTPs
   */
  async deleteExpiredOTPs() {
    const now = new Date();

    try {
      const result = await prisma.oTPVerification.deleteMany({
        where: {
          expiryTime: {
            lt: now
          }
        }
      });

      if (result.count > 0) {
        console.log(`🗑️  Deleted ${result.count} expired OTP(s)`);
      }

      return { deleted: result.count };
    } catch (error) {
      console.error('❌ Error deleting expired OTPs:', error);
      throw error;
    }
  }

  /**
   * Delete unverified users (Active = No AND registerDate > 24 hours ago)
   */
  async deleteUnverifiedUsers() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
      // Find unverified users
      const unverifiedUsers = await prisma.user.findMany({
        where: {
          active: 'No',
          registerDate: {
            lt: twentyFourHoursAgo
          }
        },
        include: {
          person: {
            include: {
              patient: true,
              doctor: true
            }
          }
        }
      });

      if (unverifiedUsers.length === 0) {
        return { deleted: 0 };
      }

      console.log(`🗑️  Found ${unverifiedUsers.length} unverified user(s) to delete`);

      // Delete each user with cascade
      for (const user of unverifiedUsers) {
        await prisma.$transaction(async (tx) => {
          // Delete OTP if exists
          await tx.oTPVerification.deleteMany({
            where: { userId: user.userId }
          });
          console.log(`  ├─ Deleted OTP for User #${user.userId}`);

          // Delete Patient/Doctor if exists
          if (user.person?.patient) {
            await tx.patient.delete({
              where: { id: user.person.patient.id }
            });
            console.log(`  ├─ Deleted Patient #${user.person.patient.id}`);
          }

          if (user.person?.doctor) {
            await tx.doctor.delete({
              where: { id: user.person.doctor.id }
            });
            console.log(`  ├─ Deleted Doctor #${user.person.doctor.id}`);
          }

          // Delete Person
          if (user.person) {
            await tx.person.delete({
              where: { userId: user.person.userId }
            });
            console.log(`  ├─ Deleted Person #${user.person.userId}`);
          }

          // Delete User
          await tx.user.delete({
            where: { userId: user.userId }
          });
          console.log(`  └─ Deleted User #${user.userId} (${user.email})`);
        });
      }

      console.log(`✅ Cleanup complete: ${unverifiedUsers.length} unverified users deleted`);
      return { deleted: unverifiedUsers.length };
    } catch (error) {
      console.error('❌ Error deleting unverified users:', error);
      throw error;
    }
  }
}

module.exports = new CleanupService();
