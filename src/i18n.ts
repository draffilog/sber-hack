import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      'Smart Contracts': 'Smart Contracts',
      'No contract data available for this protocol': 'No contract data available for this protocol',
      'Vulnerabilities': 'Vulnerabilities',
      'Changes': 'Changes',
      'Last scan': 'Last scan',
      'Scan Now': 'Scan Now',
      'Recent Changes': 'Recent Changes',
      'Updated': 'Updated',
    },
  },
  ru: {
    translation: {
      'Smart Contracts': 'Смарт-контракты',
      'No contract data available for this protocol': 'Нет данных о контрактах для этого протокола',
      'Vulnerabilities': 'Уязвимости',
      'Changes': 'Изменения',
      'Last scan': 'Последнее сканирование',
      'Scan Now': 'Сканировать',
      'Recent Changes': 'Недавние изменения',
      'Updated': 'Обновлено',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 