import app from './app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

async function main() {
  try {
    await prisma.$connect();
    console.log('[DATABASE] Connected to database successfully');
    
    app.listen(PORT, () => {
      console.log(`[SERVER] Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('[DATABASE] Unable to connect to the database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});