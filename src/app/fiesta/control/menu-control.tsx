'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { products, AVAILABILITY_KEY, readHiddenProducts, saveHiddenProducts } from '../menu-products';
import styles from './menu-control.module.css';

export function MenuControl() {
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setHiddenIds(readHiddenProducts());
    sync();
    setReady(true);
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  function toggleProduct(id: string) {
    const nextHidden = hiddenIds.includes(id) ? hiddenIds.filter((item) => item !== id) : [...hiddenIds, id];
    setHiddenIds(nextHidden);
    saveHiddenProducts(nextHidden);
    window.dispatchEvent(new StorageEvent('storage', { key: AVAILABILITY_KEY }));
  }

  function enableAll() {
    setHiddenIds([]);
    saveHiddenProducts([]);
    window.dispatchEvent(new StorageEvent('storage', { key: AVAILABILITY_KEY }));
  }

  const availableCount = products.length - hiddenIds.length;

  return (
    <section className={styles.panel}>
      <Link className={styles.back} href="/fiesta">← Volver al menú</Link>
      <header className={styles.header}>
        <p className={styles.kicker}>FONDO FAMILIAR VERSALLES</p>
        <h1>Control del menú</h1>
        <p>Oculta los productos agotados. La pantalla del menú se actualizará en este navegador.</p>
      </header>

      <div className={styles.summary}>
        <span><strong>{availableCount}</strong> de {products.length} productos visibles</span>
        <button type="button" onClick={enableAll} disabled={!ready || hiddenIds.length === 0}>Mostrar todos</button>
      </div>

      <div className={styles.list}>
        {products.map(({ id, name, price, detail }) => {
          const visible = !hiddenIds.includes(id);
          return (
            <button className={`${styles.product} ${visible ? '' : styles.hidden}`} key={id} type="button" aria-pressed={visible} onClick={() => toggleProduct(id)} disabled={!ready}>
              <span className={styles.status} aria-hidden="true">{visible ? '✓' : '×'}</span>
              <span className={styles.copy}>
                <strong>{name}</strong>
                <small>{detail ?? (visible ? 'Disponible' : 'Agotado')}</small>
              </span>
              <span className={styles.price}>{price}</span>
              <span className={`${styles.toggle} ${visible ? styles.on : ''}`} aria-hidden="true"><i /></span>
            </button>
          );
        })}
      </div>
      <p className={styles.note}>Los cambios se guardan solo en este navegador. Deja abierta la pestaña del menú en la pantalla conectada.</p>
    </section>
  );
}
