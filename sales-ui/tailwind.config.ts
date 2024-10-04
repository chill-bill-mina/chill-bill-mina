import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "roboto-slab": ["Roboto Slab", "serif"],
      },
      backgroundImage: {
        "connect-wallet": "linear-gradient(90deg, #8E82FF 0%, #594AF1 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
