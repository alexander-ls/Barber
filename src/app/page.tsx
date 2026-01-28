import Link from 'next/link';
import { Scissors, Calendar, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="relative h-[60vh] flex items-center justify-center text-center text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center z-0 scale-105"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80")',
            filter: 'brightness(0.4)'
          }}
        />
        <div className="relative z-10 px-4 max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            BARBERÍA <span className="text-primary">PREMIUM</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-200">
            Estilo, precisión y tradición en cada corte. Reserva tu turno en segundos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6 rounded-full">
              <Link href="/booking">Reservar Ahora</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 rounded-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all text-white">
              <Link href="#services">Ver Servicios</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Info Bar */}
      <section className="bg-muted py-6 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <Clock className="text-primary w-5 h-5" />
            <span className="text-sm font-medium">Lun - Sáb: 9:00 - 20:00</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <MapPin className="text-primary w-5 h-5" />
            <span className="text-sm font-medium">Calle Falsa 123, Ciudad</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Calendar className="text-primary w-5 h-5" />
            <span className="text-sm font-medium">Reservas 24/7 online</span>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestros Servicios</h2>
            <div className="h-1 w-20 bg-primary mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Corte Clásico', desc: 'Tijera y máquina con terminación detallada.', price: '$15' },
              { title: 'Barba Completa', desc: 'Perfilado, rebajado y tratamiento con toalla.', price: '$10' },
              { title: 'Combo Imperial', desc: 'El servicio completo para el caballero moderno.', price: '$22' }
            ].map((service, i) => (
              <div key={i} className="p-8 rounded-2xl bg-card border hover:shadow-lg transition-all text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Scissors className="text-primary w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-muted-foreground mb-4">{service.desc}</p>
                <span className="text-2xl font-bold text-primary">{service.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-10 px-4 border-t bg-muted/50">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-muted-foreground">© 2024 Barbería Premium. Todos los derechos reservados.</p>
          <div className="mt-4 flex justify-center gap-4">
            <Link href="/login" className="text-sm text-primary hover:underline">Acceso Barberos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
