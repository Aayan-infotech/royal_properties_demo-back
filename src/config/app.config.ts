import { AwsSecretsService } from './aws-secrets.service';

export const appConfig = async (
  awsSecretsService: AwsSecretsService,
) => {
  const secrets = await awsSecretsService.getSecrets();

  return {
    mongodbUri: secrets.MONGODB_URI,
  };
};
