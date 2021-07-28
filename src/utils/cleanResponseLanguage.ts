type SupportedLanguage = 'english' | 'spanish';

const cleanResponseLanguage = (language?: string): SupportedLanguage => {
  if (!language) {
    return 'english';
  }
  const cleanLanguage = language.toLowerCase();

  if (cleanLanguage === 'english' || cleanLanguage === 'spanish') {
    return cleanLanguage;
  }

  return 'english';
};

export default cleanResponseLanguage;
