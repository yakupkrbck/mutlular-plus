import { Capacitor } from '@capacitor/core';

export const isNative = () => Capacitor.isNativePlatform();

// Android uygulaması açıldığında: geri tuşu, durum çubuğu ve açılış ekranı
export async function initNative() {
  if (!isNative()) return;
  try {
    const [{ App }, { StatusBar, Style }, { SplashScreen }] = await Promise.all([
      import('@capacitor/app'),
      import('@capacitor/status-bar'),
      import('@capacitor/splash-screen'),
    ]);

    // Geri tuşu: kararı uygulama verir (her zaman ana sayfa; ana sayfadayken çıkış onayı)
    App.addListener('backButton', () => {
      window.dispatchEvent(new CustomEvent('mp-back'));
    });

    await StatusBar.setStyle({ style: Style.Light }).catch(() => {});
    await StatusBar.setBackgroundColor({ color: '#ffffff' }).catch(() => {});
    await SplashScreen.hide().catch(() => {});
  } catch (e) {
    console.warn('[native] başlatılamadı', e);
  }
}

// Uygulamadan çık (Android)
export async function exitNativeApp() {
  try {
    const { App } = await import('@capacitor/app');
    await App.exitApp();
  } catch (e) {
    console.warn('[native] çıkış yapılamadı', e);
  }
}
