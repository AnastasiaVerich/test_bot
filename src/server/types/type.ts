export interface LocationType {
  latitude: number;
  longitude: number;
}

export interface InterfaceResponse<T> {
  status: 0 | 1 | 2; // Статус выполнения запроса
  text: T; // Сообщение, которое передается в ответе
  [key: string]: any; // Дополнительные данные, которые могут быть в ответе
}
// 400 не верные параметры запроса пришли
// 200 ок
// 500 ошибка
