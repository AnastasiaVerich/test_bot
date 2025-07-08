-- Создание ENUM типов
CREATE TYPE survey_type_enum AS ENUM ('test_site');
CREATE TYPE referral_bonuses_status_enum AS ENUM ('pending', 'completed');
CREATE TYPE notify_reason_enum AS ENUM ('finish_survey');
CREATE TYPE common_variable_label AS ENUM ('ton_rub_price', 'auto_payments_enabled');

-- Создание последовательностей, которые используются в таблицах
CREATE SEQUENCE operator_default_id_seq;
CREATE SEQUENCE supervisor_default_id_seq;
CREATE SEQUENCE auditor_default_id_seq;

-- Таблица пользователей (не имеет внешних ключей, должна быть первой)
CREATE TABLE users (
                       user_id BIGINT PRIMARY KEY,
                       phone VARCHAR(15) NOT NULL,
                       balance DECIMAL(10, 2) DEFAULT 0.0 NOT NULL,
                       notify_reason notify_reason_enum DEFAULT NULL,
                       survey_lock_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
                       last_init TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                       skip_photo_verification BOOLEAN DEFAULT FALSE NOT NULL,
                       last_tg_account VARCHAR(255) DEFAULT NULL,
                       last_user_location VARCHAR(255) DEFAULT NULL,
                       is_supervisor_check BOOLEAN NOT NULL DEFAULT FALSE,
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON TABLE users TO admin_vadim;

-- Таблица чёрного списка пользователей (зависит от users из-за account_id)
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

-- Таблица операторов (зависит от operator_default_id_seq)
CREATE TABLE operators (
                           id SERIAL PRIMARY KEY,
                           operator_id BIGINT UNIQUE NOT NULL DEFAULT nextval('operator_default_id_seq'),
                           balance DECIMAL(10, 2) DEFAULT 0.0 NOT NULL,
                           tg_account VARCHAR(255) NOT NULL,
                           phone VARCHAR(15) DEFAULT NULL,
                           can_take_multiple_surveys BOOLEAN NOT NULL DEFAULT FALSE,
                           created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT USAGE, SELECT, UPDATE ON SEQUENCE operator_default_id_seq TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE operators_id_seq TO admin_vadim;
GRANT ALL PRIVILEGES ON TABLE operators TO admin_vadim;

-- Таблица руководителей (зависит от supervisor_default_id_seq)
CREATE TABLE supervisor (
                            id SERIAL PRIMARY KEY,
                            supervisor_id BIGINT UNIQUE NOT NULL DEFAULT nextval('supervisor_default_id_seq'),
                            tg_account VARCHAR(255) NOT NULL,
                            phone VARCHAR(15) DEFAULT NULL,
                            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT USAGE, SELECT, UPDATE ON SEQUENCE supervisor_default_id_seq TO admin_vadim;
GRANT ALL PRIVILEGES ON TABLE supervisor TO admin_vadim;

-- Таблица аудиторов (зависит от auditor_default_id_seq)
CREATE TABLE auditors (
                          id SERIAL PRIMARY KEY,
                          auditor_id BIGINT UNIQUE NOT NULL DEFAULT nextval('auditor_default_id_seq'),
                          tg_account VARCHAR(255) NOT NULL,
                          phone VARCHAR(15) DEFAULT NULL,
                          balance DECIMAL(10, 2) DEFAULT 0.0 NOT NULL,
                          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT USAGE, SELECT, UPDATE ON SEQUENCE auditors_id_seq TO admin_vadim;
GRANT ALL PRIVILEGES ON TABLE auditors TO admin_vadim;

-- Таблица настроек регионов (не имеет внешних ключей)
CREATE TABLE region_settings (
                                 region_id SERIAL PRIMARY KEY,
                                 region_name VARCHAR(255) NOT NULL,
                                 reservation_time_min INT NOT NULL,
                                 survey_interval INTERVAL NOT NULL DEFAULT '7 day',
                                 polygon JSONB NOT NULL,
                                 created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON TABLE region_settings TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE region_settings_region_id_seq TO admin_vadim;

-- Таблица опросов (зависит от region_settings)
CREATE TABLE surveys (
                         survey_id SERIAL PRIMARY KEY,
                         region_id INT NOT NULL,
                         survey_type survey_type_enum NOT NULL,
                         topic VARCHAR(255) NOT NULL,
                         description VARCHAR(255),
                         completion_limit INT NOT NULL,
                         active_and_completed_count INT NOT NULL DEFAULT 0,
                         task_price DECIMAL(10, 2) NOT NULL DEFAULT 50,
                         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                         FOREIGN KEY (region_id) REFERENCES region_settings(region_id) ON DELETE SET NULL
);

GRANT ALL PRIVILEGES ON TABLE surveys TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE surveys_survey_id_seq TO admin_vadim;

-- Таблица заданий опросов (зависит от surveys)
CREATE TABLE survey_tasks (
                              survey_task_id SERIAL PRIMARY KEY,
                              survey_id INT NOT NULL,
                              description VARCHAR(255) NOT NULL,
                              data JSONB NOT NULL,
                              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                              FOREIGN KEY (survey_id) REFERENCES surveys(survey_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE survey_tasks TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE survey_tasks_survey_task_id_seq TO admin_vadim;

-- Таблица видео (не имеет внешних ключей, но нужна для survey_task_completions)
CREATE TABLE videos (
                        video_id BIGSERIAL PRIMARY KEY,
                        file_id_operator VARCHAR(255),
                        file_id_auditor VARCHAR(255),
                        file_id_supervisor VARCHAR(255),
                        video_data BYTEA,
                        file_name VARCHAR(255),
                        mime_type VARCHAR(100),
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON TABLE videos TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE videos_video_id_seq TO admin_vadim;

-- Таблица эмбеддингов лица (зависит от users)
CREATE TABLE face_embeddings (
                                 face_embedding_id BIGSERIAL PRIMARY KEY,
                                 user_id BIGINT,
                                 embedding JSONB NOT NULL,
                                 created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                 FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE face_embeddings TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE face_embeddings_face_embedding_id_seq TO admin_vadim;

-- Таблица фотографий (зависит от users)
CREATE TABLE photos (
                        photo_id BIGSERIAL PRIMARY KEY,
                        user_id BIGINT,
                        file_id_operator VARCHAR(255),
                        file_id_auditor VARCHAR(255),
                        file_id_supervisor VARCHAR(255),
                        is_send BOOLEAN NOT NULL DEFAULT FALSE,
                        image BYTEA,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON TABLE photos TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE photos_photo_id_seq TO admin_vadim;

-- Таблица связи операторов с регионами (зависит от operators и region_settings)
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

-- Таблица активных опросов (зависит от users, operators, surveys)
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

-- Таблица результатов опросов (зависит от users, operators, survey_tasks, videos)
CREATE TABLE survey_task_completions (
                                         completion_id SERIAL PRIMARY KEY,
                                         survey_id INT NOT NULL,
                                         survey_task_id INT NOT NULL,
                                         user_id BIGINT NOT NULL,
                                         operator_id BIGINT NOT NULL,
                                         result VARCHAR(255) NOT NULL,
                                         result_positions_var VARCHAR(255) NOT NULL,
                                         reward_user DECIMAL(10, 2) NOT NULL,
                                         reward_operator DECIMAL(10, 2) NOT NULL,
                                         video_id BIGINT,
                                         is_valid BOOLEAN DEFAULT FALSE NOT NULL,
                                         completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                         FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
                                         FOREIGN KEY (operator_id) REFERENCES operators(operator_id) ON DELETE SET NULL,
                                         FOREIGN KEY (survey_task_id) REFERENCES survey_tasks(survey_task_id) ON DELETE SET NULL,
                                         FOREIGN KEY (video_id) REFERENCES videos(video_id) ON DELETE SET NULL
);

GRANT ALL PRIVILEGES ON TABLE survey_task_completions TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE survey_task_completions_completion_id_seq TO admin_vadim;

-- Таблица перепроверки опросов (зависит от users, operators, surveys, videos)
CREATE TABLE recheck_survey (
                                recheck_survey_id SERIAL PRIMARY KEY,
                                task_completions_ids INTEGER[] NOT NULL DEFAULT '{}',
                                audit_task_ids INTEGER[] NOT NULL DEFAULT '{}',
                                survey_id INT NOT NULL,
                                is_operator_notified BOOLEAN NOT NULL DEFAULT FALSE,
                                user_id BIGINT,
                                operator_id BIGINT,
                                video_id BIGINT,
                                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
                                FOREIGN KEY (operator_id) REFERENCES operators(operator_id) ON DELETE SET NULL,
                                FOREIGN KEY (survey_id) REFERENCES surveys(survey_id) ON DELETE CASCADE,
                                FOREIGN KEY (video_id) REFERENCES videos(video_id) ON DELETE SET NULL
);

GRANT ALL PRIVILEGES ON TABLE recheck_survey TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE recheck_survey_recheck_survey_id_seq TO admin_vadim;

-- Таблица активных аудитов (зависит от users, operators, auditors, surveys, videos)
CREATE TABLE audit_survey_active (
                                     audit_survey_active_id SERIAL PRIMARY KEY,
                                     task_completions_ids INTEGER[] NOT NULL DEFAULT '{}',
                                     survey_id INT NOT NULL,
                                     auditor_id BIGINT,
                                     user_id BIGINT,
                                     operator_id BIGINT,
                                     video_id BIGINT,
                                     message_id BIGINT,
                                     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                     FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
                                     FOREIGN KEY (operator_id) REFERENCES operators(operator_id) ON DELETE SET NULL,
                                     FOREIGN KEY (auditor_id) REFERENCES auditors(auditor_id) ON DELETE SET NULL,
                                     FOREIGN KEY (survey_id) REFERENCES surveys(survey_id) ON DELETE CASCADE,
                                     FOREIGN KEY (video_id) REFERENCES videos(video_id) ON DELETE SET NULL
);

GRANT ALL PRIVILEGES ON TABLE audit_survey_active TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE audit_survey_active_audit_survey_active_id_seq TO admin_vadim;

-- Таблица результатов аудита (зависит от survey_task_completions, survey_tasks, auditors)
CREATE TABLE audit_survey_task_completions (
                                               id SERIAL PRIMARY KEY,
                                               completion_id INT,
                                               survey_id BIGINT NOT NULL,
                                               survey_task_id INT NOT NULL,
                                               auditor_id BIGINT NOT NULL,
                                               reward_auditor DECIMAL(10, 2) NOT NULL,
                                               result VARCHAR(255),
                                               result_positions_var VARCHAR(255),
                                               description VARCHAR(255),
                                               created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                               FOREIGN KEY (completion_id) REFERENCES survey_task_completions(completion_id) ON DELETE CASCADE,
                                               FOREIGN KEY (survey_task_id) REFERENCES survey_tasks(survey_task_id) ON DELETE SET NULL,
                                               FOREIGN KEY (auditor_id) REFERENCES auditors(auditor_id) ON DELETE SET NULL
);

GRANT ALL PRIVILEGES ON TABLE audit_survey_task_completions TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE audit_survey_task_completions_id_seq TO admin_vadim;

-- Таблица логов снятия средств (зависит от users, operators, auditors)
CREATE TABLE withdrawal_logs (
                                 withdrawal_id SERIAL PRIMARY KEY,
                                 user_id BIGINT DEFAULT NULL,
                                 operator_id BIGINT DEFAULT NULL,
                                 auditor_id BIGINT DEFAULT NULL,
                                 amount DECIMAL(10, 2) NOT NULL,
                                 wallet VARCHAR(100) NOT NULL,
                                 amount_rub DECIMAL(10, 2) DEFAULT NULL,
                                 withdrawn_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                 FOREIGN KEY (auditor_id) REFERENCES auditors(auditor_id) ON DELETE CASCADE,
                                 FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
                                 FOREIGN KEY (operator_id) REFERENCES operators(operator_id) ON DELETE SET NULL
);

GRANT ALL PRIVILEGES ON TABLE withdrawal_logs TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE withdrawal_logs_withdrawal_id_seq TO admin_vadim;

-- Таблица ожидающих платежей (зависит от users, auditors, operators)
CREATE TABLE pending_payments (
                                  pending_payments_id SERIAL PRIMARY KEY,
                                  user_id BIGINT DEFAULT NULL,
                                  auditor_id BIGINT DEFAULT NULL,
                                  operator_id BIGINT DEFAULT NULL,
                                  amount DECIMAL(10, 2) NOT NULL,
                                  attempts INT DEFAULT 0 NOT NULL,
                                  wallet TEXT NOT NULL,
                                  amount_rub DECIMAL(10, 2) DEFAULT NULL,
                                  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                  FOREIGN KEY (auditor_id) REFERENCES auditors(auditor_id) ON DELETE CASCADE,
                                  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                                  FOREIGN KEY (operator_id) REFERENCES operators(operator_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE pending_payments TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE pending_payments_pending_payments_id_seq TO admin_vadim;

-- Таблица реферальных бонусов (зависит от users)
CREATE TABLE referral_bonuses (
                                  referred_user_id BIGINT PRIMARY KEY,
                                  referrer_id BIGINT NOT NULL,
                                  amount DECIMAL(10, 2) DEFAULT 0.0,
                                  status referral_bonuses_status_enum DEFAULT 'pending',
                                  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
                                  FOREIGN KEY (referrer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON TABLE referral_bonuses TO admin_vadim;

-- Таблица общих переменных (зависит от common_variable_label)
CREATE TABLE common_variables (
                                  common_vars_id SERIAL PRIMARY KEY,
                                  label common_variable_label UNIQUE,
                                  value VARCHAR(100) NOT NULL,
                                  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON TABLE common_variables TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE common_variables_common_vars_id_seq TO admin_vadim;

-- Таблица рекламных кампаний (не имеет внешних ключей)
CREATE TABLE advertising_campaigns (
                                       id SERIAL PRIMARY KEY,
                                       name VARCHAR(255) NOT NULL,
                                       referral_link VARCHAR(2048) NOT NULL UNIQUE,
                                       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT USAGE, SELECT, UPDATE ON SEQUENCE advertising_campaigns_id_seq TO admin_vadim;
GRANT ALL PRIVILEGES ON TABLE advertising_campaigns TO admin_vadim;

-- Таблица логов пользователей (зависит от users)
CREATE TABLE bot_user_logs (
                               id BIGSERIAL PRIMARY KEY,
                               user_id BIGINT NOT NULL,
                               step VARCHAR(50) DEFAULT NULL,
                               event_type VARCHAR(50) NOT NULL,
                               event_data JSONB DEFAULT '{}',
                               logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON TABLE bot_user_logs TO admin_vadim;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE bot_user_logs_id_seq TO admin_vadim;

-- Таблица похожих пользователей (зависит от users)
CREATE TABLE similar_users (
                               user_id BIGINT NOT NULL,
                               similar_user_id BIGINT NOT NULL,
                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                               PRIMARY KEY (user_id, similar_user_id)
);

GRANT ALL PRIVILEGES ON TABLE similar_users TO admin_vadim;

-- Функция для отправки в канал операторов нового опроса
CREATE OR REPLACE FUNCTION notify_survey_active() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.operator_id IS NULL AND NEW.message_id IS NULL THEN
    PERFORM pg_notify('survey_active_insert', row_to_json(NEW)::text);
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер
CREATE TRIGGER survey_active_trigger
    AFTER INSERT ON survey_active
    FOR EACH ROW
    EXECUTE FUNCTION notify_survey_active();

-- Функция для отправки в канал аудиторов нового опроса
CREATE OR REPLACE FUNCTION notify_audit_survey_active() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.auditor_id IS NULL AND NEW.message_id IS NULL THEN
    PERFORM pg_notify('audit_survey_active_insert', row_to_json(NEW)::text);
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер
CREATE TRIGGER audit_survey_active_trigger
    AFTER INSERT ON audit_survey_active
    FOR EACH ROW
    EXECUTE FUNCTION notify_audit_survey_active();

-- Функция для отправки NOTIFY при появлении operator_id и отсутствии is_user_notified
CREATE OR REPLACE FUNCTION notify_operator_assigned() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.operator_id IS NOT NULL AND NEW.is_user_notified IS FALSE THEN
    PERFORM pg_notify('operator_assigned', row_to_json(NEW)::text);
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер
CREATE OR REPLACE TRIGGER operator_assigned_trigger
AFTER UPDATE OF operator_id ON survey_active
    FOR EACH ROW
    WHEN (NEW.operator_id IS NOT NULL AND NEW.is_user_notified IS FALSE)
    EXECUTE FUNCTION notify_operator_assigned();

-- Функция для отправки NOTIFY при is_operator_notified = false
CREATE OR REPLACE FUNCTION notify_recheck_operator_assigned() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.operator_id IS NOT NULL AND NEW.is_operator_notified IS FALSE THEN
    PERFORM pg_notify('recheck_operator_assigned', row_to_json(NEW)::text);
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер
CREATE OR REPLACE TRIGGER recheck_operator_assigned_trigger
AFTER INSERT OR UPDATE OF operator_id, is_operator_notified ON recheck_survey
    FOR EACH ROW
    WHEN (NEW.operator_id IS NOT NULL AND NEW.is_operator_notified IS FALSE)
    EXECUTE FUNCTION notify_recheck_operator_assigned();

-- Функция для отправки NOTIFY при установке is_reservation_end в TRUE
CREATE OR REPLACE FUNCTION notify_reservation_ended() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_reservation_end IS TRUE THEN
        PERFORM pg_notify('reservation_ended', row_to_json(NEW)::text);
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер
CREATE OR REPLACE TRIGGER reservation_ended_trigger
AFTER UPDATE OF is_reservation_end ON survey_active
    FOR EACH ROW
    WHEN (NEW.is_reservation_end IS TRUE)
    EXECUTE FUNCTION notify_reservation_ended();

-- Функция для уведомления о изменении notify_reason на 'finish_survey'
CREATE OR REPLACE FUNCTION notify_finish_survey() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.notify_reason = 'finish_survey' AND (OLD.notify_reason IS DISTINCT FROM NEW.notify_reason) THEN
        PERFORM pg_notify('finish_survey_notification', row_to_json(NEW)::text);
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер
CREATE OR REPLACE TRIGGER finish_survey_trigger
AFTER UPDATE OF notify_reason ON users
    FOR EACH ROW
    WHEN (NEW.notify_reason = 'finish_survey' AND OLD.notify_reason IS DISTINCT FROM NEW.notify_reason)
    EXECUTE FUNCTION notify_finish_survey();

-- Функция для уведомления о новых фото
CREATE OR REPLACE FUNCTION notify_photo_added() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_send IS FALSE THEN
    PERFORM pg_notify('photo_added', json_build_object(
    'photo_id', NEW.photo_id,
    'user_id', NEW.user_id
    )::text);
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер
CREATE OR REPLACE TRIGGER photo_added_trigger
AFTER INSERT ON photos
FOR EACH ROW
WHEN (NEW.is_send IS FALSE)
EXECUTE FUNCTION notify_photo_added();