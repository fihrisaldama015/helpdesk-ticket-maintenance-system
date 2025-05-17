import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');
  // Delete TicketActions for tickets created by your sample users
  await prisma.ticketAction.deleteMany({
    where: {
      ticket: {
        createdBy: {
          email: {
            in: ['agent@helpdesk.com', 'tech@helpdesk.com', 'admin@helpdesk.com']
          }
        }
      }
    }
  });

  await prisma.ticket.deleteMany({
    where: {
      createdBy: {
        email: {
          in: ['agent@helpdesk.com', 'tech@helpdesk.com', 'admin@helpdesk.com']
        }
      }
    }
  });
  console.log('Deleted existing sample tickets');

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

  // Fetch users
  const agent = await prisma.user.findUnique({ where: { email: 'agent@helpdesk.com' } });
  const tech = await prisma.user.findUnique({ where: { email: 'tech@helpdesk.com' } });
  const admin = await prisma.user.findUnique({ where: { email: 'admin@helpdesk.com' } });

  // Seed Tickets

  // Ticket created by L1 Agent (NEW)
  await prisma.ticket.create({
    data: {
      title: 'Printer not working',
      description: 'The printer in the lobby is not responding.',
      category: 'HARDWARE',
      priority: 'MEDIUM',
      status: 'NEW',
      criticalValue: 'NONE',
      expectedCompletionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      createdBy: { connect: { id: agent!.id } },
      assignedTo: { connect: { id: agent!.id } },
    },
  });
  console.log('Created ticket for L1 Agent');

  // Ticket escalated to L2 (ESCALATED_L2)
  await prisma.ticket.create({
    data: {
      title: 'Network outage on floor 2',
      description: 'No devices can connect to the network on floor 2.',
      category: 'NETWORK',
      priority: 'HIGH',
      status: 'ESCALATED_L2',
      criticalValue: 'C2',
      expectedCompletionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      createdBy: { connect: { id: agent!.id } },
      assignedTo: { connect: { id: tech!.id } },
      actions: {
        create: [
          {
            action: 'Escalated to L2',
            notes: 'Escalating due to network-wide impact.',
            user: { connect: { id: agent!.id } },
            createdAt: new Date(Date.now() - 1 * 4 * 60 * 60 * 1000),
          },
          {
            action: 'L2 Investigation Started',
            notes: 'Investigating switch logs.',
            user: { connect: { id: tech!.id } },
          },
        ],
      },
    },
  });
  console.log('Created ticket for L2 Support');

  // Ticket escalated to L3 (ESCALATED_L3)
  await prisma.ticket.create({
    data: {
      title: 'Critical security breach',
      description: 'Detected unauthorized server access.',
      category: 'SOFTWARE',
      priority: 'HIGH',
      status: 'ESCALATED_L3',
      criticalValue: 'C1',
      expectedCompletionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      createdBy: { connect: { id: agent!.id } },
      assignedTo: { connect: { id: admin!.id } },
      actions: {
        create: [
          {
            action: 'Escalated to L2',
            notes: 'Requires advanced support.',
            user: { connect: { id: tech!.id } },
            createdAt: new Date(Date.now() - 1 * 8 * 60 * 60 * 1000),
          },
          {
            action: 'Escalated to L3',
            notes: 'Critical issue, needs admin attention.',
            user: { connect: { id: tech!.id } },
            createdAt: new Date(Date.now() - 1 * 4 * 60 * 60 * 1000),
          },
          {
            action: 'L3 Analysis',
            notes: 'Analyzing breach vectors.',
            user: { connect: { id: admin!.id } },
          },
        ],
      },
    },
  });
  console.log('Created ticket for L3 Support');

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
