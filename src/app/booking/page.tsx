import { BookingForm } from '@/components/booking/BookingForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ChevronLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
        <BookingForm />
      </div>
    </div>
  );
}
