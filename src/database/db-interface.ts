import { Generated } from "kysely";

type NotifyReasonType = "finish_survey" | null;
type SurveyType = "test_site";
type CommonVariablesLabelType = "ton_rub_price" | "auto_payments_enabled";
type ReferralBonusesStatusType = "pending" | "completed";

// Таблица чёрного списка пользователей
export interface BlacklistUsersEntity {
  blacklist_id: Generated<number>;
  account_id: number | null; // ID аккаунта пользователя
  phone: string | null; // Номер телефона
  reason: string | null; // Причина блокировки

  created_at: Generated<string>; // Дата добавления в блэк-лист
}

// Таблица пользователей
export interface UsersEntity {
  user_id: number;
  phone: string; // Номер телефона
  balance: Generated<number>; // Баланс, который можно снять
  notify_reason: Generated<NotifyReasonType>; // Причина, по которой пользователю нужно прислать уведомление
  survey_lock_until: Generated<string | null>; // Дата после которой можно проходить опрос
  last_init: Generated<string>; // Последний раз его идентификация была в этот день и час
  skip_photo_verification: Generated<boolean>; // Пропуск фотоконтроля
  last_tg_account: Generated<string | null>; // -- Последняя информация о тг-аккаунте
  last_user_location: Generated<string | null>; // -- Пропуск информация о локации юзера

  created_at: Generated<string>; // Дата регистрации
}

// Таблица эмбеддингов лица
export interface FaceEmbeddingsEntity {
  face_embedding_id: Generated<number>;
  user_id: number; // id пользователя, которому принадлежит эмбеддинг
  embedding: string; // Данные в формате JSONB

  created_at: Generated<string>; // Дата создания эмбеддинга
}

// Таблица фотографий
export interface PhotosEntity {
  photo_id: Generated<number>;
  user_id: number; // id пользователя, которому принадлежит фото
  image: Buffer; // Хранения изображения в формате BYTEA

  created_at: Generated<string>; // Дата создания фото
}

// Таблица операторов
export interface OperatorsEntity {
  id: Generated<number>;
  operator_id: Generated<number>; // id оператора
  balance: Generated<number>; // Баланс, который можно снять
  tg_account: string; // тг-аккаунт
  phone: Generated<string | null>; // номер телефона
  can_take_multiple_surveys: Generated<boolean>; // Может ли брать более 1го опроса

  created_at: Generated<string>; // Дата регистрации
}

// Таблица руководителей
export interface SupervisorEntity {
  id: Generated<number>;
  supervisor_id: Generated<number>; // id руководителя
  tg_account: string; // тг-аккаунт
  phone: Generated<string | null>; // номер телефон

  created_at: Generated<string>; // Дата регистрации
}

// Таблица аудиторов
export interface AuditorEntity {
  id: Generated<number>;
  auditor_id: Generated<number>; // id аудитора
  tg_account: string; // тг-аккаунт
  phone: Generated<string | null>; // номер телефон
  balance: Generated<number>; // Баланс, который можно снять

  created_at: Generated<string>; // Дата и время в ISO формате
}

// Рекламные компании
export interface AdvertisingCampaignsEntity {
  id: Generated<number>;
  name: string; // Название рекламной компании
  referral_link: string; // Реферальная ссылка

  created_at: Generated<string>; // Дата создания
}

// Логи пользователя
export interface BotUserLogsEntity {
  id: Generated<number>;
  user_id: number; // ID пользователя
  event_type: string; // тип ивента
  step: string | null; // шаг из типа
  event_data: any; // дополнительная информация из шага

  logged_at: Generated<string>; // Дата лога
}

// Таблица настроек регионов
export interface RegionSettingsEntity {
  region_id: Generated<number>;
  region_name: string; // Название региона
  reservation_time_min: number; // Время резервации задания для региона
  survey_interval: Generated<string>; // Интервал, через который пользователь сможет пройти снова опрос
  polygon: Record<string, any>; // Ограничение региона

  created_at: Generated<string>; // Дата и время создания региона
}

// Таблица связи операторов с регионами
export interface OperatorsRegionsEntity {
  operator_region_id: Generated<number>;
  operator_id: number; // ID оператора
  region_id: number; // ID региона

  created_at: Generated<string>; // Дата и время в ISO формате
}

// Таблица опросов
export interface SurveysEntity {
  survey_id: Generated<number>;
  region_id: number; // Регион опроса
  survey_type: SurveyType; // Тип опроса
  topic: string; // Тематика/название опроса
  description: string | null; // Описание
  completion_limit: number; // Столько раз его можно пройти
  active_and_completed_count: Generated<number>; // Столько раз его уже прошли
  task_price: Generated<number>; // Оплата за задание

  created_at: Generated<string>; // Дата создания
}

// Таблица заданий из опросов
export interface SurveyTasksEntity {
  survey_task_id: Generated<number>;
  survey_id: number; // ID опроса
  description: string; // Описание
  data: string; // Данные в формате JSONB

  created_at: Generated<string>; // Дата создания
}

//Таблица в которой зафиксировано, что сейчас опрос проходит ибо собирается проходить пользователь с оператором
export interface SurveyActiveEntity {
  survey_active_id: Generated<number>;
  survey_id: number; // ID опроса
  user_id: number; // ID пользователя
  operator_id: number | null; // ID оператора
  message_id: number | null; // ID сообщения в тг-канале опросов
  is_user_notified: Generated<boolean>; // флаг: уведомлен ли юзер, что ему надо написать оператору
  is_reservation_end: Generated<boolean>; // флаг: нужно ли освободить оператора и юзера от этого опроса
  reservation_end: string | null; // время, до которого пользователю нужно списаться с оператором
  code_word: string | null; // кодовая фраза, если нет тг аккаунта у пользователя

