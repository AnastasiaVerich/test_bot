import { client } from "../dbClient";
import logger from "../../lib/logger";

export interface UserMetrics {
  user_id: number;
  registration_number: object | string;
  registration_photo: object | string;
  registration_success: string;
  last_geolocation: string;
  balance: number;
  total_withdrawn: number;
  survey_completion_count: number;
  referral_count: number;
  referrals_with_survey_count: number;
  registration_date: string | null;
}

export interface MoneyMetrics {
  user_id: number;
  current_balance: number;
  total_withdrawn_rub: number;
  total_survey_earnings: number;
  total_referral_earnings: number;
  total_earned: number;
  potential_balance: number;
  balance_difference: number;
}

export async function getUserRegistrationMetrics(): Promise<
  UserMetrics[] | undefined
> {
  try {
    const queryText = `
      SELECT 
        bul_main.user_id,
        COALESCE(
          MAX(CASE WHEN bul.step = 'phone' THEN bul.event_data::text END)::jsonb,
          '{}'::jsonb
        ) AS registration_number,
        COALESCE(
          MAX(CASE WHEN bul.step = 'photo' THEN bul.event_data::text END)::jsonb,
          '{}'::jsonb
        ) AS registration_photo,
        CASE 
          WHEN BOOL_OR(CASE WHEN bul.step = 'success' THEN true ELSE false END) THEN 'yes'
          ELSE ''
        END AS registration_success,
        CASE
          WHEN BOOL_OR(CASE WHEN bul.step = 'success' THEN true ELSE false END)
          THEN COALESCE((
            SELECT CONCAT_WS(', ', bul2.event_data->>'countryName', bul2.event_data->>'state', bul2.event_data->>'city')
            FROM bot_user_logs bul2
            WHERE bul2.user_id = bul_main.user_id 
            AND bul2.event_type = 'survey'
            AND bul2.step = 'location'
            ORDER BY bul2.logged_at DESC 
            LIMIT 1
          ), '')
          ELSE ''
        END AS last_geolocation,
        CASE
          WHEN BOOL_OR(CASE WHEN bul.step = 'success' THEN true ELSE false END)
          THEN COALESCE(u.balance, 0.0)
          ELSE 0.0
        END AS balance,
        CASE
          WHEN BOOL_OR(CASE WHEN bul.step = 'success' THEN true ELSE false END)
          THEN COALESCE((
            SELECT SUM(wl.amount)
            FROM withdrawal_logs wl
            WHERE wl.user_id = bul_main.user_id
          ), 0.0)
          ELSE 0.0
        END AS total_withdrawn,
        CASE
          WHEN BOOL_OR(CASE WHEN bul.step = 'success' THEN true ELSE false END)
          THEN COALESCE((
            SELECT COUNT(DISTINCT sc.completed_at)
            FROM survey_task_completions sc
            WHERE sc.user_id = bul_main.user_id
          ), 0)
          ELSE 0
        END AS survey_completion_count,
        CASE
          WHEN BOOL_OR(CASE WHEN bul.step = 'success' THEN true ELSE false END)
          THEN COALESCE((
            SELECT COUNT(*)
            FROM referral_bonuses rb
            WHERE rb.referrer_id = bul_main.user_id
          ), 0)
          ELSE 0
        END AS referral_count,
        CASE
          WHEN BOOL_OR(CASE WHEN bul.step = 'success' THEN true ELSE false END)
          THEN COALESCE((
            SELECT COUNT(DISTINCT rb.referred_user_id)
            FROM referral_bonuses rb
            JOIN survey_task_completions sc ON rb.referred_user_id = sc.user_id
            WHERE rb.referrer_id = bul_main.user_id
          ), 0)
          ELSE 0
        END AS referrals_with_survey_count,
    u.created_at AS registration_date
      FROM (
        SELECT DISTINCT user_id
        FROM bot_user_logs
      ) bul_main
      LEFT JOIN users u ON bul_main.user_id = u.user_id
      LEFT JOIN bot_user_logs bul 
        ON bul.user_id = bul_main.user_id 
        AND bul.event_type = 'registration' 
        AND bul.step IN ('phone', 'photo', 'success')
      GROUP BY bul_main.user_id, u.balance, u.created_at;
    `;

    const result = await client.query<UserMetrics>(queryText);

    return result.rows;
  } catch (error) {
    logger.error("Error in getUserRegistrationMetrics: " + error);
    return undefined;
  }
}

export async function getUserMoneyLogs(): Promise<MoneyMetrics[] | undefined> {
  try {
    const queryText = `WITH 
    -- Сумма выводов
    withdrawal_totals AS (
        SELECT 
            user_id,
            COALESCE(SUM(amount_rub), 0) AS total_withdrawn_rub
        FROM withdrawal_logs
        WHERE user_id IS NOT NULL
        GROUP BY user_id
    ),
    -- Сумма заработка от опросов
    survey_earnings AS (
        SELECT 
            user_id,
            COALESCE(SUM(reward_user), 0) AS total_survey_earnings
        FROM survey_task_completions
        WHERE user_id IS NOT NULL
        GROUP BY user_id
    ),
    -- Сумма реферальных бонусов
    referral_earnings AS (
        SELECT 
            referrer_id AS user_id,
            COALESCE(SUM(amount), 0) AS total_referral_earnings
        FROM referral_bonuses
        GROUP BY referrer_id
    )
SELECT 
    u.user_id,
    u.balance AS current_balance,
    COALESCE(w.total_withdrawn_rub, 0) AS total_withdrawn_rub,
    COALESCE(s.total_survey_earnings, 0) AS total_survey_earnings,
    COALESCE(r.total_referral_earnings, 0) AS total_referral_earnings,
    -- Общий заработок (опросы + рефералы)
    (COALESCE(s.total_survey_earnings, 0) + COALESCE(r.total_referral_earnings, 0)) AS total_earned,
    -- Потенциальный баланс без выводов
    (u.balance + COALESCE(w.total_withdrawn_rub, 0) ) AS potential_balance,
    -- Разница между общим заработком и потенциальным балансом
       ((COALESCE(s.total_survey_earnings, 0) + COALESCE(r.total_referral_earnings, 0)) - (u.balance + COALESCE(w.total_withdrawn_rub, 0))) AS balance_difference
FROM users u
LEFT JOIN withdrawal_totals w ON u.user_id = w.user_id
LEFT JOIN survey_earnings s ON u.user_id = s.user_id
LEFT JOIN referral_earnings r ON u.user_id = r.user_id
ORDER BY u.user_id;`;

    const result = await client.query<MoneyMetrics>(queryText);

    return result.rows;
  } catch (error) {
    logger.error("Error in getUserMoneyLogs: " + error);
    return undefined;
  }
}
