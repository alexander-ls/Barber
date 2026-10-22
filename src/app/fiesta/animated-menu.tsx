'use client';

import { Beer, Droplets, Package, Wine } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ParticlesProvider } from '@tsparticles/react';
import { useEffect, useState } from 'react';
import { FullscreenButton } from './fullscreen-button';
import { HalloweenParticles, initHalloweenParticles } from './halloween-particles';

type Product = {
  name: string;
  price: string;
  icon: typeof Beer;
  image?: string;
  artShape?: 'bottle' | 'logo';
  tone: string;
  detail?: string;
  detailLabel?: string;
};

const products: Product[] = [
  { name: 'Agua', price: '$ 3.000', icon: Droplets, image: '/fiesta/agua-cristal-trim.png', artShape: 'bottle', tone: 'blue' },
  { name: 'Gatorade', price: '$ 6.000', icon: Droplets, image: '/fiesta/gatorade-trim.webp', artShape: 'bottle', tone: 'orange' },
  { name: 'Todo Rico', price: '$ 5.000', icon: Beer, image: '/fiesta/todo-rico-trim.png', artShape: 'logo', tone: 'lime', detail: 'Natural o BBQ', detailLabel: 'SABORES' },
  { name: 'Cerveza', price: '$ 25.000', icon: Beer, image: '/fiesta/aguila-six-pack.webp', tone: 'amber', detail: 'Poker · Águila · Águila Light', detailLabel: 'VARIEDADES' },
  { name: 'Aguardiente', price: '$ 40.000', icon: Wine, image: '/fiesta/aguardiente-amarillo-trim.webp', artShape: 'bottle', tone: 'violet' },
  { name: 'Cerveza Club Colombia', price: '$ 30.000', icon: Beer, image: '/fiesta/club-colombia.webp', tone: 'orange' },
  { name: 'Combo Whisky', price: '$ 250.000', icon: Package, image: '/fiesta/combo-whisky.webp', tone: 'orange', detail: 'Botella + 2 aguas', detailLabel: 'INCLUYE' },
  { name: 'Combo Old Parr', price: '$ 220.000', icon: Package, image: '/fiesta/combo-old-parr.webp', tone: 'violet', detail: 'Botella + 2 aguas', detailLabel: 'INCLUYE' },
  { name: 'Combo grande', price: '$ 100.000', icon: Package, image: '/fiesta/combo-grande.webp', tone: 'amber', detail: '2 medias + 1 six + 1 agua', detailLabel: 'INCLUYE' },
  { name: 'Combo pequeño', price: '$ 65.000', icon: Package, image: '/fiesta/combo-pequeno.webp', tone: 'blue', detail: '1 media + 1 six + 1 agua', detailLabel: 'INCLUYE' },
];

const reveal = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

const GALLERY_INTERVAL = 5000;

function TitlePumpkin({ reverse = false, reduceMotion }: { reverse?: boolean; reduceMotion: boolean }) {
  return (
    <motion.svg className="title-pumpkin" viewBox="0 0 120 110" aria-hidden="true"
      animate={reduceMotion ? undefined : { rotate: reverse ? [7, -7, 7] : [-7, 7, -7], y: [0, -5, 0], scale: [1, 1.04, 1] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: reverse ? .3 : 0 }}>
      <path d="M58 27c-19-17-43-5-45 27-2 29 14 44 46 43 32 1 48-14 46-43-2-32-26-44-45-27-1-10 4-16 12-21-13-4-24 4-26 21Z" fill="#ff8a24" stroke="#ffc94a" strokeWidth="4" strokeLinejoin="round" />
      <path d="M60 28c-9 10-12 24-12 39s4 25 12 30m1-69c9 10 12 24 12 39s-4 25-12 30" fill="none" stroke="#d85d18" strokeWidth="3" opacity=".8" />
      <path d="m36 54 14 7-14 7m48-14-14 7 14 7m-38 12q10 12 20 0 10 12 20 0" fill="#35163e" stroke="#35163e" strokeWidth="4" strokeLinejoin="round" />
      <path d="M57 17c0-8 6-12 14-11-3 5-5 9-5 15" fill="none" stroke="#75a442" strokeWidth="7" strokeLinecap="round" />
    </motion.svg>
  );
}

