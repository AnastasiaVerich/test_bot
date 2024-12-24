export type RegistrationResponseText =
    | "missing_photo" //2, 400
    | "missing_user_id" //2, 400
    | "missing_user_phone" //2, 400

    | "user_is_block"//0, 200
    | "user_exist_number"//0, 200
    | "user_exist_id"//0, 200
    | "user_exist_face"//0, 200
    | "success"//1, 200
    | "face_not_found"//2,200

    | "server_error";//2,500
