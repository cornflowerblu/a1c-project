import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Clean up all data in the database (useful for testing)
   * This method should be used with caution!
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV !== 'production') {
      const models = Reflect.ownKeys(this).filter(
        (key) => key[0] !== '_' && key[0] !== '$' && typeof this[key] === 'object',
      );

      return Promise.all(
        models.map((modelKey) => this[modelKey].deleteMany()),
      );
    }
    throw new Error('Database cleanup is not allowed in production environment');
  }

  /**
   * Helper method for transaction handling
   * This method provides a cleaner way to handle transactions
   */
  async executeInTransaction<T>(callback: (prisma: PrismaService) => Promise<T>): Promise<T> {
    return this.$transaction(async (prisma) => {
      return callback(prisma as unknown as PrismaService);
    });
  }
}