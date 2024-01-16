import { SnowflakeRegex } from '@sapphire/discord-utilities';
import { type InferType, s } from '@sapphire/shapeshift';
import { Result } from '@sapphire/result';
import * as fs from 'node:fs/promises';

const textInputStyle = s.enum('paragraph', 'short');

const questionScheme = s.object({
  style: textInputStyle.optional,
  question: s.string.lengthLessThanOrEqual(45),
  min: s.number.greaterThanOrEqual(0).lessThanOrEqual(4000).optional,
  max: s.number.greaterThanOrEqual(1).lessThanOrEqual(4000).optional,
  required: s.boolean.optional,
  value: s.string.lengthLessThanOrEqual(4000).optional,
  placeholder: s.string.lengthLessThanOrEqual(100).optional
});

const configScheme = s.object({
  channels: s.object({
    // Also known as the "general"
    welcomeChannel: s.string.regex(SnowflakeRegex),
    verificationLogChannel: s.string.regex(SnowflakeRegex),
    // NOTE: This is the channel where user performs verification
    verificationChannel: s.string.regex(SnowflakeRegex),
    ticketThreadChannel: s.string.regex(SnowflakeRegex),
    imageStorageChannel: s.string.regex(SnowflakeRegex),
    banAppealChannel: s.string.regex(SnowflakeRegex)
  }),
  roles: s.object({
    // The higher, the more power
    headSecurity: s.string.regex(SnowflakeRegex),
    seniorSecurity: s.string.regex(SnowflakeRegex),
    security: s.string.regex(SnowflakeRegex),
    internSecurity: s.string.regex(SnowflakeRegex)
  }),
  verificationQuestions: s.array(questionScheme)
});

export type QuestionType = InferType<typeof questionScheme>;
export type ConfigType = InferType<typeof configScheme>;

export const readConfig = async () =>
  await Result.fromAsync(async () => {
    const fileContent = await fs.readFile('./config.json', { encoding: 'utf-8' });
    const parsedContent = JSON.parse(fileContent);
    return configScheme.parse(parsedContent);
  });
