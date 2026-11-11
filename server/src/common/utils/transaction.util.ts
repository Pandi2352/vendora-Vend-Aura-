import { Logger } from '@nestjs/common';
import type { ClientSession, Connection } from 'mongoose';

const logger = new Logger('Transaction');
let supportsTransactions: Promise<boolean> | null = null;

async function detectTransactionSupport(connection: Connection): Promise<boolean> {
  try {
    const hello = await connection.db!.admin().command({ hello: 1 });
    const supported = Boolean(hello.setName) || hello.msg === 'isdbgrid';
    if (!supported) {
      logger.warn(
        'MongoDB is running standalone: multi-document transactions are disabled. Use a replica set in production.',
      );
    }
    return supported;
  } catch {
    return false;
  }
}

/**
 * Runs `work` inside a MongoDB transaction when the deployment supports it
 * (replica set / sharded). On a standalone server the work runs without a
 * session, so local development still functions.
 */
export async function runInTransaction<T>(
  connection: Connection,
  work: (session: ClientSession | undefined) => Promise<T>,
): Promise<T> {
  supportsTransactions ??= detectTransactionSupport(connection);
  if (!(await supportsTransactions)) {
    return work(undefined);
  }

  const session = await connection.startSession();
  try {
    let result!: T;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}
