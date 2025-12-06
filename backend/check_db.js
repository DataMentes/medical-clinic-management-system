const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log("--- Rooms ---");
    const rooms = await prisma.room.findMany();
    console.log(JSON.stringify(rooms, null, 2));

    console.log("\n--- Schedules ---");
    const schedules = await prisma.doctorSchedule.findMany({
        include: { room: true }
    });
    console.log(JSON.stringify(schedules, null, 2));

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
