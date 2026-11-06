import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mutlularhaber.app',
  appName: 'Mutlular Haber',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    // Yayın sürümünde WebView hata ayıklaması kapalı
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#ffffff',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
    // Giriş Firebase JS SDK ile yapılır; yerel eklenti yalnızca Google kimlik bilgisini alır
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ['google.com'],
    },
  },
};

export default config;
