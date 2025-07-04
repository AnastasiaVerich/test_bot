import { Bot } from "grammy";
import { createConversation } from "@grammyjs/conversations";
import { MyContext } from "../../bot-common/types/type";
import { addAdvertisingCampaignScene } from "./add_advertising_campaign";
import { addNewSurveysScene } from "./add_new_surveys";
import { switchPaymentType } from "./switch_payment_type";
import { makeAPayment } from "./make_a_payment";
import { addNewOperatorsScene } from "./add_new_operators";
import { simpleRegistrationScene } from "../../bot-common/scenes/simpleRegistration";
import { AuthSupervisorKeyboard } from "../../bot-common/keyboards/keyboard";
import { thisUserVerify } from "./this_user_verify";

export enum ScenesSupervisor {
  RegisterScene = "RegisterScene", // eslint-disable-line no-unused-vars
  ThisUserVerifyScene = "ThisUserVerifyScene", // eslint-disable-line no-unused-vars
  AddAdvertisingCampaignScene = "AddAdvertisingCampaignScene", // eslint-disable-line no-unused-vars
  AddNewSurveys = "AddNewSurveys", // eslint-disable-line no-unused-vars
  SwitchPaymentType = "SwitchPaymentType", // eslint-disable-line no-unused-vars
  MakeAPayment = "MakeAPayment", // eslint-disable-line no-unused-vars
  AddNewOperators = "AddNewOperators", // eslint-disable-line no-unused-vars
}

export function registerScenes(bot: Bot<MyContext>): void {
  // Регистрируем сцену
  bot.use(
    createConversation(
      (a, b) =>
        simpleRegistrationScene(a, b, "supervisor", AuthSupervisorKeyboard()),
      {
        id: ScenesSupervisor.RegisterScene,
      },
    ),
  );
  bot.use(
    createConversation(addAdvertisingCampaignScene, {
      id: ScenesSupervisor.AddAdvertisingCampaignScene,
    }),
  );
  bot.use(
    createConversation((a, b) => addNewSurveysScene(a, b, bot), {
      id: ScenesSupervisor.AddNewSurveys,
    }),
  );
  bot.use(
    createConversation(switchPaymentType, {
      id: ScenesSupervisor.SwitchPaymentType,
    }),
  );
  bot.use(
    createConversation(makeAPayment, {
      id: ScenesSupervisor.MakeAPayment,
    }),
  );
  bot.use(
    createConversation(addNewOperatorsScene, {
      id: ScenesSupervisor.AddNewOperators,
    }),
  );

  bot.use(
    createConversation(thisUserVerify, {
      id: ScenesSupervisor.ThisUserVerifyScene,
    }),
  );
}
