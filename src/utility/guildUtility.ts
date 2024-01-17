import { container } from '@sapphire/pieces';
import { Result } from '@sapphire/result';
import { DrKClient } from '../client';
import {
  type PermissionResolvable,
  type Channel,
  type DiscordAPIError,
  type TextBasedChannel,
  type MessageComponentInteraction,
  GuildMemberRoleManager,
  Snowflake
} from 'discord.js';

export class GuildUtility {
  private client: DrKClient;

  public welcomeChannel: TextBasedChannel | null = null;
  public verificationLogChannel: TextBasedChannel | null = null;
  public ticketThreadChannel: TextBasedChannel | null = null;
  public imageStorageChannel: TextBasedChannel | null = null;
  public banAppealChannel: TextBasedChannel | null = null;

  public constructor(client: DrKClient) {
    this.client = client;
  }

  public async init() {
    if (!this.client.isReady()) {
      throw new Error('The client is not ready yet!');
    }

    const { logger, config } = container;

    const fetchChannel = async (channelId: string): Promise<Result<Channel | null, DiscordAPIError>> =>
      Result.fromAsync(async () => await this.client.channels.fetch(channelId));

    logger.debug('GuildUtility:', 'Fetching channels...');
    const welcomeChannelResult = await fetchChannel(config.channels.welcome);
    const verificationLogChannelResult = await fetchChannel(config.channels.verificationLog);
    const ticketThreadChannelResult = await fetchChannel(config.channels.ticketThread);
    const imageStorageChannelResult = await fetchChannel(config.channels.imageStorage);
    const banAppealChannelResult = await fetchChannel(config.channels.banAppeal);

    const handleChannelFetchError = (error: DiscordAPIError) => {
      const { logger } = container;

      const warnError = (message: string) => {
        logger.warn(
          'GuildUtility:',
          message,
          `{ctx: {channelId: ${error.url.replace('https://discord.com/api/v10/channels/', '')}}}`
        );
      };

      if (error.code === 10003) {
        warnError('The channel does not exist!');
      } else if (error.code === 50001) {
        warnError('The bot is not in the guild where the channel belongs!');
      } else if (error.code === 50013) {
        warnError('The bot does not have the required permissions to view the channel!');
      } else {
        logger.warn('GuildUtility:', error.message);
      }
    };

    const handleResult = (
      result: Result<Channel | null, DiscordAPIError>,
      channelName: string | undefined
    ): TextBasedChannel | null => {
      channelName = channelName ?? 'channel';

      if (result.isOk()) {
        let channel = result.unwrap();

        if (channel !== null) {
          if (channel.isTextBased()) return channel;
          else logger.warn('GuildUtility:', `The ${channelName} is not a text channel!`);
        } else {
          logger.warn('GuildUtility:', `The ${channelName} is null!`);
        }
      } else {
        handleChannelFetchError(result.unwrapErr());
      }

      return null;
    };

    this.welcomeChannel = handleResult(welcomeChannelResult, 'welcome channel');
    this.verificationLogChannel = handleResult(verificationLogChannelResult, 'verification log channel');
    this.ticketThreadChannel = handleResult(ticketThreadChannelResult, 'ticket thread channel');
    this.imageStorageChannel = handleResult(imageStorageChannelResult, 'image storage channel');
    this.banAppealChannel = handleResult(banAppealChannelResult, 'ban appeal channel');

    const checkForPermission = (channel: TextBasedChannel | null, permissions: PermissionResolvable[]) => {
      if (channel !== null && 'permissionsFor' in channel) {
        const missingPermissions = channel.permissionsFor(this.client.user!)?.missing(permissions);

        if (missingPermissions !== undefined && missingPermissions.length > 0) {
          logger.warn('GuildUtility:', `Missing ${missingPermissions.join(', ')} permission(s) in #${channel.name}!`);
        }
      }
    };

    checkForPermission(this.welcomeChannel, ['SendMessages']);
    checkForPermission(this.verificationLogChannel, ['SendMessages']);
    checkForPermission(this.ticketThreadChannel, ['SendMessages']);
    checkForPermission(this.imageStorageChannel, ['SendMessages', 'AttachFiles']);
    checkForPermission(this.banAppealChannel, ['SendMessages']);

    logger.info('GuildUtility:', 'Initialized!');
  }

  public static isHeadSecurity(data: GuildMemberRoleManager | Snowflake[]): boolean {
    return data instanceof GuildMemberRoleManager
      ? data.cache.has(container.config.roles.headSecurity)
      : data.includes(container.config.roles.headSecurity);
  }

  public static isSeniorSecurity(data: GuildMemberRoleManager | Snowflake[]): boolean {
    return data instanceof GuildMemberRoleManager
      ? data.cache.has(container.config.roles.seniorSecurity)
      : data.includes(container.config.roles.seniorSecurity);
  }

  public static isSecurity(data: GuildMemberRoleManager | Snowflake[]): boolean {
    return data instanceof GuildMemberRoleManager
      ? data.cache.has(container.config.roles.security)
      : data.includes(container.config.roles.security);
  }

  public static isInternSecurity(data: GuildMemberRoleManager | Snowflake[]): boolean {
    return data instanceof GuildMemberRoleManager
      ? data.cache.has(container.config.roles.internSecurity)
      : data.includes(container.config.roles.internSecurity);
  }

  public isHeadSecurity(data: GuildMemberRoleManager | Snowflake[]): boolean {
    return GuildUtility.isHeadSecurity(data);
  }

  public isSeniorSecurity(data: GuildMemberRoleManager | Snowflake[]): boolean {
    return GuildUtility.isSeniorSecurity(data);
  }

  public isSecurity(data: GuildMemberRoleManager | Snowflake[]): boolean {
    return GuildUtility.isSecurity(data);
  }

  public isInternSecurity(data: GuildMemberRoleManager | Snowflake[]): boolean {
    return GuildUtility.isInternSecurity(data);
  }

  public async checkForSecurityInInteraction(
    interaction: MessageComponentInteraction,
    noEdit: boolean = false
  ): Promise<boolean> {
    // TODO: noEdit ? 'reply' : 'editReply' and ephemeral: noEdit ? true : undefined is too ugly, figure out how to make it looks pretty

    if (!interaction.member) {
      await interaction[noEdit ? 'reply' : 'editReply']({
        content: 'You are not in a guild!',
        ephemeral: noEdit ? true : undefined
      });

      return false;
    }

    if (!container.utilities.guild.isSecurity(interaction.member.roles)) {
      await interaction[noEdit ? 'reply' : 'editReply']({
        content: 'You are not a security!',
        ephemeral: noEdit ? true : undefined
      });

      return false;
    }

    return true;
  }
}
