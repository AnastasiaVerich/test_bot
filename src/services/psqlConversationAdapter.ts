import { VersionedStateStorage, VersionedState } from "@grammyjs/conversations";
import { Client } from "pg";
import logger from "../lib/logger";
import { ConversationData } from "../bot-common/types/type";

export class PsqlConversationAdapter
  implements VersionedStateStorage<string, ConversationData>
{
  private client: Client;
  private tableName: string;

  constructor(client: Client, tableName: string) {
    this.client = client;
    this.tableName = tableName;
  }

  async read(
    key: string,
  ): Promise<VersionedState<ConversationData> | undefined> {
    try {
      const query = `
                SELECT state, version
                FROM ${this.tableName}
                WHERE key = $1
            `;
      const res = await this.client.query(query, [key]);
      if (res.rows.length === 0) return undefined;

      const storedVersion = res.rows[0].version;
      const versionNumber = Number(storedVersion);
      if (isNaN(versionNumber) || !Number.isInteger(versionNumber)) {
        logger.error(`Invalid version format for key ${key}: ${storedVersion}`);
        return undefined;
      }

      // Преобразуем число в кортеж [0, number] для соответствия VersionedState
      const version: [0, number] = [0, versionNumber];

      return {
        state: res.rows[0].state,
        version: version,
      };
    } catch (err) {
      logger.error(`Error reading conversation state for key ${key}:`, err);
      return undefined;
    }
  }

  async write(
    key: string,
    value: VersionedState<ConversationData>,
  ): Promise<void> {
    try {
      // Предполагаем, что version - это кортеж [0, string | number]
      const versionValue =
        Array.isArray(value.version) && value.version.length === 2
          ? value.version[1]
          : value.version;
      const version = Number(versionValue);
      if (isNaN(version) || !Number.isInteger(version)) {
        logger.error(
          `Invalid version value for key ${key}: ${JSON.stringify(value.version)}`,
        );
        throw new Error(
          `Invalid version value: ${JSON.stringify(value.version)}`,
        );
      }

      const query = `
                INSERT INTO ${this.tableName} (key, state, version)
                VALUES ($1, $2, $3)
                ON CONFLICT (key)
                DO UPDATE SET state = $2, version = $3
            `;
      await this.client.query(query, [key, value.state, version]);
    } catch (err) {
      logger.error(`Error writing conversation state for key ${key}:`, err);
      throw err;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const query = `
                DELETE FROM ${this.tableName}
                WHERE key = $1
            `;
      await this.client.query(query, [key]);
    } catch (err) {
      logger.error(`Error deleting conversation state for key ${key}:`, err);
    }
  }

  async init(): Promise<void> {
    try {
      const query = `
                CREATE TABLE IF NOT EXISTS ${this.tableName} (
                    key TEXT PRIMARY KEY,
                    state JSONB NOT NULL,
                    version INTEGER NOT NULL
                )
            `;
      await this.client.query(query);
    } catch (err) {
      logger.error(`Error initializing table ${this.tableName}:`, err);
      throw err;
    }
  }
}
