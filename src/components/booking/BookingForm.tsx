'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ServiceSelection, Service } from './ServiceSelection';
import { BarberSelection, Barber } from './BarberSelection';
import { useAvailability } from '@/hooks/useAvailability';
import { useBooking } from '@/hooks/useBooking';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, Calendar as CalendarIcon, User, Scissors } from 'lucide-react';

export function BookingForm() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });

  const { data: availableSlots, isLoading: isLoadingSlots } = useAvailability(
    selectedBarber?.id || null,
    selectedDate,
    selectedService?.duration_minutes || 0
  );

  const bookingMutation = useBooking();

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedBarber || !selectedTime) return;

    await bookingMutation.mutateAsync({
      barberId: selectedBarber.id,
      serviceId: selectedService.id,
      serviceDuration: selectedService.duration_minutes,
      startTime: selectedTime,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
    });

    setStep(5); // Success step
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  if (step === 5) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold mb-2">¡Todo listo!</h2>
        <p className="text-muted-foreground mb-8">
          Tu reserva ha sido confirmada. Te enviamos los detalles a {customerInfo.email}.
        </p>
        <Button asChild size="lg">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Stepper */}
      <div className="flex justify-between mb-8 overflow-x-auto pb-2 gap-4">
        {[
          { icon: Scissors, label: 'Servicio' },
          { icon: User, label: 'Barbero' },
          { icon: CalendarIcon, label: 'Fecha y Hora' },
          { icon: CheckCircle2, label: 'Confirmar' }
        ].map((s, i) => (
          <div key={i} className={`flex items-center gap-2 flex-shrink-0 ${step > i + 1 ? 'text-primary' : step === i + 1 ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === i + 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-current'}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline text-sm">{s.label}</span>
          </div>
        ))}
      </div>

      <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl">
            {step === 1 && 'Selecciona un Servicio'}
            {step === 2 && 'Elige a tu Barbero'}
            {step === 3 && 'Selecciona Fecha y Hora'}
            {step === 4 && 'Tus Datos'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Contamos con los mejores cortes y tratamientos.'}
            {step === 2 && 'Nuestros profesionales están listos para atenderte.'}
            {step === 3 && 'Busca el hueco que mejor te venga.'}
            {step === 4 && 'Casi terminamos. Necesitamos tus datos para la reserva.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <ServiceSelection
              selectedId={selectedService?.id}
              onSelect={(s) => { setSelectedService(s); nextStep(); }}
            />
          )}

          {step === 2 && (
            <div className="space-y-6">
              <BarberSelection
                selectedId={selectedBarber?.id}
                onSelect={(b) => { setSelectedBarber(b); nextStep(); }}
              />
              <Button variant="ghost" onClick={prevStep} className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Volver
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 flex justify-center border rounded-xl p-4 bg-background">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={es}
                    className="rounded-md"
                    disabled={(date) => date < new Date() || date.getDay() === 0} // No domingos
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Horarios disponibles
                  </h4>
                  {isLoadingSlots ? (
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-10 bg-muted animate-pulse rounded-md" />)}
                    </div>
                  ) : availableSlots?.length === 0 ? (
                    <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">No hay turnos disponibles para este día.</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableSlots?.map((slot) => (
                        <Button
                          key={slot.toISOString()}
                          variant={selectedTime?.getTime() === slot.getTime() ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTime(slot)}
                          className="font-mono"
                        >
                          {format(slot, 'HH:mm')}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={prevStep} className="gap-2">
                  <ChevronLeft className="w-4 h-4" /> Volver
                </Button>
                <Button onClick={nextStep} disabled={!selectedTime} className="gap-2 px-8">
                  Siguiente <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <form onSubmit={handleBooking} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    required
                    value={customerInfo.name}
                    onChange={e => setCustomerInfo(c => ({ ...c, name: e.target.value }))}
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={customerInfo.email}
                      onChange={e => setCustomerInfo(c => ({ ...c, email: e.target.value }))}
                      placeholder="juan@ejemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono (Opcional)</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={e => setCustomerInfo(c => ({ ...c, phone: e.target.value }))}
                      placeholder="+54 11 1234 5678"
                    />
                  </div>
                </div>
              </div>

              {/* Resumen */}
              <div className="bg-muted/50 p-6 rounded-2xl space-y-3">
                <h4 className="font-bold border-bottom pb-2">Resumen de tu turno</h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-muted-foreground">Servicio:</span>
                  <span className="font-medium text-right">{selectedService?.name} ({selectedService?.price})</span>
                  <span className="text-muted-foreground">Barbero:</span>
                  <span className="font-medium text-right">{selectedBarber?.name}</span>
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className="font-medium text-right">{selectedTime && format(selectedTime, "EEEE d 'de' MMMM", { locale: es })}</span>
                  <span className="text-muted-foreground">Hora:</span>
                  <span className="font-medium text-right">{selectedTime && format(selectedTime, "HH:mm")} hs</span>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="ghost" onClick={prevStep}>
                  Volver
                </Button>
                <Button type="submit" disabled={bookingMutation.isPending} className="px-12 py-6 text-lg rounded-full">
                  {bookingMutation.isPending ? 'Procesando...' : 'Confirmar Reserva'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
