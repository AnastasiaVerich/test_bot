import { formatTimestamp, isDateDifferenceAtLeast } from "./date";

describe("formatTimestamp", () => {
  // Проверяем форматирование метки времени
  it("should format timestamp to 'DD.MM.YYYY HH:mm'", () => {
    const timestamp = new Date("2023-12-25T14:45:00Z").getTime();
    const formatted = formatTimestamp(timestamp);

    // Проверяем, соответствует ли форматированная строка ожидаемому значению
    expect(formatted).toBe("25.12.2023 17:45");
  });

  // Проверяем работу с границами, например, 1 января
  it("should handle timestamps at the start of the year", () => {
    const timestamp = new Date("2023-01-01T00:00:00Z").getTime();
    const formatted = formatTimestamp(timestamp);

    expect(formatted).toBe("01.01.2023 03:00");
  });

  // Проверяем, что функция обрабатывает неправильные входные данные
  it("should handle invalid timestamps", () => {
    const formatted = formatTimestamp(NaN);

    // Возвращается "Invalid Date"
    expect(formatted).toBe("NaN.NaN.NaN NaN:NaN");
  });
});

describe("isDateDifferenceAtLeast", () => {
  // Проверяем, что разница в днях корректно вычисляется
  it("should return true if difference is at least the specified days", () => {
    const date1 = "2023-12-10";
    const date2 = "2023-12-01";
    const result = isDateDifferenceAtLeast(date1, date2, 9);

    expect(result).toBe(true);
  });

  // Проверяем случай, когда разница меньше указанного количества дней
  it("should return false if difference is less than the specified days", () => {
    const date1 = "2023-12-10";
    const date2 = "2023-12-05";
    const result = isDateDifferenceAtLeast(date1, date2, 10);

    expect(result).toBe(false);
  });

  // Проверяем работу функции с неправильными данными
  it("should return false if dates are invalid", () => {
    const result = isDateDifferenceAtLeast("invalid-date", "2023-12-01", 5);

    expect(result).toBe(false);
  });

  // Проверяем обработку одинаковых дат
  it("should return true if dates are the same and days is 0", () => {
    const date = "2023-12-10";
    const result = isDateDifferenceAtLeast(date, date, 0);

    expect(result).toBe(true);
  });

  // Проверяем корректность работы с разными форматами ISO дат
  it("should correctly handle ISO date with time", () => {
    const date1 = "2023-12-10T12:00:00Z";
    const date2 = "2023-12-01T12:00:00Z";
    const result = isDateDifferenceAtLeast(date1, date2, 9);

    expect(result).toBe(true);
  });
});