  created_at: Generated<string>; // Дата создания
}

//Таблица в которой зафиксированы результаты прохождения заданий опроса
export interface SurveyCompletionsEntity {
  completion_id: Generated<number>;
  survey_id: number; // ID опроса
  survey_task_id: number; // ID задания в опросе
  user_id: number; // ID пользователя
  operator_id: number; // ID оператора
  result: string; // На каком месте находится поисковой сайт
  result_positions_var: string; // что находится на 1-3 местах
  reward_user: number; // награда для пользователя
  reward_operator: number; // награда для оператора
  video_id: Generated<number | null>; // ID видео прохождения опроса

  completed_at: Generated<string>; // Дата создания
}

// Таблица для аудитов, которые либо сейчас проверяются, либо ждут проверки
export interface AuditorSurveyActiveEntity {
  audit_survey_active_id: Generated<number>;
  task_completions_ids: number[]; // массив айди выполненных заданий, которые оператор отметил
  survey_id: number; // id опроса
  message_id: number | null; // ID сообщения в тг-канале аудитов
  auditor_id: number | null; // ID аудитора, который будет проверять выполнение
  user_id: number | null; // ID аудитора, который будет проверять выполнение
  operator_id: number | null; // ID аудитора, который будет проверять выполнение
  video_id: number | null; // ID видео прохождения опроса

  created_at: Generated<string>; // Дата создания
}

// Таблица в которой зафиксированы результаты проверки прохождения опроса
export interface AuditorSurveyTaskCompletionsEntity {
  id: Generated<number>;
  completion_id: number | null; // id ответов оператора
  auditor_id: number; // ID аудитора, который проверял
  reward_auditor: number; // награда для аудитора
  result: string | null; // На каком месте находится поисковой сайт
  result_positions_var: string | null; // что находится на 1-3 местах
  description: string | null; // описание

  created_at: Generated<string>; // Дата и время создания
}

// Таблица логов снятия средств
export interface WithdrawalLogsEntity {
  withdrawal_id: Generated<number>;
  user_id: Generated<number | null>; // ID оператора
  auditor_id: Generated<number | null>; // ID аудитора
  operator_id: Generated<number | null>; // ID оператора
  amount: number; // сумма
  wallet: string; // кошелек

  withdrawn_at: Generated<string>; //дата и время снятия
}

// Таблица с общими переменными
export interface CommonVariablesEntity {
  common_vars_id: Generated<number>;
  label: CommonVariablesLabelType; // ключ
  value: string; // значение
  created_at: Generated<string>; // Дата добавления
  updated_at: Generated<string>; // Дата добавления
}

// Таблица в которой хранится список платежей, которые ожидают вывода
export interface PendingPaymentsEntity {
  pending_payments_id: Generated<number>;
  user_id: Generated<number | null>; // ID пользователя
  operator_id: Generated<number | null>; // ID оператора
  auditor_id: Generated<number | null>; // ID аудитора
  amount: number; // Сумма платежа
  attempts: Generated<number>; // Количество попыток проведения платежа
  wallet: string; // Кошелек

  created_at: Generated<string>; // Дата создания записи
}

// Таблица рефералов и наград за приглашенных пользователей
export interface ReferralBonusesEntity {
  referred_user_id: number; // приглашенный
  referrer_id: number; // пригласивший
  amount: Generated<number>; // Сумма бонуса
  status: Generated<ReferralBonusesStatusType>; // когда меняется на completed, то зачисляется на баланс referrer_id сумма amount

  created_at: Generated<string>; // дата создания
  completed_at: Generated<string | null>; // дата зачисления баланса
}

export interface VideosEntity {
  video_id: Generated<number>;
  file_id: string; //elegram file_id для отправки видео обратно, если в том же боте
  video_data: Buffer | null; // Видеофайл в бинарном формате
  file_name: string | null; // Имя файла
  mime_type: string | null; //Тип файла

  created_at: Generated<string>; // Дата создания
}

export interface Database {
  blacklist_users: BlacklistUsersEntity;
  users: UsersEntity;
  face_embeddings: FaceEmbeddingsEntity;
  photos: PhotosEntity;
  operators: OperatorsEntity;
  auditors: AuditorEntity;
  region_settings: RegionSettingsEntity;
  operators_regions: OperatorsRegionsEntity;
  surveys: SurveysEntity;
  survey_tasks: SurveyTasksEntity;
  survey_active: SurveyActiveEntity;
  survey_task_completions: SurveyCompletionsEntity;
  audit_survey_active: AuditorSurveyActiveEntity;
  audit_survey_task_completions: AuditorSurveyTaskCompletionsEntity;
  withdrawal_logs: WithdrawalLogsEntity;
  common_variables: CommonVariablesEntity;
  pending_payments: PendingPaymentsEntity;
  referral_bonuses: ReferralBonusesEntity;
  supervisor: SupervisorEntity;
  advertising_campaigns: AdvertisingCampaignsEntity;
  bot_user_logs: BotUserLogsEntity;
  videos: VideosEntity;
}
