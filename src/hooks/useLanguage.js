import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentLanguage, setLanguage } from '../store/slices/languageSlice';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();
  const dispatch = useDispatch();
  const currentLanguage = useSelector(selectCurrentLanguage);

  const changeLanguage = (langCode) => {
    if (langCode === 'en' || langCode === 'de') {
      i18n.changeLanguage(langCode);
      dispatch(setLanguage(langCode));
      localStorage.setItem('recruittrain_lang', langCode);
    }
  };

  return {
    currentLanguage: i18n.language || currentLanguage || 'en',
    changeLanguage,
    t,
  };
};
