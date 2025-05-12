import {MyContext} from "../bot-common/types/type";
import {Bot} from "grammy";
import * as fs from "node:fs";
import path from "path";
import * as XLSX from 'xlsx';
import {getAllRegions} from "../database/queries/regionQueries";
import {addSurvey} from "../database/queries/surveyQueries";


// Тип для задачи
interface Task {
    description: string;
    data: string;
}

// Тип для записи
interface Record {
    region: string;
    completion_limit: number;
    task_price: number;
    tasks: Task[];
    rowNumber: number;
}

export async function xls_parser(ctx: MyContext, bot: Bot<MyContext>): Promise<void> {
    try {
        const document = ctx.message?.document;
        if (!document) {
            await ctx.reply('Пожалуйста, отправьте Excel-файл.');
            return;
        }

        // Проверка расширения файла
        const fileName = document.file_name || '';
        if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
            await ctx.reply('Пожалуйста, отправьте файл в формате .xlsx или .xls.');
            return;
        }

        // Скачивание файла
        const filePath = `temp_${document.file_id}.xlsx`;
        const localPath = await downloadFile(document.file_id, filePath, bot);

        // Парсинг Excel
        const rows = parseExcel(localPath);
        if (rows.length === 0) {
            await ctx.reply('Файл пуст или не содержит данных в первом столбце.');
            fs.unlinkSync(localPath); // Удаляем временный файл
            return;
        }
        const errorRow = []
        const regions = await getAllRegions()
        for (const row of rows) {
            console.log(row)

            const regionId = regions.find(region => region.region_name.trim() === row.region.trim())?.region_id
            if (!regionId) {
                errorRow.push(row.rowNumber)
                continue;
            }

            const id = await addSurvey(
                regionId,
                'test_site',
                '',
                '',
                row.completion_limit,
                0,
                row.task_price,
                row.tasks
            )
            if(!id){
                errorRow.push(row.rowNumber)
            }

        }


        // Удаление временного файла
        fs.unlinkSync(localPath);

        // Ответ пользователю
        await ctx.reply(`Обработка завершена`);
        if(errorRow.length>0) {
            await ctx.reply(`Не сохранены строки ${errorRow.join(', ')}`);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        await ctx.reply('Произошла ошибка при обработке файла.');
    }
}

async function downloadFile(fileId: string, filePath: string, bot: Bot<MyContext>): Promise<string> {
    const file = await bot.api.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
    const response = await fetch(fileUrl);
    const buffer = await response.arrayBuffer();

    const localPath = path.join(__dirname, filePath);
    fs.writeFileSync(localPath, Buffer.from(buffer));
    return localPath;
}

function parseExcel(filePath: string): Record[] {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Получаем диапазон данных в листе
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
    const records: Record[] = [];

    const columnMap = {
        region: 'A',
        completion_limit: 'B',
        task_price: 'C',
        task_1__description: 'D',
        task_1__data__positions_var: 'E',
        task_2__description: 'F',
        task_2__data__positions_var: 'G',
    };

    for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
        const row: any = {};
        let isEmpty = true;

        // Собираем данные из столбцов
        for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
            const cellAddress = XLSX.utils.encode_cell({r: rowNum, c: colNum});
            const cell = sheet[cellAddress];
            if (cell) {
                row[XLSX.utils.encode_col(colNum)] = cell.v; // Сохраняем значение ячейки
                isEmpty = false;
            }
        }

        // Пропускаем пустые строки
        if (isEmpty) continue;

        const tasks: Task[] = [];

        // Обработка task_1
        if (row[columnMap.task_1__description]) {
            const description = String(row[columnMap.task_1__description])
                .split('\n')
                .map((line) => line.trim())
                .join('/n');
            const positions_var = row[columnMap.task_1__data__positions_var]
                ? String(row[columnMap.task_1__data__positions_var]).split('\n').map((item) => item.trim()).filter(Boolean)
                : [];
            const data = JSON.stringify({positions_var});
            tasks.push({
                description,
                data,
            });
        }

        // Обработка task_2
        if (row[columnMap.task_2__description]) {
            const description = String(row[columnMap.task_2__description])
                .split('\n')
                .map((line) => line.trim())
                .join('/n');
            const positions_var = row[columnMap.task_2__data__positions_var]
                ? String(row[columnMap.task_2__data__positions_var]).split('\n').map((item) => item.trim()).filter(Boolean)
                : [];
            const data = JSON.stringify({positions_var});
            tasks.push({
                description,
                data,
            });
        }

        console.log(row)

        records.push({
            region: String(row[columnMap.region] || ''),
            completion_limit: Number(row[columnMap.completion_limit] || 0),
            task_price: Number(row[columnMap.task_price] || 0),
            tasks,
            rowNumber: rowNum + 1, // Номер строки (1-based для удобства)
        });
    }
    return records;
}
