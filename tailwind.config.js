module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "nebula-cyan": "#22d3ee",
        "nebula-violet": "#7c3aed",
        "nebula-pink": "#ec4899",
        "nebula-deep": "#060812",
      },
      keyframes: {
        "aurora-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "fade-rise": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "aurora-shift": "aurora-shift 14s ease-in-out infinite",
        "fade-rise": "fade-rise 420ms ease-out forwards",
      },
      boxShadow: {
        "neon-sm": "0 0 18px rgba(34, 211, 238, 0.26)",
        "neon-md": "0 0 36px rgba(34, 211, 238, 0.3)",
      },
    },
  },
  plugins: [],
};