function HalloweenOrnaments({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className={`halloween-ornaments ${reduceMotion ? 'is-static' : ''}`} aria-hidden="true">
      <svg className="ornament ornament-bat ornament-bat-left" viewBox="0 0 120 80" role="presentation">
        <path d="M9 19c14 2 23 9 30 20 4-12 12-19 21-22 9 3 17 10 21 22 7-11 16-18 30-20-5 15-13 27-26 32-5 12-13 19-25 19s-20-7-25-19C22 46 14 34 9 19Z" fill="#20102f" stroke="#d6a7ff" strokeWidth="3" strokeLinejoin="round" />
        <path d="M48 37h1m22 0h1m-18 9 7 4 7-4" fill="none" stroke="#ffc94a" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <svg className="ornament ornament-bat ornament-bat-right" viewBox="0 0 120 80" role="presentation">
        <path d="M9 19c14 2 23 9 30 20 4-12 12-19 21-22 9 3 17 10 21 22 7-11 16-18 30-20-5 15-13 27-26 32-5 12-13 19-25 19s-20-7-25-19C22 46 14 34 9 19Z" fill="#20102f" stroke="#d6a7ff" strokeWidth="3" strokeLinejoin="round" />
        <path d="M48 37h1m22 0h1m-18 9 7 4 7-4" fill="none" stroke="#ffc94a" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <svg className="ornament ornament-ghost" viewBox="0 0 100 125" role="presentation">
        <path d="M16 111V52C16 27 31 10 51 10s35 17 35 42v59l-14-10-12 11-11-11-12 11-11-11-10 10Z" fill="#fff4dc" stroke="#bda7ff" strokeWidth="4" strokeLinejoin="round" />
        <ellipse cx="39" cy="55" rx="4" ry="6" fill="#34204c" /><ellipse cx="63" cy="55" rx="4" ry="6" fill="#34204c" />
        <path d="M43 70q8 9 16 0" fill="none" stroke="#ff9b55" strokeWidth="4" strokeLinecap="round" />
        <circle cx="26" cy="68" r="6" fill="#ffb4a0" opacity=".7" /><circle cx="76" cy="68" r="6" fill="#ffb4a0" opacity=".7" />
      </svg>
      <svg className="ornament ornament-pumpkin" viewBox="0 0 120 110" role="presentation">
        <path d="M58 27c-19-17-43-5-45 27-2 29 14 44 46 43 32 1 48-14 46-43-2-32-26-44-45-27-1-10 4-16 12-21-13-4-24 4-26 21Z" fill="#ff8a24" stroke="#ffc94a" strokeWidth="4" strokeLinejoin="round" />
        <path d="M60 28c-9 10-12 24-12 39s4 25 12 30m1-69c9 10 12 24 12 39s-4 25-12 30" fill="none" stroke="#d85d18" strokeWidth="3" opacity=".8" />
        <path d="m36 54 14 7-14 7m48-14-14 7 14 7m-38 12q10 12 20 0 10 12 20 0" fill="#35163e" stroke="#35163e" strokeWidth="4" strokeLinejoin="round" />
        <path d="M57 17c0-8 6-12 14-11-3 5-5 9-5 15" fill="none" stroke="#75a442" strokeWidth="7" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function AnimatedMenu() {
  const reduceMotion = useReducedMotion();
  const enter = reduceMotion ? false : 'hidden';
  const [activeIndex, setActiveIndex] = useState(0);
  const activeProduct = products[activeIndex];

  useEffect(() => {
    if (reduceMotion) return;
    const timeout = window.setTimeout(() => setActiveIndex((index) => (index + 1) % products.length), GALLERY_INTERVAL);
    return () => window.clearTimeout(timeout);
  }, [activeIndex, reduceMotion]);

  return (
    <ParticlesProvider init={initHalloweenParticles}>
    <main className="party-menu">
      <div className="party-glow party-glow-one" />
      <div className="party-glow party-glow-two" />
      {!reduceMotion && <HalloweenParticles />}
      <HalloweenOrnaments reduceMotion={Boolean(reduceMotion)} />

      <div className="party-frame">
        <FullscreenButton />
        <motion.header className="party-heading" initial={enter} animate="visible" variants={reveal} transition={{ duration: .75, ease: 'easeOut' }}>
          <div className="party-kicker"><span /> FONDO FAMILIAR VERSALLES <span /></div>
          <p className="party-intro">¡Que no pare la fiesta!</p>
          <motion.h1 className="party-title" initial={enter} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: .85, delay: .18, ease: 'easeOut' }}>
            <TitlePumpkin reduceMotion={Boolean(reduceMotion)} />
            <span className="party-title-copy">Barra de <span>Halloween</span></span>
            <TitlePumpkin reverse reduceMotion={Boolean(reduceMotion)} />
          </motion.h1>
          <p className="party-subtitle">Bebidas, antojos y buenos momentos</p>
        </motion.header>

        <motion.section className="menu-section" aria-labelledby="drinks-title" initial={enter} animate="visible" variants={{ visible: { transition: { staggerChildren: .11, delayChildren: .3 } } }}>
          <motion.div className="section-heading" variants={reveal} transition={{ duration: .45, ease: 'easeOut' }}>
            <span className="section-rule" /><h2 id="drinks-title">BARRA DE LA FIESTA</h2><span className="section-rule" />
          </motion.div>

          <div className={`gallery-board tone-${activeProduct.tone}`}>
            <nav className="product-index" aria-label="Índice de productos">
              {products.map(({ name, price }, index) => (
                <button className={`index-row ${index === activeIndex ? 'is-current' : ''}`} key={name} type="button" aria-pressed={index === activeIndex} onClick={() => setActiveIndex(index)}>
                  <span className="index-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="index-name">{name}</span>
                  <span className="index-price">{price}</span>
                  {index === activeIndex && <motion.span className="index-active-mark" layoutId="index-active-mark" transition={{ type: 'spring', stiffness: 320, damping: 30 }} />}
                </button>
              ))}
            </nav>

            <div className="barrel-gallery" aria-label="Galería automática de productos">
              <div className="barrel-glow" />
              <div className="barrel-track">
                {products.map(({ name, icon: Icon, image, artShape, tone }, index) => {
                  const offset = ((index - activeIndex + products.length + Math.floor(products.length / 2)) % products.length) - Math.floor(products.length / 2);
                  const distance = Math.abs(offset);
                  if (distance > 2) return null;
                  return (
                    <motion.div className={`barrel-item tone-${tone} ${index === activeIndex ? 'is-current' : ''}`} key={name}
                      animate={{ x: offset * 112, y: distance * 10, rotateY: -offset * 24, scale: 1 - distance * .14, opacity: 1 - distance * .2, z: -distance * 55 }}
                      transition={{ type: 'spring', stiffness: 110, damping: 20 }} style={{ zIndex: 10 - distance }}>
                      <div className={`barrel-product-art ${image ? 'has-product-image' : ''} ${artShape === 'bottle' ? 'has-bottle-image' : ''} ${artShape === 'logo' ? 'has-logo-image' : ''}`}>
                        {image ? <img src={image} alt={`${name} de la fiesta`} /> : <Icon aria-hidden="true" />}
                      </div>
                      <span className="barrel-product-name">{name}</span>
                    </motion.div>
                  );
                })}
              </div>
              <div className="barrel-caption">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={activeProduct.name} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: .32 }}>{activeProduct.name}</motion.span>
                </AnimatePresence>
              </div>
              {!reduceMotion && <motion.div key={activeProduct.name} className="gallery-progress" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: GALLERY_INTERVAL / 1000, ease: 'linear' }} />}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.aside className="product-detail" key={activeProduct.name} initial={reduceMotion ? false : { opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? undefined : { opacity: 0, x: -18 }} transition={{ duration: .32 }}>
                <span className="detail-eyebrow">PRODUCTO DESTACADO</span>
                <h3>{activeProduct.name}</h3>
                {activeProduct.detail && <div className="detail-spec combo-detail"><span>{activeProduct.detailLabel}</span><strong>{activeProduct.detail}</strong></div>}
                <div className="detail-price-label">PRECIO</div>
                <div className="detail-price">{activeProduct.price}</div>
              </motion.aside>
            </AnimatePresence>
          </div>
        </motion.section>

        <motion.footer className="party-footer" initial={enter} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, delay: .9 }}>
          <span className="footer-star">✦</span><p>¡Disfruta la fiesta y brinda con responsabilidad!</p><span className="footer-star">✦</span>
        </motion.footer>
      </div>
    </main>
    </ParticlesProvider>
  );
}
