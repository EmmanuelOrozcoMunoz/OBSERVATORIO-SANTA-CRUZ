/** Paleta "ladera": tomada del paisaje de la comuna (montaña, cable, ladrillo, curvas de nivel). */
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        tinta: { DEFAULT: "#1d2b2a", suave: "#4a5958", tenue: "#6f7c7a" },
        papel: { DEFAULT: "#f5f6f2", hondo: "#eceee7" },
        nivel: "#d4d9cf",
        ladera: { DEFAULT: "#2d6a4f", claro: "#d8e8dd", hondo: "#1f4d39" },
        cable: { DEFAULT: "#24598a", claro: "#dbe6f1" },
        ladrillo: { DEFAULT: "#a8452b", claro: "#f3ddd5" },
        ambar: { DEFAULT: "#b7791f", claro: "#f6e7c8" },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      fontSize: {
        // escala modular 1.25 (tercera mayor) desde 16 px
        xs: ["0.8rem", { lineHeight: "1.3rem" }],
        sm: ["0.875rem", { lineHeight: "1.4rem" }],
        base: ["1rem", { lineHeight: "1.6rem" }],
        lg: ["1.25rem", { lineHeight: "2rem" }],
        xl: ["1.563rem", { lineHeight: "2rem" }],
        "2xl": ["1.953rem", { lineHeight: "2.3rem" }],
        "3xl": ["2.441rem", { lineHeight: "2.7rem" }],
        "4xl": ["3.052rem", { lineHeight: "3.2rem" }],
      },
    },
  },
  plugins: [],
};
