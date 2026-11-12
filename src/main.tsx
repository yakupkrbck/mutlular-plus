import {createRoot} from 'react-dom/client';
import './index.css';
import 'leaflet/dist/leaflet.css';
import { initNative } from './native';

initNative();

const root = createRoot(document.getElementById('root')!);

// /reji : ayrı sayfa olarak reji (canlı yayın grafik) paneli; uygulamanın tamamı yüklenmez
if (/^\/reji\/?$/.test(window.location.pathname)) {
  import('./components/reji/RejiStandalone').then(({ RejiStandalone }) => root.render(<RejiStandalone />));
} else {
  import('./App.tsx').then(({ default: App }) => root.render(<App />));
}
