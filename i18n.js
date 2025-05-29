import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend'; // Load from server
import LanguageDetector from 'i18next-browser-languagedetector'; // Detect user lang

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    ns:['common'],
    // backend: {
    //   loadPath: 'https://backend URl/locales/{{lng}}/{{ns}}.json', // URL translation files from backend
    // },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // Translation file path Local
    },
  });

export default i18n;


// import i18n from 'i18next';
// import { initReactI18next } from 'react-i18next';
// import LanguageDetector from 'i18next-browser-languagedetector';

// i18n
//   .use(LanguageDetector)
//   .use(initReactI18next)
//   .init({
//     fallbackLng: 'en',
//     interpolation: {
//       escapeValue: false,
//     },
//     ns: ['common'], // Define namespaces if needed
//   });

// export default i18n;