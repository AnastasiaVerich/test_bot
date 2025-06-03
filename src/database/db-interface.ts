import { Generated } from "kysely";

type NotifyReasonType = "finish_survey" | null;
type SurveyType = "test_site";
type CommonVariablesLabelType = "ton_rub_price" | "auto_payments_enabled";
type ReferralBonusesStatusType = "pending" | "completed";

export interface BlacklistUsersEntity {
  blacklist_id: Generated<number>;
  account_id: number | null; // ID аккаунта пользователя, если есть
  phone: string | null; // Номер телефона
  reason: string | null; // Причина блокировки

  created_at: Generated<string>; // Дата добавления в блок-лист
}

export interface UsersEntity {
  user_id: number;
  phone: string;
  balance: Generated<number>; // Текущий баланс пользователя
  notify_reason: Generated<NotifyReasonType>;
  survey_lock_until: Generated<string | null>; // Возможно, в ISO строке
  last_init: Generated<string | null>; // Дата и время в ISO формате
  skip_photo_verification: Generated<boolean>; // -- Пропуск фотоконтроля
  last_tg_account: Generated<string | null>; // -- Последняя инфа о тг-аккаунте
  last_user_location: Generated<string | null>; // -- Пропуск инфа о локации юзера

  created_at: Generated<string>; // Дата и время в ISO формате
}

export interface FaceEmbeddingsEntity {
  face_embedding_id: Generated<number>;
  user_id: number;
  embedding: string; // Данные в формате JSONB

  created_at: Generated<string>; // Дата и время в ISO формате
}

export interface PhotosEntity {
  photo_id: Generated<number>;
  user_id: number;
  image: Buffer; // Для хранения изображения в формате BYTEA

  created_at: Generated<string>; // Дата и время в ISO формате
}

export interface OperatorsEntity {
  id: Generated<number>;
  operator_id: Generated<number>;
  tg_account: string;
  phone: Generated<string | null>;
  can_take_multiple_surveys: Generated<boolean>;

  created_at: Generated<string>; // Дата и время в ISO формате
}

export interface SupervisorEntity {
  id: Generated<number>;
  supervisor_id: Generated<number>;
  tg_account: string;
  phone: Generated<string | null>;

  created_at: Generated<string>; // Дата и время в ISO формате
}

export interface AdvertisingCampaignsEntity {
  id: Generated<number>;
  name: string;
  referral_link: string;

  created_at: Generated<string>; // Дата и время в ISO формате
}

export interface BotUserLogsEntity {
  id: Generated<number>;
  user_id: number;
  event_type: string;
  step: string | null;
  event_data: any;

  logged_at: Generated<string>; // Дата и время в ISO формате
}

export interface RegionSettingsEntity {
  region_id: Generated<number>;
  region_name: string;
  reservation_time_min: number; // Время резервации задания для региона
  survey_interval: Generated<string>; //
  polygon: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

  created_at: Generated<string>; // Дата и время в ISO формате
}

export interface OperatorsRegionsEntity {
  operator_region_id: Generated<number>;
  operator_id: number;
  region_id: number;

  created_at: Generated<string>; // Дата и время в ISO формате
}

export interface SurveysEntity {
  survey_id: Generated<number>;
  region_id: number;
  survey_type: SurveyType;
  topic: string;
  description: string | null;
  completion_limit: number;
  active_and_completed_count: Generated<number>;
  task_price: Generated<number>;

  created_at: Generated<string>; // Дата и время в ISO формате
}

export interface SurveyTasksEntity {
  survey_task_id: Generated<number>;
  survey_id: number;
  description: string;
  data: string; // Данные в формате JSONB

  created_at: Generated<string>; // Дата и время в ISO формате
}

export interface SurveyActiveEntity {
  survey_active_id: Generated<number>;
  survey_id: number;
  user_id: number;
  operator_id: number | null;
  message_id: number | null;
  is_user_notified: Generated<boolean>;
  is_reservation_end: Generated<boolean>;
  reservation_end: string | null;
  code_word: string | null;

  created_at: Generated<string>; // Дата и время в ISO формате
}

export interface SurveyCompletionsEntity {
  completion_id: Generated<number>;
  survey_id: number;
  survey_task_id: number;
  user_id: number;
  operator_id: number;
  result: string;
  result_positions_var: string;
  reward: number;

  completed_at: Generated<string>; // Дата и время в ISO формате
}

export interface WithdrawalLogsEntity {
  withdrawal_id: Generated<number>;
  user_id: number;
  amount: number;
  wallet: string;

  withdrawn_at: Generated<string>;
}

export interface CommonVariablesEntity {
  common_vars_id: Generated<number>;
  label: CommonVariablesLabelType;
  value: string;
  created_at: Generated<string>; // Дата добавления
  updated_at: Generated<string>; // Дата добавления
}

export interface PendingPaymentsEntity {
  user_id: number; // Идентификатор пользователя (связан с users)
  amount: number; // Сумма платежа
  attempts: Generated<number>; // Количество попыток проведения платежа
  address: string; // Адрес для платежа

  created_at: Generated<string>; // Дата создания записи
}

export interface ReferralBonusesEntity {
  referred_user_id: number;
  referrer_id: number;
  amount: Generated<number>;
  status: Generated<ReferralBonusesStatusType>;

  created_at: Generated<string>;
  completed_at: Generated<string>;
}

export interface Database {
  blacklist_users: BlacklistUsersEntity;
  users: UsersEntity;
  face_embeddings: FaceEmbeddingsEntity;
  photos: PhotosEntity;
  operators: OperatorsEntity;
  region_settings: RegionSettingsEntity;
  operators_regions: OperatorsRegionsEntity;
  surveys: SurveysEntity;
  survey_tasks: SurveyTasksEntity;
  survey_active: SurveyActiveEntity;
  survey_completions: SurveyCompletionsEntity;
  withdrawal_logs: WithdrawalLogsEntity;
  common_variables: CommonVariablesEntity;
  pending_payments: PendingPaymentsEntity;
  referral_bonuses: ReferralBonusesEntity;
  supervisor: SupervisorEntity;
  advertising_campaigns: AdvertisingCampaignsEntity;
  bot_user_logs: BotUserLogsEntity;
}
