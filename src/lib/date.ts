function formatTimestamp(timestamp: number): string {
    // Создаем объект Date из метки времени
    const date = new Date(timestamp);

    // Получаем день, месяц, год, часы и минуты
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // месяцы начинаются с 0
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    // Форматируем строку в нужном формате
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}
