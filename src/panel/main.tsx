import { createRoot } from 'react-dom/client';
import '../index.css';
import 'leaflet/dist/leaflet.css';
import { PanelApp } from './PanelApp';

// Yönetim paneli: uygulamadan bağımsız giriş noktası. Uygulamanın geri kalanı (App.tsx, servis çalışanı, bildirim) yüklenmez.
createRoot(document.getElementById('root')!).render(<PanelApp />);
