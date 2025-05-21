import path from "path";
import fs from "node:fs";
import { Bot } from "grammy";
import { MyContext } from "../bot-common/types/type";

export async function downloadFile(
  fileId: string,
  filePath: string,
  bot: Bot<MyContext>,
): Promise<string> {
  const file = await bot.api.getFile(fileId);
  const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
  const response = await fetch(fileUrl);
  const buffer = await response.arrayBuffer();

  const localPath = path.join(__dirname, filePath);
  fs.writeFileSync(localPath, Buffer.from(buffer));
  return localPath;
}
