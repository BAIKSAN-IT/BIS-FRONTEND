import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import translationEn from "./locales/en/translation.json";
import translationKo from "./locales/ko/translation.json";
import translationVi from "./locales/vi/translation.json";

const resources = {
  en: { translation: translationEn },
  ko: { translation: translationKo },
  vi: { translation: translationVi },
};

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    resources,
    lng: "ko",
    fallbackLng: ["en", "vi"],
    keySeparator: ".",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
