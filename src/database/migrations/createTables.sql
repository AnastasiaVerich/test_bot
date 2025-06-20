-- Типы ENUM
CREATE TYPE survey_type_enum AS ENUM ('test_site');
CREATE TYPE referral_bonuses_status_enum AS ENUM ('pending', 'completed');
CREATE TYPE notify_reason_enum AS ENUM ('finish_survey');
CREATE TYPE common_variable_label AS ENUM ('ton_rub_price', 'auto_payments_enabled');

-- Таблица чёрного списка пользователей
CREATE TABLE blacklist_users (
    blacklist_id SERIAL PRIMARY KEY,
    account_id BIGINT,
    phone VARCHAR(15),
    reason TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(account_id),
    UNIQUE(phone)
);

GRANT ALL PRIVILEGES ON TABLE blacklist_users TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE blacklist_users_blacklist_id_seq TO admin_vadim;

-- Таблица пользователей
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY,
    phone VARCHAR(15) NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 0.0 NOT NULL,  --Баланс, который можно снять
    notify_reason notify_reason_enum DEFAULT NULL,
    survey_lock_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,  --Дата после которой можно проходить опрос
    last_init TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Последний раз его идентификация была в этот день и час
    skip_photo_verification BOOLEAN DEFAULT FALSE NOT NULL,  -- Пропуск фотоконтроля
    last_tg_account VARCHAR(255) DEFAULT NULL,
    last_user_location VARCHAR(255) DEFAULT NULL,


    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON TABLE users TO admin_vadim;

