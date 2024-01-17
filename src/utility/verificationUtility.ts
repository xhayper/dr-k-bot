import { type VerificationRequest, type VerificationAnswer } from '@prisma/client';
import { EmbedUtility } from './embedUtility';
import { container } from '@sapphire/pieces';
import { Result } from '@sapphire/result';
import {
  type DiscordAPIError,
  type User,
  type Message,
  type ModalSubmitInteraction,
  type StringSelectMenuInteraction
} from 'discord.js';

export type CreateVerificationRequestError =
  | {
      type: 'verification_pending';
      err: Error | undefined;
    }
  | {
      type: 'database_error';
      err: Error | undefined;
    }
  | {
      type: 'generic';
      err: Error;
    };

export type CreateVerificationRequestAndLogError =
  | CreateVerificationRequestError
  | {
      type: 'user_not_found';
      err: Error | undefined;
    }
  | {
      type: 'cant_send_message';
      err: Error | undefined;
    }
  | {
      type: 'verification_log_channel_not_found';
      err: Error | undefined;
    };

export type DeclineVerificationRequestError =
  | {
      type: 'verification_request_not_found';
      err: Error | undefined;
    }
  | {
      type: 'cant_send_message';
      err: Error | undefined;
    }
  | {
      type: 'database_error';
      err: Error | undefined;
    };

export class VerificationUtility {
  // TODO: Use Result<boolean, UserPendingVerificationError>
  public static async isUserPendingVerification(userId: string): Promise<boolean> {
    const { database } = container;

    const requestCount = await database.verificationRequest
      .count({
        where: {
          ownerId: userId
        }
      })
      .catch(() => 0);

    return requestCount > 0;
  }

  public async isUserPendingVerification(userId: string): Promise<boolean> {
    return VerificationUtility.isUserPendingVerification(userId);
  }

  public static async createVerificationRequest(
    userId: string,
    data: { question: string; answer: string }[]
  ): Promise<Result<VerificationRequest, CreateVerificationRequestError>> {
    if (await this.isUserPendingVerification(userId).catch(Result.err)) {
      return Result.err({ type: 'verification_pending', err: undefined });
    }

    const { database } = container;

    const verificationRequestResult = await Result.fromAsync<VerificationRequest, Error>(
      async () =>
        await database.verificationRequest.create({
          data: {
            ownerId: userId
          }
        })
    );

    let verificationRequest: VerificationRequest;

    if (verificationRequestResult.isErr()) {
      return Result.err({
        type: 'generic',
        err: verificationRequestResult.unwrapErr()
      });
    } else {
      verificationRequest = verificationRequestResult.unwrap();
    }

    // CreateMany is not supported in sqlite
    const uploadResult = await Promise.all(
      data.map((data) =>
        Result.fromAsync<VerificationAnswer, Error>(async () =>
          database.verificationAnswer.create({
            data: {
              question: data.question,
              answer: data.answer,
              verificationRequestId: verificationRequest.id
            }
          })
        )
      )
    );

    if (uploadResult.some((result) => result.isErr())) {
      await database.verificationRequest.delete({
        where: {
          id: verificationRequest.id
        }
      });

      return Result.err({
        type: 'database_error',
        err: uploadResult.find((result) => result.isErr())!.unwrapErr()
      });
    }

    return Result.ok(verificationRequest);
  }

  public async createVerificationRequest(
    userId: string,
    data: { question: string; answer: string }[]
  ): Promise<Result<VerificationRequest, CreateVerificationRequestError>> {
    return VerificationUtility.createVerificationRequest(userId, data);
  }

  public static async createVerificationRequestAndLog(
    userId: string,
    data: { question: string; answer: string }[]
  ): Promise<
    Result<
      { request: VerificationRequest; message: Message<true> | Message<false> },
      CreateVerificationRequestAndLogError
    >
  > {
    const verificationRequestResult = await this.createVerificationRequest(userId, data);

    if (verificationRequestResult.isErr()) {
      return Result.err(verificationRequestResult.unwrapErr());
    }

    const requestLogResult = await container.utilities.guild.createVerificationRequestLog(
      verificationRequestResult.unwrap(),
      data.map((data_1) => ({
        question: data_1.question,
        answer: data_1.answer
      }))
    );

    if (requestLogResult.isErr()) {
      container.logger.error(requestLogResult.unwrapErr());
      return Result.err(requestLogResult.unwrapErr());
    }

    const verificationRequestUpdateResult = await Result.fromAsync<unknown, Error>(
      async () =>
        await container.database.verificationRequest.update({
          where: {
            id: verificationRequestResult.unwrap().id
          },
          data: {
            logMessageId: requestLogResult.unwrap().id
          }
        })
    );

    if (verificationRequestUpdateResult.isErr()) {
      container.logger.error(verificationRequestUpdateResult.unwrapErr());
      return Result.err({ type: 'database_error', err: verificationRequestUpdateResult.unwrapErr() });
    }

    return Result.ok({
      request: verificationRequestResult.unwrap(),
      message: requestLogResult.unwrap()
    });
  }

