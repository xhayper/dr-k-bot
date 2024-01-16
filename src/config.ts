import { SnowflakeRegex } from '@sapphire/discord-utilities';
import { type InferType, s } from '@sapphire/shapeshift';
import { container } from '@sapphire/pieces';
import { TextInputStyle } from 'discord.js';
import { Result } from '@sapphire/result';
import * as fs from 'node:fs/promises';

const questionScheme = s.object({
  style: s
    .enum('paragraph', 'short')
    .transform((cb) => (cb === 'paragraph' ? TextInputStyle.Paragraph : TextInputStyle.Short))
    .default(TextInputStyle.Short),
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
    welcome: s.string.regex(SnowflakeRegex),
    verificationLog: s.string.regex(SnowflakeRegex),
    // NOTE: This is the channel where user performs verification
    verification: s.string.regex(SnowflakeRegex),
    ticketThread: s.string.regex(SnowflakeRegex),
    imageStorage: s.string.regex(SnowflakeRegex),
    banAppeal: s.string.regex(SnowflakeRegex)
  }),
  roles: s.object({
    // The higher, the more power
    headSecurity: s.string.regex(SnowflakeRegex),
    seniorSecurity: s.string.regex(SnowflakeRegex),
    security: s.string.regex(SnowflakeRegex),
    internSecurity: s.string.regex(SnowflakeRegex),

    // This is purely for pining the role
    verificationTeam: s.string.regex(SnowflakeRegex)
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

readConfig().then((readConfigResult) => {
  if (readConfigResult.isErr()) {
    container.logger.fatal(readConfigResult.unwrapErr());
    container.logger.fatal("Config: Couldn't read config.json!");
    process.exit(1);
  } else {
    container.config = readConfigResult.unwrap();
  }
});

declare module '@sapphire/pieces' {
  interface Container {
    config: ConfigType;
  }
}
