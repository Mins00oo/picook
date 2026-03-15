const { withInfoPlist, withAppDelegate, createRunOncePlugin } = require('@expo/config-plugins');

const KAKAO_SCHEMES = ['kakaokompassauth', 'storykompassauth', 'kakaolink', 'kakaoplus'];

const KAKAO_IMPORT = 'import kakao_login';
const KAKAO_HANDLE_URL = 'if kakao_login.RNKakaoLogins.isKakaoTalkLoginUrl(url) { return kakao_login.RNKakaoLogins.handleOpen(url) }';
const OPEN_URL_METHOD = `
  override func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    ${KAKAO_HANDLE_URL}
    return super.application(app, open: url, options: options)
  }`;

function withKakaoLogin(config, { nativeAppKey }) {
  // 1. Info.plist
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
      cfg.modResults.CFBundleURLTypes.push({ CFBundleURLSchemes: [urlScheme] });
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

  // 2. AppDelegate
  config = withAppDelegate(config, (cfg) => {
    let contents = cfg.modResults.contents;

    if (contents.includes('import Expo') || contents.includes('ExpoAppDelegate')) {
      // Swift AppDelegate
      // Add import
      if (!contents.includes(KAKAO_IMPORT)) {
        if (contents.includes('import Expo')) {
          contents = contents.replace('import Expo', `import Expo\n${KAKAO_IMPORT}`);
        } else if (contents.includes('import UIKit')) {
          contents = contents.replace('import UIKit', `import UIKit\n${KAKAO_IMPORT}`);
        } else {
          contents = `${KAKAO_IMPORT}\n${contents}`;
        }
      }

      // Add URL handler
      if (!contents.includes('RNKakaoLogins.isKakaoTalkLoginUrl')) {
        // Try to find existing application(_:open:options:) method
        const openUrlRegex = /func\s+application\s*\([^)]*open\s+url:\s*URL[^)]*\)[^{]*\{/;
        const match = contents.match(openUrlRegex);

        if (match) {
          // Method exists — inject at the top of the method body
          const insertPos = match.index + match[0].length;
          contents =
            contents.slice(0, insertPos) +
            `\n    ${KAKAO_HANDLE_URL}` +
            contents.slice(insertPos);
        } else {
          // Method doesn't exist — add it before the last closing brace of the class
          const lastBraceIdx = contents.lastIndexOf('}');
          if (lastBraceIdx !== -1) {
            contents =
              contents.slice(0, lastBraceIdx) +
              OPEN_URL_METHOD +
              '\n' +
              contents.slice(lastBraceIdx);
          }
        }
      }
    } else {
      // ObjC AppDelegate
      if (!contents.includes('#import <RNKakaoLogins.h>')) {
        contents = contents.replace(
          '#import <React/RCTLinkingManager.h>',
          '#import <React/RCTLinkingManager.h>\n#import <RNKakaoLogins.h>',
        );
      }
      if (!contents.includes('[RNKakaoLogins isKakaoTalkLoginUrl')) {
        contents = contents.replace(
          'options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {',
          `options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {\n  if([RNKakaoLogins isKakaoTalkLoginUrl:url]) { return [RNKakaoLogins handleOpenUrl: url]; }`,
        );
      }
    }

    cfg.modResults.contents = contents;
    return cfg;
  });

  return config;
}

module.exports = createRunOncePlugin(withKakaoLogin, 'withKakaoLogin', '1.0.0');
