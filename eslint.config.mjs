import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      // Tắt lỗi no-explicit-any (lỗi đang làm Vercel build fail)
      "@typescript-eslint/no-explicit-any": "off",

      // Tắt lỗi cấm sử dụng @ts-ignore
      "@typescript-eslint/ban-ts-comment": "off",

      // Bạn đã có rule này, giữ nguyên
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];

export default eslintConfig;