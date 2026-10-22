import { Beer, Droplets, Package, Wine } from 'lucide-react';

export type Product = {
  id: string;
  name: string;
  price: string;
  icon: typeof Beer;
  image?: string;
  artShape?: 'bottle' | 'logo';
  tone: string;
  detail?: string;
  detailLabel?: string;
};

export const products: Product[] = [
  { id: 'agua', name: 'Agua', price: '$ 3.000', icon: Droplets, image: '/fiesta/agua-cristal-trim.png', artShape: 'bottle', tone: 'blue' },
  { id: 'gatorade', name: 'Gatorade', price: '$ 6.000', icon: Droplets, image: '/fiesta/gatorade-trim.webp', artShape: 'bottle', tone: 'orange' },
  { id: 'todo-rico', name: 'Todo Rico', price: '$ 5.000', icon: Beer, image: '/fiesta/todo-rico-trim.png', artShape: 'logo', tone: 'lime', detail: 'Natural o BBQ', detailLabel: 'SABORES' },
  { id: 'cerveza', name: 'Cerveza', price: '$ 25.000', icon: Beer, image: '/fiesta/aguila-six-pack.webp', tone: 'amber', detail: 'Poker · Águila · Águila Light', detailLabel: 'VARIEDADES' },
  { id: 'aguardiente', name: 'Aguardiente', price: '$ 40.000', icon: Wine, image: '/fiesta/aguardiente-amarillo-trim.webp', artShape: 'bottle', tone: 'violet' },
  { id: 'club-colombia', name: 'Cerveza Club Colombia', price: '$ 30.000', icon: Beer, image: '/fiesta/club-colombia.webp', tone: 'orange' },
  { id: 'combo-whisky', name: 'Combo Whisky', price: '$ 250.000', icon: Package, image: '/fiesta/combo-whisky.webp', tone: 'orange', detail: 'Botella + 2 aguas', detailLabel: 'INCLUYE' },
  { id: 'combo-old-parr', name: 'Combo Old Parr', price: '$ 220.000', icon: Package, image: '/fiesta/combo-old-parr.webp', tone: 'violet', detail: 'Botella + 2 aguas', detailLabel: 'INCLUYE' },
  { id: 'combo-grande', name: 'Combo grande', price: '$ 100.000', icon: Package, image: '/fiesta/combo-grande.webp', tone: 'amber', detail: '2 medias + 1 six + 1 agua', detailLabel: 'INCLUYE' },
  { id: 'combo-pequeno', name: 'Combo pequeño', price: '$ 65.000', icon: Package, image: '/fiesta/combo-pequeno.webp', tone: 'blue', detail: '1 media + 1 six + 1 agua', detailLabel: 'INCLUYE' },
];

export const AVAILABILITY_KEY = 'fiesta-hidden-products-v1';

export function readHiddenProducts(): string[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(AVAILABILITY_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string' && products.some((product) => product.id === id)) : [];
  } catch {
    return [];
  }
}

export function saveHiddenProducts(hiddenIds: string[]) {
  window.localStorage.setItem(AVAILABILITY_KEY, JSON.stringify(hiddenIds));
}
