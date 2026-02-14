'use client';

import Link from 'next/link';
import { Scissors, Calendar, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
}

interface Barber {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
}

export default function Home() {
  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('price', { ascending: true });
      if (error) throw error;
      return data as Service[];
    },
  });

  const { data: barbers, isLoading: isLoadingBarbers } = useQuery({
    queryKey: ['barbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Barber[];
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarUrl = (path: string | null) => {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  };

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
            {isLoadingServices ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-8 rounded-2xl bg-card border text-center space-y-4">
                  <Skeleton className="w-12 h-12 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-full mx-auto" />
                  <Skeleton className="h-8 w-1/4 mx-auto" />
                </div>
              ))
            ) : (
              services?.map((service) => (
                <div key={service.id} className="p-8 rounded-2xl bg-card border hover:shadow-lg transition-all text-center flex flex-col h-full">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Scissors className="text-primary w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                  <p className="text-muted-foreground mb-4 text-sm flex-1">{service.description || 'Servicio profesional personalizado.'}</p>
                  <div className="mb-6">
                    <span className="text-2xl font-bold text-primary">${service.price}</span>
                    <span className="text-muted-foreground text-sm ml-2">({service.duration_minutes} min)</span>
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full rounded-full">
                    <Link href={`/booking?serviceId=${service.id}`}>Reservar</Link>
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Barbers Section */}
      <section id="barbers" className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestro Equipo</h2>
            <div className="h-1 w-20 bg-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Profesionales expertos a tu disposición</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {isLoadingBarbers ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center space-y-4">
                  <Skeleton className="w-24 h-24 rounded-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : (
              barbers?.map((barber) => (
                <div key={barber.id} className="flex flex-col items-center text-center group">
                  <Avatar className="w-24 h-24 mb-4 border-2 border-background shadow-md transition-transform group-hover:scale-105">
                    <AvatarImage src={getAvatarUrl(barber.avatar_url)} alt={barber.name} className="object-cover" />
                    <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                      {getInitials(barber.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-bold">{barber.name}</h3>
                  <p className="text-sm text-muted-foreground italic line-clamp-2 mt-1 px-4">
                    {barber.bio || 'Barbero profesional'}
                  </p>
                </div>
              ))
            )}
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
