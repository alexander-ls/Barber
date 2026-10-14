import type { Metadata } from 'next';
import { AnimatedMenu } from './animated-menu';
import './fiesta.css';

export const metadata: Metadata = {
  title: 'Barra de la Fiesta | Fondo Familiar Versalles',
  description: 'Menú de bebidas y precios para la fiesta de disfraces de Halloween.',
};

export default function FiestaPage() {
  return <AnimatedMenu />;
}
