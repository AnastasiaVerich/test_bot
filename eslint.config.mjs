import globals from "globals";
import pluginJs from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";
import unusedImportsPlugin from "eslint-plugin-unused-imports";  // Добавлен плагин
import importPlugin from "eslint-plugin-import";  // Подключаем плагин для порядка импортов
import prettierPlugin from "eslint-plugin-prettier"; // Подключаем плагин для Prettier

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    ignores: ["eslint.config.mjs"], // Исключаем конфигурационный файл
    languageOptions: {
      parser: tsParser, // Указываем TypeScript-парсер
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json", // Укажите путь к вашему tsconfig.json
      },
      globals: {
        ...globals.node, // Для работы с Node.js
        ...globals.jest, // Для поддержки глобальных переменных Jest
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin, // Подключаем TypeScript-плагин
      "unused-imports": unusedImportsPlugin, // Подключаем плагин для неиспользуемых импортов
      "import": importPlugin, // Подключаем плагин для порядка импортов
      "prettier": prettierPlugin, // Подключаем плагин для Prettier

    },
    rules: {
      ...pluginJs.configs.recommended.rules, // Рекомендованные правила ESLint
      ...tsPlugin.configs.recommended.rules, // Рекомендованные правила TypeScript
      "@typescript-eslint/no-unused-vars": ["warn"], // Добавляем собственные правила

      // === Логика и безопасность ===
      "@typescript-eslint/no-floating-promises": "error", // Запрещаем оставлять промисы без обработки
      "@typescript-eslint/no-explicit-any": "warn", // Предупреждаем о использовании типа `any`, чтобы избежать типизации
      "@typescript-eslint/explicit-function-return-type": [
        "warn", // Требуем явно задавать тип возвращаемого значения
        { "allowExpressions": true }, // Но разрешаем это игнорировать для стрелочных функций
      ],

      // === Работа с Node.js ===
      "no-process-env": ["warn"], // Рекомендуем избегать прямого использования process.env (например, обернуть в config)
      "global-require": "error", // Требуем использовать `import` вместо `require`, кроме случаев, где это невозможно
      "no-path-concat": "error", // Предотвращаем некорректное соединение путей; используйте path.join()

      // === Чистота кода ===
      "no-console": ["warn", { "allow": ["warn", "error"] }], // Разрешаем только console.warn и console.error
      "no-unused-vars": [
        "warn", // Предупреждаем о неиспользуемых переменных
        { "argsIgnorePattern": "^_" }, // Игнорируем аргументы, начинающиеся с `_`
      ],
      'unused-imports/no-unused-imports': 'error', // Удаляет неиспользуемые импорты

      // === Стиль кода ===
      "semi": ["error", "always"], // Требуем использовать точки с запятой
      "quotes": ["error", "single", { "avoidEscape": true }], // Используем одинарные кавычки, кроме случаев, где нужны экранированные
      "comma-dangle": ["error", "always-multiline"], // Требуем запятую в конце списка, если список многострочный

      // === Ограничение сложности ===
      "complexity": ["warn", 10], // Предупреждаем, если в функции более 10 ветвлений
      "max-lines-per-function": [
        "warn",
        { "max": 50 }, // Ограничиваем длину функций до 50 строк для лучшей читаемости
      ],
      'max-len': ['error', { ignoreComments: true, code: 120 }],


      // === Пробелы и отступы ===
      "space-infix-ops": "error",                     // Пробелы вокруг операторов
      "space-before-blocks": "error",                 // Пробел перед открывающей скобкой блока
      "space-before-function-paren": ["error", "always"], // Пробел перед скобками функций
      "indent": ["error", 2],                         // Отступы 2 пробела
      "no-mixed-spaces-and-tabs": "error",            // Запрещены смешанные пробелы и табуляции
      "no-trailing-spaces": "error",                  // Убирает пробелы в конце строк
      "padding-line-between-statements": [
        "error",
        { "blankLine": "always", "prev": "function", "next": "function" },
        { "blankLine": "always", "prev": "var", "next": "let" },
        { "blankLine": "always", "prev": "const", "next": "let" }
      ], // Пустая строка между функциями и переменными

      // === Запрещенные и разрешенные стили ===
      "no-whitespace-before-property": "error",      // Убирает пробелы перед свойствами объектов
      "keyword-spacing": "error",                    // Пробелы после ключевых слов
      "comma-spacing": "error",                      // Пробелы после запятой

      // === Порядок импортов ===
      "import/order": ["error", { "groups": [["builtin", "external"], ["internal"]] }], // Порядок импортов
      "import/newline-after-import": ["error", { "count": 1 }], // Пустая строка после импортов

      // === Интеграция с Prettier ===
      "prettier/prettier": "error" // Применение Prettier для форматирования
    },
  },

  prettier, // Интеграция с Prettier для форматирования кода
];