-- Таблица эмбеддингов лица
CREATE TABLE face_embeddings (
    face_embedding_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    embedding JSONB NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE face_embeddings TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE face_embeddings_face_embedding_id_seq TO admin_vadim;

-- Таблица фотографий
CREATE TABLE photos (
    photo_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    image BYTEA NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE photos TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE photos_photo_id_seq TO admin_vadim;

CREATE SEQUENCE operator_default_id_seq;



-- Таблица операторов
CREATE TABLE operators (
    id SERIAL PRIMARY KEY,
    operator_id BIGINT UNIQUE NOT NULL DEFAULT nextval('operator_default_id_seq'),
    balance DECIMAL(10, 2) DEFAULT 0.0 NOT NULL,  --Баланс, который можно снять
    tg_account VARCHAR(255) NOT NULL,
    phone VARCHAR(15) DEFAULT NULL,
    can_take_multiple_surveys BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT USAGE, SELECT, UPDATE ON SEQUENCE operator_default_id_seq TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE operators_id_seq TO admin_vadim;
GRANT ALL PRIVILEGES ON TABLE operators TO admin_vadim;





-- Таблица руководителей
CREATE SEQUENCE supervisor_default_id_seq;
CREATE TABLE supervisor (
    id SERIAL PRIMARY KEY,
    supervisor_id BIGINT UNIQUE NOT NULL DEFAULT nextval('supervisor_default_id_seq'),
    tg_account VARCHAR(255) NOT NULL,
    phone VARCHAR(15) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT USAGE, SELECT, UPDATE ON SEQUENCE supervisor_default_id_seq TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE supervisor_id_seq TO admin_vadim;
GRANT ALL PRIVILEGES ON TABLE supervisor TO admin_vadim;

CREATE TABLE advertising_campaigns (
    id SERIAL PRIMARY KEY,  -- Уникальный идентификатор бонусной программы
    name VARCHAR(255) NOT NULL,  -- Название бонусной программы
    referral_link VARCHAR(2048) NOT NULL UNIQUE,  -- Реферальная ссылка, уникальная
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP  -- Дата создания записи
);
GRANT USAGE, SELECT, UPDATE ON SEQUENCE advertising_campaigns_id_seq TO admin_vadim;
GRANT ALL PRIVILEGES ON TABLE advertising_campaigns TO admin_vadim;

CREATE TABLE bot_user_logs (
    id BIGSERIAL PRIMARY KEY,  -- Уникальный идентификатор записи лога
    user_id BIGINT NOT NULL,  -- ID пользователя
    step VARCHAR(50) DEFAULT NULL,
    event_type VARCHAR(50) NOT NULL,  -- Тип события (например, START, REGISTRATION_STEP, REGISTRATION_STOP)
    event_data JSONB DEFAULT '{}',  -- Дополнительные данные события (например, шаг регистрации, введенные данные)
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP  -- Время события
);
GRANT ALL PRIVILEGES ON TABLE bot_user_logs TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE bot_user_logs_id_seq TO admin_vadim;



-- Таблица настроек регионов
CREATE TABLE region_settings (
    region_id SERIAL PRIMARY KEY,
    region_name VARCHAR(255) NOT NULL,
    reservation_time_min INT NOT NULL,      -- Время резервации задания для региона
    survey_interval INTERVAL NOT NULL DEFAULT '7 day',      -- Время резервации задания для региона
    polygon JSONB NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON TABLE region_settings TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE region_settings_region_id_seq TO admin_vadim;

-- Таблица связи операторов с регионами
CREATE TABLE operators_regions (
    operator_region_id SERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL,
    region_id INT NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (operator_id) REFERENCES operators(operator_id) ON DELETE CASCADE,
    FOREIGN KEY (region_id) REFERENCES region_settings(region_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE operators_regions TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE operators_regions_operator_region_id_seq TO admin_vadim;




-- Таблица опросов
CREATE TABLE surveys (
    survey_id SERIAL PRIMARY KEY,
    region_id INT NOT NULL, -- Регион опроса
    survey_type survey_type_enum NOT NULL,           -- Тип опроса
    topic VARCHAR(255) NOT NULL,            -- Тематика/название опроса
    description VARCHAR(255),               -- Описание
    completion_limit INT NOT NULL,        -- Столько раз его можно пройти
    active_and_completed_count INT NOT NULL DEFAULT 0,        -- Столько раз его уже прошли
    task_price DECIMAL(10, 2) NOT NULL DEFAULT 50, -- Оплата за задание


    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (region_id) REFERENCES region_settings(region_id) ON DELETE SET NULL
);

GRANT ALL PRIVILEGES ON TABLE surveys TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE surveys_survey_id_seq TO admin_vadim;

-- Таблица заданий опросов
-- Создание таблицы survey_tasks
CREATE TABLE survey_tasks (
    survey_task_id SERIAL PRIMARY KEY, -- Идентификатор записи об опросе
    survey_id INT NOT NULL,                  -- Идентификатор опроса
    description VARCHAR(255) NOT NULL,       -- Описание задания
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Время создания

    FOREIGN KEY (survey_id) REFERENCES surveys(survey_id) ON DELETE CASCADE -- Внешний ключ на таблицу surveys
);

GRANT ALL PRIVILEGES ON TABLE survey_tasks TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE survey_tasks_survey_task_id_seq TO admin_vadim;

-- Таблица в которой зафиксировано, что сейчас опрос проходит ибо собирается проходить пользователь с оператором
CREATE TABLE survey_active (
    survey_active_id SERIAL PRIMARY KEY,
    survey_id INT NOT NULL,
    user_id BIGINT NOT NULL,
    operator_id BIGINT,
    message_id BIGINT,
    is_user_notified BOOLEAN NOT NULL DEFAULT FALSE,
    is_reservation_end BOOLEAN NOT NULL DEFAULT FALSE,
    reservation_end TIMESTAMP WITH TIME ZONE,
    code_word VARCHAR(255),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (operator_id) REFERENCES operators(operator_id) ON DELETE SET NULL,
    FOREIGN KEY (survey_id) REFERENCES surveys(survey_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE survey_active TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE survey_active_survey_active_id_seq TO admin_vadim;

-- Таблица в которой зафиксированы результаты прохождения опроса
CREATE TABLE survey_completions (
    completion_id SERIAL PRIMARY KEY,
    survey_id INT NOT NULL,
    survey_task_id INT NOT NULL,
    user_id BIGINT NOT NULL,
    operator_id BIGINT NOT NULL,
    result VARCHAR(255) NOT NULL,
    result_positions_var VARCHAR(255) NOT NULL,
    reward DECIMAL(10, 2) NOT NULL, -- Фактическая награда (может отличаться от tasks.reward, если меняется со временем)
    reward_operator DECIMAL(10, 2) NOT NULL,

    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (operator_id) REFERENCES operators(operator_id) ON DELETE SET NULL,
    FOREIGN KEY (survey_task_id) REFERENCES survey_tasks(survey_task_id) ON DELETE SET NULL

);
GRANT ALL PRIVILEGES ON TABLE survey_completions TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE survey_completions_completion_id_seq TO admin_vadim;


-- Таблица логов снятия средств
CREATE TABLE withdrawal_logs (
    withdrawal_id SERIAL PRIMARY KEY,
    user_id BIGINT DEFAULT NULL,
    operator_id BIGINT DEFAULT NULL,
    amount DECIMAL(10, 2) NOT NULL,    -- Сумма снятия
    wallet  VARCHAR(100) NOT NULL,    -- На какой кошелек

    withdrawn_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
    FOREIGN KEY (operator_id) REFERENCES operators(operator_id) ON DELETE SET NULL

);

GRANT ALL PRIVILEGES ON TABLE withdrawal_logs TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE withdrawal_logs_withdrawal_id_seq TO admin_vadim;


CREATE TABLE common_variables(
    common_vars_id SERIAL PRIMARY KEY,
    label common_variable_label UNIQUE,
    value VARCHAR(100) NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    update_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON TABLE common_variables TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE common_variables_common_vars_id_seq TO admin_vadim;

--Таблица в которой хранится список, который ожидает вывода
CREATE TABLE pending_payments (
    pending_payments_id SERIAL PRIMARY KEY,
    user_id BIGINT DEFAULT NULL,
    operator_id BIGINT DEFAULT NULL,
    amount DECIMAL(10, 2) NOT NULL,               -- Сумма платежа
    attempts INT DEFAULT 0 NOT NULL,              -- Количество попыток проведения платежа
    address TEXT NOT NULL,                        -- Адрес для платежа

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (operator_id) REFERENCES operators(operator_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE pending_payments TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE pending_payments_pending_payments_id_seq TO admin_vadim;

-- Таблица реферальных ссылок
CREATE TABLE referral_bonuses (
    referred_user_id BIGINT PRIMARY KEY, --(приглашенный)
    referrer_id BIGINT,  -- Кто получил бонус (пригласивший)
    amount DECIMAL(10, 2)  DEFAULT 0.0, -- Сумма бонуса
    status referral_bonuses_status_enum DEFAULT 'pending', -- когда меняется на completed, то зачисляется на баланс сумма

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    FOREIGN KEY (referrer_id) REFERENCES users(user_id) ON DELETE CASCADE
);
GRANT ALL PRIVILEGES ON TABLE referral_bonuses TO admin_vadim;


CREATE TABLE videos (
    video_id BIGSERIAL PRIMARY KEY,
    file_id VARCHAR(255) NOT NULL, -- Telegram file_id для отправки видео обратно
    video_data BYTEA, -- Видеофайл в бинарном формате
    file_name VARCHAR(255), -- Имя файла (опционально)
    mime_type VARCHAR(100), -- Тип файла (например, video/mp4)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
);

GRANT ALL PRIVILEGES ON TABLE videos TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE videos_video_id_seq TO admin_vadim;





-- Функция для отправки в канал операторов нового опроса
CREATE OR REPLACE FUNCTION notify_survey_active() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.operator_id IS NULL AND NEW.message_id IS NULL THEN
    PERFORM pg_notify('survey_active_insert', row_to_json(NEW)::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер на таблицу survey_active
CREATE TRIGGER survey_active_trigger
AFTER INSERT ON survey_active
FOR EACH ROW
EXECUTE FUNCTION notify_survey_active();



-- Функция для отправки NOTIFY при появлении operator_id и отсутствии is_user_notified
CREATE OR REPLACE FUNCTION notify_operator_assigned() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.operator_id IS NOT NULL AND NEW.is_user_notified IS FALSE THEN
    PERFORM pg_notify('operator_assigned', row_to_json(NEW)::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер на таблицу survey_active
CREATE OR REPLACE TRIGGER operator_assigned_trigger
AFTER UPDATE OF operator_id ON survey_active
FOR EACH ROW
WHEN (NEW.operator_id IS NOT NULL AND NEW.is_user_notified IS FALSE)
EXECUTE FUNCTION notify_operator_assigned();




-- Функция для отправки NOTIFY при установке is_reservation_end в TRUE
CREATE OR REPLACE FUNCTION notify_reservation_ended()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_reservation_end IS TRUE THEN
        PERFORM pg_notify('reservation_ended', row_to_json(NEW)::text);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер на таблицу survey_active
CREATE OR REPLACE TRIGGER reservation_ended_trigger
AFTER UPDATE OF is_reservation_end ON survey_active
FOR EACH ROW
WHEN (NEW.is_reservation_end IS TRUE)
EXECUTE FUNCTION notify_reservation_ended();


-- Создаем функцию-триггер для уведомления о изменении notify_reason на 'finish_survey'
CREATE OR REPLACE FUNCTION notify_finish_survey()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.notify_reason = 'finish_survey' AND (OLD.notify_reason IS DISTINCT FROM NEW.notify_reason) THEN
        PERFORM pg_notify('finish_survey_notification', row_to_json(NEW)::text);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер на таблицу users
CREATE OR REPLACE TRIGGER finish_survey_trigger
AFTER UPDATE OF notify_reason ON users
FOR EACH ROW
WHEN (NEW.notify_reason = 'finish_survey' AND OLD.notify_reason IS DISTINCT FROM NEW.notify_reason)
EXECUTE FUNCTION notify_finish_survey();
