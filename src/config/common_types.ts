export type RegistrationResponseText =
  | "missing_photo" //2, 400
  | "missing_user_id" //2, 400
  | "missing_user_phone" //2, 400
  | "user_exist_number" //0, 200
  | "user_exist_id" //0, 200
  | "user_is_block" //0, 200
  | "user_exist_face" //0, 200
  | "success" //1, 200
  | "face_not_found" //2,200
  | "server_error"; //2,500

export type IdentificationResponseText =
  | "missing_photo" //2, 400 // Ошибка: нет фото
  | "missing_user_id" //2, 400  // Ошибка: нет userId
  | "user_is_block" //0, 200 // пользовать заблокирован
  | "embedding_not_found" //0, 200  // Ошибка: эмбеддинг не найден в базе
  | "similarity_not_confirmed" //0, 200 // Ошибка: сходство не подтверждено
  | "success" //1, 200 // Успех: верификация прошла успешно
  | "face_not_found" //2, 200 // Ошибка: лицо не найдено на изображении
  | "server_error"; //2, 500 // Ошибка сервера
