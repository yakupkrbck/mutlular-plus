import { doc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { hizmetAlaniId } from '../data/hizmetAlanlari';

// Bir usta alan seçtiğinde o alan herkese görünür olur; usta bırakınca (ve başka usta kalmadıysa) kaybolur.
// Kurallar: usta yalnızca kendi UID'sini ekleyip çıkarabilir.
export async function syncUstaFields(uid: string, nextNames: string[], prevNames: string[] = []) {
  const clean = (list: string[]) =>
    Array.from(new Set(list.map((n) => n.trim()).filter((n) => n.length >= 2 && n.length <= 60)));
  const next = clean(nextNames);
  const prev = clean(prevNames);

  const added = next.filter((n) => !prev.includes(n));
  const removed = prev.filter((n) => !next.includes(n));

  await Promise.all([
    ...added.map((name) =>
      setDoc(doc(db, 'plus_hizmet_alanlari', hizmetAlaniId(name)), { name, ustalar: arrayUnion(uid) }, { merge: true })
    ),
    ...removed.map((name) =>
      updateDoc(doc(db, 'plus_hizmet_alanlari', hizmetAlaniId(name)), { ustalar: arrayRemove(uid) }).catch(() => {})
    ),
  ]);
}
