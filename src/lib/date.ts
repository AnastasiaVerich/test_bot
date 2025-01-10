export function formatTimestamp(timestamp: number): string {
  // Создаем объект Date из метки времени
  const date = new Date(timestamp);

  // Получаем день, месяц, год, часы и минуты
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // месяцы начинаются с 0
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  // Форматируем строку в нужном формате
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export function isDateDifferenceAtLeast(
  date1: string,
  date2: string,
  days: number,
): boolean {
  /**
   * Проверяет, больше ли разница между двумя датами (date1 и date2) или равна указанному числу дней.
   *
   * @param date1 - Первая дата в формате ISO (YYYY-MM-DD).
   * @param date2 - Вторая дата в формате ISO (YYYY-MM-DD).
   * @param days - Количество дней для проверки.
   * @returns true, если разница между date1 и date2 >= days, иначе false.
   */

  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // Проверка на валидность дат
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return false;
  }

  // Вычисление разницы в миллисекундах и преобразование в дни
  const differenceInMillis = d1.getTime() - d2.getTime();
  const differenceInDays = differenceInMillis / (1000 * 60 * 60 * 24);

  return differenceInDays >= days;
}
