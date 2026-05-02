// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ru from "./i18n/ru.json";
import en from "./i18n/en.json";
import de from "./i18n/de.json";

const resources = {
    ru: { translation: ru },
    en: { translation: en },
    de: { translation: de },
};

i18n
    .use(LanguageDetector) // detecting the language from the browser / localStorage
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "ru",
        debug: false,
        interpolation: { escapeValue: false },
        detection: {
            // detection order: localStorage -> navigator -> htmlTag
            order: ["localStorage", "navigator", "htmlTag"],
            caches: ["localStorage"],
            lookupLocalStorage: "i18nextLng",
        },
        react: { useSuspense: false },
    });

export default i18n;
