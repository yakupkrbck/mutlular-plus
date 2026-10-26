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

    // Geri tuşu: önce sayfa geçmişinde geri git, yoksa uygulamadan çık
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack || window.history.length > 1) window.history.back();
      else App.exitApp();
    });

    await StatusBar.setStyle({ style: Style.Light }).catch(() => {});
    await StatusBar.setBackgroundColor({ color: '#ffffff' }).catch(() => {});
    await SplashScreen.hide().catch(() => {});
  } catch (e) {
    console.warn('[native] başlatılamadı', e);
  }
}
