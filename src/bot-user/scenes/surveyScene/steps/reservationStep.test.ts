/*
import { PoolClient } from "pg";

import { RegionSettings } from "../../../../database/queries/regionQueries";
import {
  Operator,
  updateOperatorStatus,
} from "../../../../database/queries/operatorQueries";
import { updateUserStatus } from "../../../../database/queries/userQueries";
import {
  reserveSurvey,
  Survey,
} from "../../../../database/queries/surveyQueries";
import { db } from "../../../../database/dbClient";
import { reservationStep } from "./reservationStep";

// Мокаем зависимости
jest.mock("../../../../database/dbClient");
jest.mock("../../../../database/queries/userQueries");
jest.mock("../../../../database/queries/operatorQueries");
jest.mock("../../../../database/queries/surveyQueries");

describe("Test searchOperatorStep", () => {
  const client: Partial<PoolClient> = {
    connect: jest.fn(),
    query: jest.fn(),
    release: jest.fn(),
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Должна вернуть true если все прошло успешно
  it("Should return true, if was not error", async () => {
    (db.connect as jest.Mock).mockResolvedValueOnce(client);
    (updateUserStatus as jest.Mock).mockResolvedValue({});
    (updateOperatorStatus as jest.Mock).mockResolvedValue({});
    (reserveSurvey as jest.Mock).mockResolvedValue({});
    (client.query as jest.Mock).mockResolvedValueOnce({});
    (client.release as jest.Mock).mockResolvedValueOnce({});

    const result = await reservationStep(
      123,
      {} as Operator,
      {} as Survey,
      {} as RegionSettings,
    );

    expect(result).toBe(true);
  });

  // Должна вернуть false, если возникла ошибка
  it("Should return false, if was error", async () => {
    const error = new Error("Database error");

    (db.connect as jest.Mock).mockResolvedValueOnce(client);
    (updateUserStatus as jest.Mock).mockRejectedValueOnce(error);

    const result = await reservationStep(
      123,
      {} as Operator,
      {} as Survey,
      {} as RegionSettings,
    );

    expect(result).toBe(false);
  });
});
*/
