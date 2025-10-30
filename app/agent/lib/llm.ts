import 'dotenv/config';
import { ChatBedrockConverse } from '@langchain/aws';

const { AWS_BEDROCK_REGION, AWS_BEDROCK_ACCESS_KEY_ID, AWS_BEDROCK_SECRET_ACCESS_KEY } = process.env;

if (!AWS_BEDROCK_REGION || !AWS_BEDROCK_ACCESS_KEY_ID || !AWS_BEDROCK_SECRET_ACCESS_KEY) {
  throw new Error("Missing required AWS Bedrock environment variables");
}

const llm = new ChatBedrockConverse({
  model: "openai.gpt-oss-20b-1:0",
  region: AWS_BEDROCK_REGION,
  credentials: {
    accessKeyId: AWS_BEDROCK_ACCESS_KEY_ID,
    secretAccessKey: AWS_BEDROCK_SECRET_ACCESS_KEY,
  },
});

export default llm;
