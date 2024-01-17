import { SnowflakeRegex } from '@sapphire/discord-utilities';
import { type InferType, s } from '@sapphire/shapeshift';
import { container } from '@sapphire/pieces';
import { Result } from '@sapphire/result';
import * as fs from 'node:fs/promises';

const emojiScheme = s.object({
  id: s.string.regex(SnowflakeRegex).optional,
  name: s.string.optional
});

// TODO: find a better name
const preDefinedDeclineScheme = s.object({
  label: s.string.lengthLessThanOrEqual(100),
  description: s.string.lengthLessThanOrEqual(100).optional,
  emoji: emojiScheme.optional,

  value: s.string.lengthLessThanOrEqual(500)
});

const textInputScheme = s.object({
  style: s.enum('paragraph', 'short').default('short'),
  label: s.string.lengthLessThanOrEqual(45),
  min: s.number.greaterThanOrEqual(0).lessThanOrEqual(4000).optional,
  max: s.number.greaterThanOrEqual(1).lessThanOrEqual(4000).optional,
  required: s.boolean.optional,
  // value: s.string.lengthLessThanOrEqual(4000).optional,
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
  declineReasonPreset: s.array(preDefinedDeclineScheme).optional,
  verificationQuestions: s.array(textInputScheme).lengthLessThanOrEqual(5)
});

export type QuestionType = InferType<typeof textInputScheme>;
export type ConfigType = InferType<typeof configScheme>;

export const readConfig = async () =>
  await Result.fromAsync(async () => {
    const fileContent = await fs.readFile('./config.json', { encoding: 'utf-8' });
    const parsedContent = JSON.parse(fileContent);
    return configScheme.parse(parsedContent);
  });

readConfig().then((readConfigResult) => {
  if (readConfigResult.isErr()) {
    container.logger.fatal("Config: Couldn't read config.json!");
    throw readConfigResult.unwrapErr();
  } else {
    container.config = readConfigResult.unwrap();
  }
});

declare module '@sapphire/pieces' {
  interface Container {
    config: ConfigType;
  }
}
