import { InlineKeyboard } from "grammy";
import { BUTTONS_CALLBACK_QUERIES } from "../constants/buttons";
import { COMMAND_USER_HELP } from "../constants/handler_command";

export const RegistrationInlineKeyboard = (): InlineKeyboard =>
  new InlineKeyboard().text(
    BUTTONS_CALLBACK_QUERIES.RegistrationButtonText,
    BUTTONS_CALLBACK_QUERIES.RegistrationButton,
  );

export const FinishSurveyInlineKeyboard = (
  survey_active_id: number,
): InlineKeyboard =>
  new InlineKeyboard()
    .text(
      BUTTONS_CALLBACK_QUERIES.FinishSurveyButtonText,
      BUTTONS_CALLBACK_QUERIES.FinishSurveyButton + "_" + survey_active_id,
    )
    .text(
      BUTTONS_CALLBACK_QUERIES.CancelSurveyButtonText,
      BUTTONS_CALLBACK_QUERIES.CancelSurveyButton + "_" + survey_active_id,
    );

export const IdentificationInlineKeyboard = (): InlineKeyboard =>
  new InlineKeyboard().text(
    BUTTONS_CALLBACK_QUERIES.IdentificationButtonText,
    BUTTONS_CALLBACK_QUERIES.IdentificationButton,
  );

export const BalanceMenuInlineKeyboard = (): InlineKeyboard =>
  new InlineKeyboard()
    .text(
      BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButtonText,
      BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButton,
    )
    .row()
    .text(
      BUTTONS_CALLBACK_QUERIES.HistoryMoneyInputButtonText,
      BUTTONS_CALLBACK_QUERIES.HistoryMoneyInputButton,
    )
    .row()
    .text(
      BUTTONS_CALLBACK_QUERIES.HistoryWithdrawalOfMoneyButtonText,
      BUTTONS_CALLBACK_QUERIES.HistoryWithdrawalOfMoneyButton,
    );

export const WithdrawalHistoryMenuInlineKeyboard = (): InlineKeyboard =>
  new InlineKeyboard()
    .text(
      BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButtonText,
      BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButton,
    )
    .row()
    .text(
      BUTTONS_CALLBACK_QUERIES.HistoryMoneyInputButtonText,
      BUTTONS_CALLBACK_QUERIES.HistoryMoneyInputButton,
    );

export const AccrualHistoryMenuInlineKeyboard = (): InlineKeyboard =>
  new InlineKeyboard()
    .text(
      BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButtonText,
      BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButton,
    )
    .row()
    .text(
      BUTTONS_CALLBACK_QUERIES.HistoryWithdrawalOfMoneyButtonText,
      BUTTONS_CALLBACK_QUERIES.HistoryWithdrawalOfMoneyButton,
    );

export const HelpInlineKeyboard = (): InlineKeyboard => {
  return new InlineKeyboard()
    .text(
      COMMAND_USER_HELP.FirstQuestionButtonText,
      COMMAND_USER_HELP.FirstQuestionButton,
    )
    .row()
    .text(
      COMMAND_USER_HELP.SecondQuestionButtonText,
      COMMAND_USER_HELP.SecondQuestionButton,
    )
    .row()
    .text(
      COMMAND_USER_HELP.ThirdQuestionButtonText,
      COMMAND_USER_HELP.ThirdQuestionButton,
    )
    .row()
    .text(
      COMMAND_USER_HELP.LastQuestionButtonText,
      COMMAND_USER_HELP.LastQuestionButton,
    );
};

export const CreateInlineKeyboard = (
  arr: { label: string; value: string }[],
): InlineKeyboard => {
  const keyboard = new InlineKeyboard();

  for (const el of arr) {
    keyboard.text(el.label, el.value).row();
  }
  return keyboard;
};

export const HelpBackInlineKeyboard = (): InlineKeyboard => {
  return new InlineKeyboard().text(
    COMMAND_USER_HELP.BackButtonText,
    COMMAND_USER_HELP.BackButton,
  );
};

export const TookSurveyInlineKeyboard = (): InlineKeyboard => {
  return new InlineKeyboard().text(
    BUTTONS_CALLBACK_QUERIES.TookButtonText,
    BUTTONS_CALLBACK_QUERIES.TookButton,
  );
};

export const TookAuditSurveyInlineKeyboard = (): InlineKeyboard => {
  return new InlineKeyboard().text(
    BUTTONS_CALLBACK_QUERIES.TookAuditButtonText,
    BUTTONS_CALLBACK_QUERIES.TookAuditButton,
  );
};

export const VerificationUsersMenuKeyboard = (): InlineKeyboard => {
  return new InlineKeyboard()
    .text(
      BUTTONS_CALLBACK_QUERIES.CheckThisUserVerifyButtonText,
      BUTTONS_CALLBACK_QUERIES.CheckThisUserVerifyButton,
    )
    .row()
    .text(
      BUTTONS_CALLBACK_QUERIES.ListAllSameFaceUsersButtonText,
      BUTTONS_CALLBACK_QUERIES.ListAllSameFaceUsersButton,
    )
    .row()
    .text(
      BUTTONS_CALLBACK_QUERIES.ListNotVerifyUsersButtonText,
      BUTTONS_CALLBACK_QUERIES.ListNotVerifyUsersButton,
    )
    .row();
};

export const LogsInlineKeyboard = (): InlineKeyboard => {
  return new InlineKeyboard()
    .text(
      BUTTONS_CALLBACK_QUERIES.GetUsersLogsButtonText,
      BUTTONS_CALLBACK_QUERIES.GetUsersLogsButton,
    )
    .row()
    .text(
      BUTTONS_CALLBACK_QUERIES.GetMoneyLogsButtonText,
      BUTTONS_CALLBACK_QUERIES.GetMoneyLogsButton,
    )
    .row();
};

export const PaymentsInlineKeyboard = (): InlineKeyboard => {
  return new InlineKeyboard()
    .text(
      BUTTONS_CALLBACK_QUERIES.SwitchPaymentButtonText,
      BUTTONS_CALLBACK_QUERIES.SwitchPaymentButton,
    )
    .row()
    .text(
      BUTTONS_CALLBACK_QUERIES.ManualPaymentButtonText,
      BUTTONS_CALLBACK_QUERIES.ManualPaymentButton,
    )
    .row()
    .text(
      BUTTONS_CALLBACK_QUERIES.RestartFailedPaymentsButtonText,
      BUTTONS_CALLBACK_QUERIES.RestartFailedPaymentsButton,
    )
    .row()
    .text(
      BUTTONS_CALLBACK_QUERIES.CancelFailedPaymentsButtonText,
      BUTTONS_CALLBACK_QUERIES.CancelFailedPaymentsButton,
    )
    .row();
};
