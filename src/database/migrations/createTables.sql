-- Типы ENUM
CREATE TYPE survey_type_enum AS ENUM ('test_site');
CREATE TYPE referral_bonuses_status_enum AS ENUM ('pending', 'completed');

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
    survey_lock_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,  --Дата после которой можно проходить опрос
    last_init TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Последний раз его идентификация была в этот день и час

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

-- Таблица операторов
CREATE TABLE operators (
    operator_id BIGINT PRIMARY KEY,
    tg_account VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON TABLE operators TO admin_vadim;


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
    active_and_completed_count INT NOT NULL,        -- Столько раз его уже прошли
    task_price DECIMAL(10, 2) NOT NULL DEFAULT 0.0, -- Оплата за задание


    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (region_id) REFERENCES region_settings(region_id) ON DELETE SET NULL
);

GRANT ALL PRIVILEGES ON TABLE surveys TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE surveys_survey_id_seq TO admin_vadim;

-- Таблица заданий опросов
CREATE TABLE survey_tasks (
    task_id SERIAL PRIMARY KEY,
    survey_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (survey_id) REFERENCES surveys(survey_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE survey_tasks TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE survey_tasks_task_id_seq TO admin_vadim;

-- Таблица в которой зафиксировано, что сейчас опрос проходит ибо собирается проходить пользователь с оператором
CREATE TABLE survey_active (
    survey_active_id SERIAL PRIMARY KEY,
    survey_id INT NOT NULL,
    user_id BIGINT NOT NULL,
    operator_id BIGINT NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (operator_id) REFERENCES operators(operator_id) ON DELETE CASCADE,
    FOREIGN KEY (survey_id) REFERENCES surveys(survey_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE survey_active TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE survey_active_survey_active_id_seq TO admin_vadim;

-- Таблица в которой зафиксированы результаты прохождения опроса
CREATE TABLE survey_completions (
    completion_id SERIAL PRIMARY KEY,
    survey_id INT NOT NULL,
    user_id BIGINT NOT NULL,
    operator_id BIGINT NOT NULL,
    count_completed INT NOT NULL,
    reward DECIMAL(10, 2) NOT NULL, -- Фактическая награда (может отличаться от tasks.reward, если меняется со временем)

    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (operator_id) REFERENCES operators(operator_id) ON DELETE CASCADE,
    FOREIGN KEY (survey_id) REFERENCES surveys(survey_id) ON DELETE CASCADE

);
GRANT ALL PRIVILEGES ON TABLE survey_completions TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE survey_completions_completion_id_seq TO admin_vadim;


-- Таблица логов снятия средств
CREATE TABLE withdrawal_logs (
    withdrawal_id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,    -- Сумма снятия
    wallet  VARCHAR(100) NOT NULL,    -- На какой кошелек

    withdrawn_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE withdrawal_logs TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE withdrawal_logs_withdrawal_id_seq TO admin_vadim;

--Таблица в которой хранится список, который ожидает вывода
CREATE TABLE pending_payments (
    user_id BIGINT PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,               -- Сумма платежа
    attempts INT DEFAULT 3 NOT NULL,              -- Количество попыток проведения платежа
    address TEXT NOT NULL,                        -- Адрес для платежа

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
GRANT ALL PRIVILEGES ON TABLE pending_payments TO admin_vadim;

-- Таблица реферальных ссылок
CREATE TABLE referral_bonuses (
    referred_user_id BIGINT PRIMARY KEY, --(приглашенный)
    referrer_id BIGINT,  -- Кто получил бонус (пригласивший)
    amount DECIMAL(10, 2)  DEFAULT 0.0, -- Сумма бонуса
    status referral_bonuses_status_enum DEFAULT 'pending', -- когда меняется на completed, то зачисляется на баланс сумма

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,

    FOREIGN KEY (referrer_id) REFERENCES users(user_id) ON DELETE CASCADE
);
GRANT ALL PRIVILEGES ON TABLE referral_bonuses TO admin_vadim;


CREATE TABLE sessions (
    key VARCHAR(255) PRIMARY KEY,
    data JSONB NOT NULL
);
GRANT ALL PRIVILEGES ON TABLE sessions TO admin_vadim;
