import { pool, poolType } from "../dbClient";
import { ReferralBonusesType } from "../db-types";

export async function addReferral(
  params: {
    userId: ReferralBonusesType["referred_user_id"];
    referredId: ReferralBonusesType["referrer_id"];
  },
  trx: poolType = pool,
): Promise<ReferralBonusesType["referred_user_id"] | null> {
  try {
    const { userId, referredId } = params;

    const result = await trx
      .insertInto("referral_bonuses")
      .values({
        referred_user_id: userId,
        referrer_id: referredId,
      })
      .onConflict((oc) => oc.column("referred_user_id").doNothing())
      .returning("referred_user_id")
      .executeTakeFirst();

    return result?.referred_user_id ?? null;
  } catch (error) {
    throw new Error("Error addReferral: " + error);
  }
}

export async function getAllReferralByrReferrerIdAndStatus(
  referrer_id: ReferralBonusesType["referrer_id"],
  status: ReferralBonusesType["status"],
  trx: poolType = pool,
): Promise<ReferralBonusesType[]> {
  try {
    const result = await trx
      .selectFrom("referral_bonuses")
      .selectAll()
      .where("referrer_id", "=", referrer_id)
      .where("status", "=", status)
      .orderBy("completed_at", "desc")
      .execute();

    return result;
  } catch (error) {
    throw new Error("Error getAllReferralByrReferrerIdAndStatus: " + error);
  }
}
export async function getReferralByReferredUserIdAndStatus(
  referred_user_id: ReferralBonusesType["referred_user_id"],
  status: ReferralBonusesType["status"],
  trx: poolType = pool,
): Promise<ReferralBonusesType | null> {
  try {
    const result = await trx
      .selectFrom("referral_bonuses")
      .selectAll()
      .where("referred_user_id", "=", referred_user_id)
      .where("status", "=", status)
      .orderBy("completed_at", "desc")
      .executeTakeFirst();

    return result ?? null;
  } catch (error) {
    throw new Error("Error getReferralByReferredUserIdAndStatus: " + error);
  }
}

export async function updateReferralByReferredUserId(
  referred_user_id: ReferralBonusesType["referred_user_id"],
  params: {
    status: ReferralBonusesType["status"];
    amount: ReferralBonusesType["amount"];
  },
  trx: poolType = pool,
): Promise<ReferralBonusesType["referred_user_id"] | null> {
  try {
    const { status, amount } = params;

    const set: Partial<ReferralBonusesType> = {};
    set.status = status;
    set.amount = amount;

    const result = await trx
      .updateTable("referral_bonuses")
      .set(set)
      .where("referred_user_id", "=", referred_user_id)
      .returning("referred_user_id")
      .executeTakeFirst();
    return result?.referred_user_id ?? null;
  } catch (error) {
    throw new Error("Error updateReferralByReferredUserId: " + error);
  }
}
