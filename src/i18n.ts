import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ar from './locales/ar.json';
import bn from './locales/bn.json';
import de from './locales/de.json';
import enUS from './locales/en-US.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fa from './locales/fa.json';
import fr from './locales/fr.json';
import he from './locales/he.json';
import hi from './locales/hi.json';
import id from './locales/id.json';
import it from './locales/it.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import ms from './locales/ms.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';
import ptBR from './locales/pt-BR.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import sw from './locales/sw.json';
import ta from './locales/ta.json';
import th from './locales/th.json';
import tl from './locales/tl.json';
import tr from './locales/tr.json';
import uk from './locales/uk.json';
import ur from './locales/ur.json';
import vi from './locales/vi.json';
import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'ar': { translation: ar },
      'bn': { translation: bn },
      'de': { translation: de },
      'en-US': { translation: enUS },
      'en': { translation: en },
      'es': { translation: es },
      'fa': { translation: fa },
      'fr': { translation: fr },
      'he': { translation: he },
      'hi': { translation: hi },
      'id': { translation: id },
      'it': { translation: it },
      'ja': { translation: ja },
      'ko': { translation: ko },
      'ms': { translation: ms },
      'nl': { translation: nl },
      'pl': { translation: pl },
      'pt-BR': { translation: ptBR },
      'pt': { translation: pt },
      'ru': { translation: ru },
      'sw': { translation: sw },
      'ta': { translation: ta },
      'th': { translation: th },
      'tl': { translation: tl },
      'tr': { translation: tr },
      'uk': { translation: uk },
      'ur': { translation: ur },
      'vi': { translation: vi },
      'zh-CN': { translation: zhCN },
      'zh-TW': { translation: zhTW },
    },
    fallbackLng: 'zh-CN',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
