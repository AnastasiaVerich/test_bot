import { pool, poolType } from "../dbClient";
import { entitiesType } from "../../bot-common/types/type";
import { updateAuditorByTgAccount } from "../queries_kysely/auditors";
import { updateOperatorByTgAccount } from "../queries_kysely/operators";
import { updateSupervisorByTgAccount } from "../queries_kysely/supervisor";

export async function registrationUser(
  params: {
    type: entitiesType;
    id: number;
    userPhone: string;
    userAccount: string;
  },

  trx: poolType = pool,
) {
  const { type, id, userPhone, userAccount } = params;
  switch (type) {
    case "auditor":
      await updateAuditorByTgAccount(userAccount, {
        auditor_id: id,
        phone: userPhone,
      });
      break;
    case "operator":
      await updateOperatorByTgAccount(userAccount, {
        operator_id: id,
        phone: userPhone,
      });
      break;
    case "supervisor":
      await updateSupervisorByTgAccount(userAccount, {
        supervisor_id: id,
        phone: userPhone,
      });
      break;
  }
}
