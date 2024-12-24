export interface User {
    user_id: string;              // Уникальный идентификатор пользователя
    phone: string;                // Номер телефона (может быть null)
    last_task_date: string;
    last_init_date: string;
    status: user_status_enum;     // Статус пользователя
    created_at: string;             // Дата регистрации
    updated_at: string;             // Последнее обновление информации пользователя
}

export interface FaceEmbedding {
    face_embedding_id: number;    // Уникальный идентификатор эмбеддинга
    user_id: string;              // ID пользователя
    embedding: string;            // Эмбеддинги в формате JSON
    created_at: Date;             // Дата создания записи
}

export interface Photo {
    photo_id: number;            // Уникальный идентификатор фото
    user_id: string;             // ID пользователя
    image: Buffer;               // Фото в формате BYTEA (можно использовать Buffer для хранения двоичных данных)
}

export interface ReferralBotStart {
    referral_bot_start_id: number;         // Уникальный идентификатор реферальной ссылки
    tg_user_id: string;    // ID приглашенного пользователя
    referral_creator_id: string;         // ID реферера
    created_at: string;          // Дата использования реферальной ссылки
}

export interface Operator {
    operator_id: string;         // Уникальный идентификатор оператора
    phone: string;         // Уникальный идентификатор оператора
    tg_account: string;        // ID оператора
    created_at: string;          // Дата добавления оператора
    status: operator_status_enum;               // Статус пользователя
}

export interface RegionSettings {
    region_id: number;           // Уникальный идентификатор региона
    region_name: string;         // Название региона
    reservation_time_min : number;    // Время резервации задания для региона (можно хранить как строку, или перевести в минуты/дни)
    query_frequency_days: number;     // Частота прохождения запроса для региона (можно хранить как строку, или перевести в минуты/дни)
    query_similar_topic_days: number;  // Количество дней для похожей тематики
    polygon: object;             // Полигон в формате JSON
    created_at: string;          // Время создания записи
    updated_at: string;          // Время последнего обновления
}

export interface OperatorRegion {
    operator_region_id: number; // Уникальный идентификатор связи
    operator_id: string;        // ID оператора
    region_id: number;          // ID региона
    created_at: string;         // Время создания записи
}

export interface Survey {
    survey_id: number; // Уникальный идентификатор опроса
    region_id: number; // Регион, связанный с опросом
    survey_type: survey_type_enum; // Тип опроса
    topic: string; // Тематика опроса
    status: survey_status_enum; // Статус задания (забронировано или свободно)
    created_at: string; // Дата и время создания опроса (ISO строка)
    reserved_until: string; // Дата и время до какого зарегестр опрос
    updated_at: string; // Последнее обновление записи (ISO строка)
}

export interface SurveyTask {
    task_id: number;            // Уникальный идентификатор задания
    survey_id: number;          // Идентификатор опроса
    description: string;        // Описание задания
    price: number;              // Оплата за задание
    task_type: survey_task_type_enum;// Тип задания (например, "видео", "фото")
    created_at: string;         // Время создания задания (формат TIMESTAMP)
}

export interface UserSurveyTask {
    survey_task_user_id: number;              // Уникальный идентификатор записи
    user_id: string;                   // Идентификатор пользователя
    survey_id: number;                 // Идентификатор опроса
    task_id?: number | null;           // Идентификатор задания (если применимо)
    progress_percentage: number;      // Прогресс выполнения задания в процентах
    status: task_status_enum;         // Статус задания
    started_at: string;               // Время начала выполнения (формат TIMESTAMP)
    completed_at?: string | null;     // Время завершения выполнения (формат TIMESTAMP)
}

export interface UserBalance {
    user_id: string;          // Идентификатор пользователя
    balance: number;          // Баланс пользователя
    total_earned: number;     // Общая сумма заработка
    total_withdrawn: number;  // Общая сумма снятых средств
}

export interface WithdrawalLog {
    withdrawal_id: number;      // Уникальный идентификатор записи
    user_id: string;            // Идентификатор пользователя
    amount: number;             // Сумма снятия
    withdrawn_at: string;       // Время операции (формат TIMESTAMP)
}

export interface BlacklistUser {
    blacklist_id: number;         // Уникальный идентификатор записи
    account_id?: string | null;   // ID аккаунта пользователя (UUID), может быть null
    phone?: string | null; // Номер телефона пользователя, может быть null
    reason?: string | null;       // Причина блокировки, может быть null
    added_at: string;             // Дата добавления в блок-лист (ISO-строка)
}

export interface UpdateBalance {
    user_id: string;
    balance: number;
    total_earned: number;
    total_withdrawn: number;
}

export interface Withdrawal {
    user_id: string;
    amount: number;
}





export type user_status_enum ='free'| 'busy'
export type operator_status_enum ='free'| 'busy'
export type survey_task_type_enum  ='live'| 'photo'| 'video'
export type survey_type_enum  ='animals'| 'city'
export type survey_status_enum  ='reserved' | 'available' | 'in_progress'; // Статус задания
export type task_status_enum   ='in_progress'| 'finish'

// user_id    operator_id    tg_user_id   user_balance_id- строки. Остальный айдишники - числа
