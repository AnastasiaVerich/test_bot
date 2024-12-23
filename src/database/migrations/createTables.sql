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
    allowed_survey_after TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    status user_status_enum DEFAULT 'free' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_init_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON TABLE users TO myuser;

-- Таблица эмбеддингов лица
CREATE TABLE face_embeddings (
    face_embedding_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    embedding JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE face_embeddings TO myuser;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE face_embeddings_face_embedding_id_seq TO myuser;

-- Таблица фотографий
CREATE TABLE photos (
    photo_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    image BYTEA NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE photos TO myuser;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE photos_photo_id_seq TO myuser;

-- Таблица реферальных ссылок
CREATE TABLE referral_bot_starts (
    tg_user_id BIGINT PRIMARY KEY,
    referral_creator_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referral_creator_id) REFERENCES users(user_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE referral_bot_starts TO myuser;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE referral_bot_starts_referral_bot_start_id_seq TO myuser;

-- Таблица операторов
CREATE TABLE operators (
    operator_id BIGINT PRIMARY KEY,
    tg_account VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    status operator_status_enum DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON TABLE operators TO myuser;

-- Таблица настроек регионов
CREATE TABLE region_settings (
    region_id SERIAL PRIMARY KEY,
    region_name VARCHAR(255) NOT NULL,
    reservation_time_min INT NOT NULL,
    query_frequency_days INT NOT NULL,
    query_similar_topic_days INT NOT NULL,
    polygon JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON TABLE region_settings TO myuser;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE region_settings_region_id_seq TO myuser;

-- Таблица связи операторов с регионами
CREATE TABLE operator_regions (
    operator_region_id SERIAL PRIMARY KEY,
    operator_id BIGINT NOT NULL,
    region_id INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (operator_id) REFERENCES operators(operator_id) ON DELETE CASCADE,
    FOREIGN KEY (region_id) REFERENCES region_settings(region_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE operator_regions TO myuser;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE operator_regions_operator_region_id_seq TO myuser;

-- Таблица опросов
CREATE TABLE surveys (
    survey_id SERIAL PRIMARY KEY,
    region_id INT NOT NULL,
    survey_type survey_type_enum NOT NULL,
    topic VARCHAR(255) NOT NULL,
    status survey_status_enum NOT NULL DEFAULT 'available',
    reserved_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES region_settings(region_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE surveys TO myuser;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE surveys_survey_id_seq TO myuser;

-- Таблица заданий опросов
CREATE TABLE survey_tasks (
    task_id SERIAL PRIMARY KEY,
    survey_id INT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    task_type survey_task_type_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys(survey_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE survey_tasks TO myuser;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE survey_tasks_task_id_seq TO myuser;

-- Таблица выполнения заданий пользователями
CREATE TABLE user_survey_tasks (
    progress_id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    survey_id INT NOT NULL,
    task_id INT,
    progress_percentage DECIMAL(5, 2) DEFAULT 0.0 NOT NULL,
    status task_status_enum DEFAULT 'in_progress',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (survey_id) REFERENCES surveys(survey_id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES survey_tasks(task_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE user_survey_tasks TO myuser;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE user_survey_tasks_progress_id_seq TO myuser;

-- Таблица баланса пользователей
CREATE TABLE user_balance (
    user_balance_id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 0.0 NOT NULL,
    total_earned DECIMAL(10, 2) DEFAULT 0.0 NOT NULL,
    total_withdrawn DECIMAL(10, 2) DEFAULT 0.0 NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE user_balance TO myuser;

-- Таблица логов снятия средств
CREATE TABLE withdrawal_logs (
    withdrawal_id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    withdrawn_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE withdrawal_logs TO myuser;

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

GRANT ALL PRIVILEGES ON TABLE blacklist_users TO myuser;