  public async createVerificationRequestAndLog(
    userId: string,
    data: { question: string; answer: string }[]
  ): Promise<
    Result<
      { request: VerificationRequest; message: Message<true> | Message<false> },
      CreateVerificationRequestAndLogError
    >
  > {
    return VerificationUtility.createVerificationRequestAndLog(userId, data);
  }

  public static async declineVerificationRequest(
    verificationRequest: { id: string },
    reason: string = 'unknown'
  ): Promise<Result<void, DeclineVerificationRequestError>> {
    const { database } = container;

    const verificationRequestFindResult = await Result.fromAsync<VerificationRequest | null, Error>(
      async () =>
        await database.verificationRequest.findUnique({
          where: {
            id: verificationRequest.id
          }
        })
    );

    if (verificationRequestFindResult.isErr()) {
      return Result.err({
        type: 'database_error',
        err: verificationRequestFindResult.unwrapErr()
      });
    }

    if (verificationRequestFindResult.unwrap() === null) {
      return Result.err({
        type: 'verification_request_not_found',
        err: undefined
      });
    }

    const verificationRequestUpdateResult = await Result.fromAsync<unknown, Error>(
      async () =>
        await database.verificationRequest.delete({
          where: {
            id: verificationRequest.id
          }
        })
    );

    if (verificationRequestUpdateResult.isErr()) {
      return Result.err({
        type: 'database_error',
        err: verificationRequestUpdateResult.unwrapErr()
      });
    }

    const verificationRequestLogMessageId = verificationRequestFindResult.unwrap()!.logMessageId;

    // We don't care if this fails
    if (verificationRequestLogMessageId) {
      const verificationRequestLogMessage = await container.utilities.guild
        .verificationLogChannel!.messages.fetch(verificationRequestLogMessageId)
        .catch(() => null);

      if (verificationRequestLogMessage) {
        const newEmbed = EmbedUtility.deleteComponent(verificationRequestLogMessage);
        // (newEmbed.embeds![0] as APIEmbed).color = 0xff0000;

        await verificationRequestLogMessage.edit(newEmbed).catch(() => null);
      }
    }

    const userFetchResult = await Result.fromAsync<User | null, Error>(
      async () => await container.client.users.fetch(verificationRequestFindResult.unwrap()!.ownerId)
    );

    if (userFetchResult.isErr()) {
      return Result.err({
        type: 'cant_send_message',
        err: userFetchResult.unwrapErr()
      });
    }

    const user = userFetchResult.unwrap()!;

    const messageSendResult = await Result.fromAsync<unknown, DiscordAPIError>(
      async () =>
        await user.send({
          embeds: [
            {
              title: 'Verification Request Declined',
              description: `Your verification request have been declined with the reason: ${reason}`,
              color: 0xff0000
            }
          ]
        })
    );

    if (messageSendResult.isErr()) {
      return Result.err({
        type: 'cant_send_message',
        err: messageSendResult.unwrapErr()
      });
    }

    return Result.ok(undefined);
  }

  public async declineVerificationRequest(
    verificationRequest: { id: string },
    reason: string
  ): Promise<Result<void, DeclineVerificationRequestError>> {
    return VerificationUtility.declineVerificationRequest(verificationRequest, reason);
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  public async tempCommonDecline(
    interaction: ModalSubmitInteraction | StringSelectMenuInteraction,
    id: string,
    reason: string
  ) {
    const verificationRequestFindResult = await Result.fromAsync(
      async () =>
        await container.database.verificationRequest.findUnique({
          where: {
            id
          }
        })
    );

    if (verificationRequestFindResult.isErr()) {
      await interaction.editReply({ content: 'Database error! please report to hayper!' });
      container.logger.error(verificationRequestFindResult.unwrapErr());
      return;
    }

    const verificationRequest = verificationRequestFindResult.unwrap();
    if (!verificationRequest) {
      await interaction.editReply({ content: 'Verification request not found!' });
      return;
    }

    const verificationRequestDeclineResult = await container.utilities.verification.declineVerificationRequest(
      verificationRequest,
      reason
    );

    if (verificationRequestDeclineResult.isErr()) {
      const err = verificationRequestDeclineResult.unwrapErr();

      if (err.type === 'cant_send_message') {
        await interaction.editReply({ content: 'I can not send message to the user!' });
        return;
      } else {
        await interaction.editReply({ content: 'An error have occured! please report to hayper!' });
        container.logger.error(err.err);
        return;
      }
    }

    await interaction.editReply({ content: 'Verification request declined!' });
  }
}
