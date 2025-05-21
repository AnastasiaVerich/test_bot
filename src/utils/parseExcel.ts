import * as XLSX from "xlsx";

interface Task {
  description: string;
  data: string;
}

interface Record {
  region: string;
  completion_limit: number;
  task_price: number;
  tasks: Task[];
  rowNumber: number;
}

export function parseExcel(filePath: string): Record[] {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  // Получаем диапазон данных в листе
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
  const records: Record[] = [];

  const columnMap = {
    region: "A",
    completion_limit: "B",
    task_price: "C",
    task_1__description: "D",
    task_1__data__positions_var: "E",
    task_2__description: "F",
    task_2__data__positions_var: "G",
  };

  for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
    const row: any = {};

    let isEmpty = true;

    // Собираем данные из столбцов
    for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
      const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: colNum });
      const cell = sheet[cellAddress];
      if (cell) {
        row[XLSX.utils.encode_col(colNum)] = cell.v; // Сохраняем значение ячейки
        isEmpty = false;
      }
    }

    // Пропускаем пустые строки
    if (isEmpty) continue;
    console.log(1);

    const tasks: Task[] = [];

    // Обработка task_1
    if (row[columnMap.task_1__description]) {
      const description = String(row[columnMap.task_1__description])
        .split("\n")
        .map((line) => line.trim())
        .join("/n");
      const positions_var = row[columnMap.task_1__data__positions_var]
        ? String(row[columnMap.task_1__data__positions_var])
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];
      const data = JSON.stringify({ positions_var });
      tasks.push({
        description,
        data,
      });
    }

    // Обработка task_2
    if (row[columnMap.task_2__description]) {
      const description = String(row[columnMap.task_2__description])
        .split("\n")
        .map((line) => line.trim())
        .join("/n");
      const positions_var = row[columnMap.task_2__data__positions_var]
        ? String(row[columnMap.task_2__data__positions_var])
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];
      const data = JSON.stringify({ positions_var });
      tasks.push({
        description,
        data,
      });
    }

    records.push({
      region: String(row[columnMap.region] || ""),
      completion_limit: Number(row[columnMap.completion_limit] || 0),
      task_price: Number(row[columnMap.task_price] || 0),
      tasks,
      rowNumber: rowNum + 1, // Номер строки (1-based для удобства)
    });
  }
  return records;
}
