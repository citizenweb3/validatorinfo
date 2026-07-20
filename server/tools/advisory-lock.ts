import { Client, type ClientConfig } from 'pg';

type AdvisoryLockOptions = {
  connectionString: string;
  lockName: string;
  applicationName: string;
};

export const withAdvisoryLock = async <T>(
  options: AdvisoryLockOptions,
  operation: (client: Client) => Promise<T>,
): Promise<T> => {
  const config: ClientConfig = {
    connectionString: options.connectionString,
    application_name: options.applicationName,
  };
  const client = new Client(config);
  let locked = false;
  let operationFailed = false;

  await client.connect();
  try {
    await client.query('SELECT pg_advisory_lock(hashtextextended($1, 0))', [options.lockName]);
    locked = true;
    return await operation(client);
  } catch (error) {
    operationFailed = true;
    throw error;
  } finally {
    try {
      if (locked) {
        await client.query('SELECT pg_advisory_unlock(hashtextextended($1, 0))', [options.lockName]);
      }
    } catch (error) {
      if (!operationFailed) throw error;
    } finally {
      await client.end();
    }
  }
};
