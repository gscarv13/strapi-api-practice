import logoDark from './extensions/images/logo-dark.svg'
import favicon from './extensions/images/favicon.png'

export default {
  config: {
    locales: [
      // 'ar',
      // 'fr',
      // 'cs',
      // 'de',
      // 'dk',
      // 'es',
      // 'he',
      // 'id',
      // 'it',
      // 'ja',
      // 'ko',
      // 'ms',
      // 'nl',
      // 'no',
      // 'pl',
      // 'pt-BR',
      // 'pt',
      // 'ru',
      // 'sk',
      // 'sv',
      // 'th',
      // 'tr',
      // 'uk',
      // 'vi',
      // 'zh-Hans',
      // 'zh',
    ],
    auth: {
      logo: logoDark,
    },
    menu: {
       logo: favicon,
    },
    // Replace the favicon
    head: {
      favicon: favicon,
    },
    // Disable video tutorials
    tutorials: false,
  },
  bootstrap(app) {   
    console.log(app);
  },
};
