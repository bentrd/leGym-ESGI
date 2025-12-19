/** @type {import("prettier").Config} */
const config = {
  printWidth: 100,
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  tabWidth: 2,
  plugins: ["prettier-plugin-tailwindcss"],
};

export default config;
