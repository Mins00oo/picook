const { withInfoPlist, withAppDelegate, createRunOncePlugin } = require('@expo/config-plugins');

const KAKAO_SCHEMES = ['kakaokompassauth', 'storykompassauth', 'kakaolink', 'kakaoplus'];

function withKakaoLogin(config, { nativeAppKey }) {
  // 1. Info.plist: URL scheme + queries schemes
  config = withInfoPlist(config, (cfg) => {
    const urlScheme = `kakao${nativeAppKey}`;

    cfg.modResults.KAKAO_APP_KEY = nativeAppKey;

    if (!Array.isArray(cfg.modResults.CFBundleURLTypes)) {
      cfg.modResults.CFBundleURLTypes = [];
    }
    const exists = cfg.modResults.CFBundleURLTypes.some(
      (t) => t.CFBundleURLSchemes && t.CFBundleURLSchemes.includes(urlScheme),
    );
    if (!exists) {
      cfg.modResults.CFBundleURLTypes.push({
        CFBundleURLSchemes: [urlScheme],
      });
    }

    if (!Array.isArray(cfg.modResults.LSApplicationQueriesSchemes)) {
      cfg.modResults.LSApplicationQueriesSchemes = [];
    }
    KAKAO_SCHEMES.forEach((s) => {
      if (!cfg.modResults.LSApplicationQueriesSchemes.includes(s)) {
        cfg.modResults.LSApplicationQueriesSchemes.push(s);
      }
    });

    return cfg;
  });

  // 2. AppDelegate: import + handleOpenUrl
  config = withAppDelegate(config, (cfg) => {
    const contents = cfg.modResults.contents;

    if (contents.includes('import Expo')) {
      // Swift AppDelegate
      if (!contents.includes('import kakao_login')) {
        cfg.modResults.contents = contents.replace(
          'import Expo',
          'import Expo\nimport kakao_login',
        );
      }
      if (!cfg.modResults.contents.includes('RNKakaoLogins.isKakaoTalkLoginUrl')) {
        cfg.modResults.contents = cfg.modResults.contents.replace(
          /func application\(_[^,]+, open url: URL, options[^)]+\)[^{]*\{/,
          (match) =>
            match +
            '\n    if kakao_login.RNKakaoLogins.isKakaoTalkLoginUrl(url) { return kakao_login.RNKakaoLogins.handleOpen(url) }',
        );
      }
    } else {
      // ObjC AppDelegate
      if (!contents.includes('#import <RNKakaoLogins.h>')) {
        cfg.modResults.contents = contents.replace(
          '#import <React/RCTLinkingManager.h>',
          '#import <React/RCTLinkingManager.h>\n#import <RNKakaoLogins.h>',
        );
      }
      if (!cfg.modResults.contents.includes('[RNKakaoLogins isKakaoTalkLoginUrl')) {
        cfg.modResults.contents = cfg.modResults.contents.replace(
          'options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {',
          `options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {\n  if([RNKakaoLogins isKakaoTalkLoginUrl:url]) { return [RNKakaoLogins handleOpenUrl: url]; }`,
        );
      }
    }

    return cfg;
  });

  return config;
}

module.exports = createRunOncePlugin(withKakaoLogin, 'withKakaoLogin', '1.0.0');
