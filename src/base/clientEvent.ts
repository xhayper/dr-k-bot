import { Client, ClientEvents } from "discord.js";

export type ClientEventName = keyof ClientEvents;

export type ClientEventListener<T extends ClientEventName> = (
  client: Client,
  ...args: ClientEvents[T]
) => any | Promise<any>;

export interface ClientEvent<T extends ClientEventName> {
  eventName: T;
  on?: ClientEventListener<T>;
  once?: ClientEventListener<T>;
}

export const TypedEvent = <T extends ClientEventName>(
  clientEvent: ClientEvent<T>
) => clientEvent;
