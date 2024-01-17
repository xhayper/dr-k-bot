import { type VerificationRequest, type VerificationAnswer } from '@prisma/client';
import { container } from '@sapphire/pieces';
import { Result } from '@sapphire/result';

export type CreateVerificationRequestError =
  | {
      type: 'verification_pending';
    }
  | {
      type: 'generic';
      err: Error;
    };

export class VerificationUtility {
    // TODO: Use Result<boolean, UserPendingVerificationError>
  public static async isUserPendingVerification(userId: string): Promise<boolean> {
    const { database } = container;

    const requestCount = await database.verificationRequest.count({
      where: {
        ownerId: userId
      }
    }).catch(() => 0);

    return requestCount > 0;
  }

  public async isUserPendingVerification(userId: string): Promise<boolean> {
    return VerificationUtility.isUserPendingVerification(userId);
  }

  public static async createVerificationRequest(
    userId: string,
    data: { question: string; answer: string }[]
  ): Promise<Result<VerificationRequest, CreateVerificationRequestError>> {
    console.log(await this.isUserPendingVerification(userId));

    if (await this.isUserPendingVerification(userId).catch(Result.err)) {
      return Result.err({ type: 'verification_pending' });
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
        type: 'generic',
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
}
