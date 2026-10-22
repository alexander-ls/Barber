import type { Metadata } from 'next';
import { MenuControl } from './menu-control';
import styles from './menu-control.module.css';

export const metadata: Metadata = {
  title: 'Control del menú | Fondo Familiar Versalles',
  robots: { index: false, follow: false },
};

export default function MenuControlPage() {
  return <main className={styles.page}><MenuControl /></main>;
}
