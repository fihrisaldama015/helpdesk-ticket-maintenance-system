import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Delete existing users to avoid duplicates
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['agent@helpdesk.com', 'tech@helpdesk.com', 'admin@helpdesk.com']
      }
    }
  });

  console.log('Deleted existing sample users');

  // Create sample users
  const saltRounds = 10;

  // L1 Agent
  const agentPasswordHash = await bcrypt.hash('agent123', saltRounds);
  await prisma.user.create({
    data: {
      email: 'agent@helpdesk.com',
      passwordHash: agentPasswordHash,
      firstName: 'Help',
      lastName: 'Desk',
      role: UserRole.L1_AGENT
    }
  });
  console.log('Created L1 Agent user');

  // L2 Support
  const techPasswordHash = await bcrypt.hash('tech123', saltRounds);
  await prisma.user.create({
    data: {
      email: 'tech@helpdesk.com',
      passwordHash: techPasswordHash,
      firstName: 'Tech',
      lastName: 'Support',
      role: UserRole.L2_SUPPORT
    }
  });
  console.log('Created L2 Support user');

  // L3 Support
  const adminPasswordHash = await bcrypt.hash('admin123', saltRounds);
  await prisma.user.create({
    data: {
      email: 'admin@helpdesk.com',
      passwordHash: adminPasswordHash,
      firstName: 'Advanced',
      lastName: 'Support',
      role: UserRole.L3_SUPPORT
    }
  });
  console.log('Created L3 Support user');

  console.log('Database seeding completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
