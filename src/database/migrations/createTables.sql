-- Типы ENUM
CREATE TYPE user_status_enum AS ENUM ('free', 'busy');
CREATE TYPE operator_status_enum AS ENUM ('free', 'busy');
CREATE TYPE survey_type_enum AS ENUM ('animals', 'city');
CREATE TYPE survey_status_enum AS ENUM ('reserved', 'available', 'in_progress');
CREATE TYPE survey_task_type_enum AS ENUM ('live', 'photo', 'video');
CREATE TYPE task_status_enum AS ENUM ('in_progress', 'finish');

-- Таблица пользователей
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY,
    phone VARCHAR(15) NOT NULL,
    survey_lock_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,  --Дата после которой можно проходить опрос
    status user_status_enum DEFAULT 'free' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE photos TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE photos_photo_id_seq TO admin_vadim;

-- Таблица реферальных ссылок
CREATE TABLE referral_bot_starts (
    tg_user_id BIGINT PRIMARY KEY,
    referral_creator_id BIGINT,    -- Реферер, который пригласил пользователя
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referral_creator_id) REFERENCES users(user_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE referral_bot_starts TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE referral_bot_starts_referral_bot_start_id_seq TO admin_vadim;

-- Таблица операторов
CREATE TABLE operators (
    operator_id BIGINT PRIMARY KEY,
    tg_account VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    status operator_status_enum DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON TABLE operators TO admin_vadim;

-- Таблица настроек регионов
CREATE TABLE region_settings (
    region_id SERIAL PRIMARY KEY,
    region_name VARCHAR(255) NOT NULL,
    reservation_time_min INT NOT NULL,      -- Время резервации задания для региона
    query_frequency_days INT NOT NULL,        -- Частота прохождения запроса для региона
    query_similar_topic_days INT NOT NULL,          -- Количество дней для похожей тематики по региону
    polygon JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON TABLE region_settings TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE region_settings_region_id_seq TO admin_vadim;

-- Таблица связи операторов с регионами
CREATE TABLE operators_regions (
    operator_region_id SERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL,
    region_id INT NOT NULL,
    FOREIGN KEY (operator_id) REFERENCES operators(operator_id) ON DELETE CASCADE,
    FOREIGN KEY (region_id) REFERENCES region_settings(region_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE operators_regions TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE operators_regions_operator_region_id_seq TO admin_vadim;

-- Таблица опросов
CREATE TABLE surveys (
    survey_id SERIAL PRIMARY KEY,
    region_id INT NOT NULL,
    survey_type survey_type_enum NOT NULL,           -- Тип опроса
    topic VARCHAR(255) NOT NULL,        -- Тематика/название опроса
    status survey_status_enum NOT NULL DEFAULT 'available',
    reserved_by_user_id BIGINT DEFAULT NULL,           -- если опрос  занят, то этим юзером
    reserved_by_operator_id BIGINT DEFAULT NULL,           -- если опрос занят, то этим оператором
    reserved_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,           -- до какого времени задание может находится в резервации
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES region_settings(region_id) ON DELETE CASCADE
    FOREIGN KEY (reserved_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
    FOREIGN KEY (reserved_by_operator_id) REFERENCES operators(operator_id) ON DELETE SET NULL
);

GRANT ALL PRIVILEGES ON TABLE surveys TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE surveys_survey_id_seq TO admin_vadim;

-- Таблица заданий опросов
CREATE TABLE survey_tasks (
    task_id SERIAL PRIMARY KEY,
    survey_id INT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.0, -- Оплата за задание
    task_type survey_task_type_enum NOT NULL,            -- Тип задания (например, "видео", "фото")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys(survey_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE survey_tasks TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE survey_tasks_task_id_seq TO admin_vadim;

-- Таблица выполнения заданий пользователями
CREATE TABLE survey_task_user (
    survey_task_user_id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    survey_id INT NOT NULL,
    task_id INT,
    progress_percentage DECIMAL(5, 2) DEFAULT 0.0 NOT NULL,              -- Прогресс выполнения задания в процентах
    status task_status_enum DEFAULT 'in_progress',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,       -- Время начала выполнения
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,     -- Время завершения выполнения
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (survey_id) REFERENCES surveys(survey_id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES survey_tasks(task_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE survey_task_user TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE survey_task_user_survey_task_user_id_seq TO admin_vadim;

-- Таблица баланса пользователей
CREATE TABLE user_balance (
    user_id BIGINT PRIMARY KEY,
    balance DECIMAL(10, 2) DEFAULT 0.0 NOT NULL,
    total_earned DECIMAL(10, 2) DEFAULT 0.0 NOT NULL, -- Баланс пользователя
    total_withdrawn DECIMAL(10, 2) DEFAULT 0.0 NOT NULL,-- Общая сумма снятых средств
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE user_balance TO admin_vadim;

-- Таблица логов снятия средств
CREATE TABLE withdrawal_logs (
    withdrawal_id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,    -- Сумма снятия
    wallet  VARCHAR(100) NOT NULL,    -- На какой кошелек
    withdrawn_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,   -- Время операции
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE withdrawal_logs TO admin_vadim;

-- Таблица чёрного списка пользователей
CREATE TABLE blacklist_users (
    blacklist_id SERIAL PRIMARY KEY,
    account_id BIGINT,
    phone VARCHAR(15),
    reason TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(account_id),
    UNIQUE(phone)
);

GRANT ALL PRIVILEGES ON TABLE blacklist_users TO admin_vadim;
