import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

interface DatabaseParameters {
  host: string;
  name: string;
  password: string;
  port: number;
  uri: string;
  user: string;
}

const ssm = new SSMClient({ region: process.env.AWS_REGION! });

const getSecureParameter = async (name: string): Promise<string> => {
  const command = new GetParameterCommand({
    Name: name,
    WithDecryption: true,
  });
  const response = await ssm.send(command);
  if (!response.Parameter?.Value) {
    throw new Error(`Parameter ${name} not found`);
  }
  return response.Parameter.Value;
};

export const getDatabaseParameters = async (): Promise<DatabaseParameters> => {
  try {
    const [host, name, password, port, uri, user] = await Promise.all([
      getSecureParameter(process.env.DB_HOST_PARAM!),
      getSecureParameter(process.env.DB_NAME_PARAM!),
      getSecureParameter(process.env.DB_PASS_PARAM!),
      getSecureParameter(process.env.DB_PORT_PARAM!),
      getSecureParameter(process.env.DB_URI_PARAM!),
      getSecureParameter(process.env.DB_USER_PARAM!),
    ]);

    const portNumber = Number(port);

    return {
      host,
      name,
      password,
      port: portNumber,
      uri,
      user,
    };
  } catch (error) {
    throw Error('Failed to fetch database params from AWS SSM.');
  }
};
