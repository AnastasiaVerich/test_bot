import { db } from "../dbClient";
import {
  getAllPendingPayment,
  addPendingPayment,
  deletePendingPayment,
  findPendingPaymentByUserId,
  updateAttemptPendingPayment,
  PendingPayment,
} from "./pendingPaymentsQueries";

jest.mock("../dbClient");

describe("Pending Payments Queries", () => {
  describe("getAllPendingPayment", () => {
    it("Should return all pending payments", async () => {
      const mockPayments: PendingPayment[] = [
        {
          user_id: 1,
          amount: 100,
          attempts: 1,
          address: "address_1",
          createdAt: new Date("2022-01-01T00:00:00Z"),
        },
        {
          user_id: 2,
          amount: 200,
          attempts: 2,
          address: "address_2",
          createdAt: new Date("2022-01-02T00:00:00Z"),
        },
      ];

      (db.query as jest.Mock).mockResolvedValueOnce({ rows: mockPayments });

      const result = await getAllPendingPayment();
      expect(result).toEqual(mockPayments);
      expect(db.query).toHaveBeenCalledWith("SELECT * FROM pending_payments");
    });

    it("Should throw an error if query fails", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(getAllPendingPayment()).rejects.toThrow(
        "Error getAllPendingPayment: Database error",
      );
    });
  });

  describe("addPendingPayment", () => {
    it("Should add a new pending payment", async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({});

      await addPendingPayment(1, 100, "test_address");
      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO pending_payments (user_id, amount, address, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)",
        [1, 100, "test_address"],
      );
    });

    it("Should throw an error if query fails", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(addPendingPayment(1, 100, "test_address")).rejects.toThrow(
        "Error addPendingPayment: Database error",
      );
    });
  });

  describe("deletePendingPayment", () => {
    it("Should delete a pending payment by userId", async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({});

      await deletePendingPayment(1);
      expect(db.query).toHaveBeenCalledWith(
        "DELETE  FROM  pending_payments WHERE userId = $1;",
        [1],
      );
    });

    it("Should throw an error if query fails", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(deletePendingPayment(1)).rejects.toThrow(
        "Error deletePendingPayment: Database error",
      );
    });
  });

  describe("findPendingPaymentByUserId", () => {
    it("Should return pending payments for a given userId", async () => {
      const mockPayments: PendingPayment[] = [
        {
          user_id: 1,
          amount: 100,
          attempts: 1,
          address: "address_1",
          createdAt: new Date("2022-01-01T00:00:00Z"),
        },
      ];

      (db.query as jest.Mock).mockResolvedValueOnce({ rows: mockPayments });

      const result = await findPendingPaymentByUserId(1);
      expect(result).toEqual(mockPayments);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM pending_payments WHERE user_id = $1",
        [1],
      );
    });

    it("Should throw an error if userId is invalid", async () => {
      await expect(findPendingPaymentByUserId(null as any)).rejects.toThrow(
        "Invalid type provided",
      );
    });

    it("Should throw an error if query fails", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(findPendingPaymentByUserId(1)).rejects.toThrow(
        "Error findPendingPaymentByUserId: Database error",
      );
    });
  });

  describe("updateAttemptPendingPayment", () => {
    it("Should update the attempts count for a pending payment", async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({});

      await updateAttemptPendingPayment(1, 3);
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE pending_payments SET attempts = $1 WHERE user_id = $2",
        [1, 3],
      );
    });

    it("Should throw an error if parameters are invalid", async () => {
      await expect(updateAttemptPendingPayment(null as any, 3)).rejects.toThrow(
        "Invalid type provided",
      );
    });

    it("Should throw an error if query fails", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(updateAttemptPendingPayment(1, 3)).rejects.toThrow(
        "Error updateAttemptPendingPayment: Database error",
      );
    });
  });
});
