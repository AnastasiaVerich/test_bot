import { Keyboard } from "grammy";

export const EmptyKeyboard = (): Keyboard => new Keyboard().resized().oneTime();
