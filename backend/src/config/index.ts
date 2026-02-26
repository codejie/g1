import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Config {
  // Database
  DATABASE_PATH: string;

  // Server
  PORT: number;
  HOST: string;

  // Security
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string | number;

  // Upload
  UPLOAD_DIR: string;
  MAX_FILE_SIZE: number;

  // OpenCode
  OPENCODE_URL: string;
  LLM_PROVIDER: string;
  LLM_MODEL: string;

  // Files
  FILES_ROOT: string;
  // DOWNLOAD_ROOT: string;
}

const config: Config = {
  // Database
  DATABASE_PATH: path.join(__dirname, '..', '..', 'data', 'app.db'),

  // Server
  PORT: 3000,
  HOST: '0.0.0.0',

  // Security
  JWT_SECRET: 'supersecret',
  JWT_EXPIRES_IN: '24h',

  // Upload
  UPLOAD_DIR: path.join(__dirname, '..', '..', 'uploads'),
  MAX_FILE_SIZE: 104857600, // 100MB

  // OpenCode
  OPENCODE_URL: 'http://127.0.0.1:10090',
  // LLM_PROVIDER: 'opencode',
  // LLM_MODEL: 'glm-5-free',
  // LLM_PROVIDER: 'nvidia',
  // LLM_MODEL: 'openai/gpt-oss-120b',
  // LLM_PROVIDER: 'deepseek',
  // LLM_MODEL: 'deepseek-chat',

  LLM_PROVIDER: 'nvidia',
  LLM_MODEL: 'minimaxai/minimax-m2.1',
  // Files
  FILES_ROOT: path.join(__dirname, '..', '..', 'data', 'files_root'),
  // DOWNLOAD_ROOT: path.join(__dirname, '..', '..', 'data', 'downloads'),
};

export default config;