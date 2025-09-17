/* eslint-disable @typescript-eslint/no-explicit-any */

import { Pool, PoolClient } from 'pg';
import { v4 as uuid4 } from 'uuid';
import logger from './logging';
import { getDatabaseParameters } from './aws/parameters';

let pool: Pool = undefined as unknown as Pool;

let numOpenConnections = 0;

export const getPool = async (): Promise<Pool> => {
  if (!pool) {
    const databaseParameters = await getDatabaseParameters();

    logger.info(
      `Creating Pool with params: ${databaseParameters.host}:${databaseParameters.port.toString()}/${databaseParameters.name} as user '${databaseParameters.user}'`,
    );

    numOpenConnections = 0;
    pool = new Pool({
      user: databaseParameters.user,
      database: databaseParameters.name,
      password: databaseParameters.password,
      port: databaseParameters.port,
      host: databaseParameters.host,
      connectionString: databaseParameters.uri,
      application_name: 'playlist-transfer-backend-lambda',
    });
    pool.on('acquire', () => numOpenConnections++);
    pool.on('release', () => numOpenConnections--);
  }
  return pool;
};

export const getConnection = async (): Promise<PoolClient> => {
  const pool = await getPool();
  logger.info('Attempting to get connection');
  try {
    const connection = await pool.connect();
    logger.info('Connection to db made successfully');
    return connection;
  } catch (error) {
    logger.error(`Error occurred whilst getting connection: ${error}`);
    throw error;
  }
};

export const query = async <T = any>(
  queryText: string,
  queryParams: any,
  connection: PoolClient,
): Promise<T> => {
  const queryId = uuid4();
  const trimmedQuery = queryText.substring(0, 500);
  const detailsToLog = {
    trimmedQuery,
    queryId,
  };

  logger.info('Querying db with: ', detailsToLog);

  try {
    const results = (await connection.query<T[]>(
      queryText,
      queryParams,
    )) as any;
    logger.info('Query Results', results);
    return results[0];
  } catch (error) {
    logger.error(`Query errored: `, error);
    throw error;
  }
};

export const release = (connection: PoolClient) => {
  logger.info('Releasing connection');
  try {
    if (connection && connection.release) {
      connection.release();
    }
    logger.info('Released Successfully');
  } catch (error) {
    logger.info('No connection to release!', error);
  }
};
