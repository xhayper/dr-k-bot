import 'dotenv/config';

// Plugin registration
import '@sapphire/plugin-logger/register';

// Essential packages
import { s } from '@sapphire/shapeshift';
import { DrKClient } from './client';

// Type check environment variables
// TODO: Add more verbose error messages
s.object({
  DISCORD_TOKEN: s.string.regex(/[\w-]{24}\.[\w-]{6}\.[\w-]{27}/)
}).parse(process.env);

const client = new DrKClient();

// Token provided by process.env.DISCORD_TOKEN
client.login();
