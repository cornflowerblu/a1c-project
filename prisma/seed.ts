import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.reading.deleteMany();
  await prisma.run.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      password: adminPassword,
    },
  });
  console.log('Created admin user:', admin);

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Regular User',
      role: 'user',
      password: userPassword,
    },
  });
  console.log('Created regular user:', user);

  // Create a sample run with readings for the regular user
  const run = await prisma.run.create({
    data: {
      userId: user.id,
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-07'),
      estimatedA1C: 5.7,
      notes: 'Initial test run',
      readings: {
        create: [
          {
            glucoseValue: 95,
            timestamp: new Date('2023-01-01T08:00:00'),
            mealContext: 'Fasting',
          },
          {
            glucoseValue: 120,
            timestamp: new Date('2023-01-01T12:00:00'),
            mealContext: 'After meal',
          },
          {
            glucoseValue: 110,
            timestamp: new Date('2023-01-02T08:00:00'),
            mealContext: 'Fasting',
          },
        ],
      },
    },
    include: {
      readings: true,
    },
  });
  console.log('Created sample run with readings:', run);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });