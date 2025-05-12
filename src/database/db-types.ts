export interface BlacklistUsersEntity {
    blacklist_id: number;
    account_id: number | null; // ID аккаунта пользователя, если есть
    phone: string | null; // Номер телефона
    reason: string | null; // Причина блокировки

    created_at: string; // Дата добавления в блок-лист
}

export type NotifyReasonType = "finish_survey" | null;
export interface UsersEntity {
    user_id: number;
    phone: string;
    balance: number; // Текущий баланс пользователя
    notify_reason: NotifyReasonType ;
    survey_lock_until: string | null; // Возможно, в ISO строке
    last_init: string | null; // Дата и время в ISO формате

    created_at: string; // Дата и время в ISO формате
}

export interface FaceEmbeddingsEntity {
    face_embedding_id: number;
    user_id: number;
    embedding: string; // Данные в формате JSONB

    created_at: string; // Дата и время в ISO формате
}

export interface PhotosEntity {
    photo_id: number;
    user_id: number;
    image: Buffer; // Для хранения изображения в формате BYTEA

    created_at: string; // Дата и время в ISO формате
}

export interface OperatorsEntity {
    id: number;
    operator_id: number;
    tg_account: string;
    phone: string | null;
    can_take_multiple_surveys: boolean;

    created_at: string; // Дата и время в ISO формате
}

export interface RegionSettingsEntity {
    region_id: number;
    region_name: string;
    reservation_time_min: number; // Время резервации задания для региона
    survey_interval: string; //
    polygon: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

    created_at: string; // Дата и время в ISO формате
}

export interface OperatorsRegionsEntity {
    operator_region_id: number;
    operator_id: number;
    region_id: number;

    created_at: string; // Дата и время в ISO формате
}

export type SurveyType = "test_site";
export interface SurveysEntity {
    survey_id: number;
    region_id: number;
    survey_type: SurveyType;
    topic: string;
    description: string |null;
    completion_limit: number;
    active_and_completed_count: number;
    task_price: number;

    created_at: string; // Дата и время в ISO формате
}

export interface SurveyTasksEntity {
    survey_task_id: number;
    survey_id: number;
    description: string;
    data: string; // Данные в формате JSONB

    created_at: string; // Дата и время в ISO формате
}

export interface SurveyActiveEntity {
    survey_active_id: number;
    survey_id: number;
    user_id: number;
    operator_id: number;
    message_id: number | null;
    is_user_notified: boolean;
    is_reservation_end: boolean;
    reservation_end: string | null;
    tg_account: string | null;
    code_word: string | null;
    user_location: string | null;

    created_at: string; // Дата и время в ISO формате
}

export interface SurveyCompletionsEntity {
    completion_id: number;
    survey_id: number;
    survey_task_id: number;
    user_id: number;
    operator_id: number;
    result: string;
    result_positions_var: string;
    reward: number;

    created_at: string; // Дата и время в ISO формате
}

export interface WithdrawalLogsEntity {
    withdrawal_id: number;
    user_id: number;
    amount: number;
    wallet: string;

    withdrawn_at: string;
}

export type CommonVariablesLabelType = "ton_rub_price" ;
export interface CommonVariablesEntity {
    common_vars_id: number;
    label: CommonVariablesLabelType;
    value: string ;
    created_at: string; // Дата добавления
}

export type PendingPaymentsEntity = {
    user_id: number; // Идентификатор пользователя (связан с users)
    amount: number; // Сумма платежа
    attempts: number; // Количество попыток проведения платежа
    address: string; // Адрес для платежа

    created_at: string; // Дата создания записи
};

export type ReferralBonusesStatusType = "pending" | "completed" ;
export interface ReferralBonusesEntity {
    referred_user_id: number;
    referrer_id: number;
    amount:number;
    status: ReferralBonusesStatusType;

    created_at: string;
    completed_at: string;
}

export interface SessionsEntity {
    key: number;
    value: string;
}

export interface SessionOperatorEntity {
    key: number;
    value: string;
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
    sessions: SessionsEntity;
    sessions_operator: SessionOperatorEntity;
}
