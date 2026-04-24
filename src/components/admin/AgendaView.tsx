'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format, startOfDay, endOfDay, addDays, isSameDay, parseISO, addMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, Clock, User, Phone, Mail, Trash2, ShieldAlert, Plus, Calendar as CalendarIcon, Filter, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BarberProfile {
  id: string;
  name: string;
  role: 'admin' | 'barber';
  user_id: string;
}

interface AppointmentWithDetails {
  id: string;
  start_time: string;
  end_time: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'blocked';
  services: { name: string; price: number } | null;
  barbers: { name: string } | null;
}

export function AgendaView() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterRange, setFilterRange] = useState<'day' | 'week'>('day');
  const [selectedBarberId, setSelectedBarberId] = useState<string>('all');

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) return null;
      return data as unknown as BarberProfile;
    }
  });

  const { data: barbers } = useQuery({
    queryKey: ['admin-barbers-list'],
    enabled: profile?.role === 'admin',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('barbers')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['admin-appointments', startOfDay(selectedDate).toISOString(), filterRange, selectedBarberId, profile?.id, profile?.role],
    enabled: !!profile,
    queryFn: async () => {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          barbers(name),
          services(name, price)
        `);

      const start = startOfDay(selectedDate);
      const end = filterRange === 'day'
        ? endOfDay(selectedDate)
        : endOfDay(addDays(selectedDate, 7));

      query = query
        .gte('start_time', start.toISOString())
        .lt('start_time', end.toISOString());

      if (profile?.role === 'admin') {
        if (selectedBarberId !== 'all') {
          query = query.eq('barber_id', selectedBarberId);
        }
      } else {
        // Barbers only see their own appointments
        query = query.eq('barber_id', profile?.id);
      }

      const { data, error } = await query.order('start_time', { ascending: true });

      if (error) throw error;
      return data as unknown as AppointmentWithDetails[];
    },
  });

  const [isBlocking, setIsBlocking] = useState(false);
  const [blockTime, setBlockTime] = useState('');
  const [blockDuration, setBlockDuration] = useState('30');

  const createBlockMutation = useMutation({
    mutationFn: async () => {
      if (!profile) return;

      const { data: service } = await supabase
        .from('services')
        .select('id')
        .eq('name', 'Bloqueo de Horario')
        .single();

      if (!service) throw new Error('Servicio de bloqueo no encontrado');

      const start = startOfDay(selectedDate);
      const [hours, minutes] = blockTime.split(':').map(Number);
      start.setHours(hours, minutes);

      const { error } = await supabase.from('appointments').insert({
        barber_id: profile.id,
        service_id: service.id,
        customer_name: 'BLOQUEO',
        customer_email: 'admin@barberia.com',
        start_time: start.toISOString(),
        end_time: addMinutes(start, parseInt(blockDuration)).toISOString(),
        status: 'blocked'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      toast.success('Horario bloqueado');
      setIsBlocking(false);
    },
    onError: (error: Error) => {
      toast.error('Error al bloquear: ' + error.message);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'confirmed' | 'completed' | 'cancelled' | 'blocked' }) => {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      toast.success('Estado actualizado');
    }
  });

  if (isLoadingProfile || isLoadingAppointments) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="bg-destructive/10 border-destructive">
        <CardContent className="p-12 text-center text-destructive">
          No tienes un perfil de barbero asignado. Contacta al administrador.
        </CardContent>
      </Card>
    );
  }

  const totalCitas = appointments?.filter(a => a.status !== 'blocked').length || 0;
  const totalRecaudado = appointments?.reduce((sum, app) => {
    if (app.status === 'cancelled' || app.status === 'blocked') return sum;
    return sum + (app.services?.price || 0);
  }, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {filterRange === 'day'
              ? (isSameDay(selectedDate, new Date()) ? 'Agenda de Hoy' : `Agenda para el ${format(selectedDate, "d 'de' MMMM", { locale: es })}`)
              : 'Próximos 7 días'
            }
          </h2>
          <p className="text-muted-foreground">
            Hola, <span className="font-semibold text-foreground">{profile.name}</span>
            {profile.role === 'admin' ? ' (Administrador)' : ' (Barbero)'}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isBlocking} onOpenChange={setIsBlocking}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Bloquear Horario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bloquear Horario</DialogTitle>
                <DialogDescription>
                  Crea un bloqueo manual en la agenda para el día {format(selectedDate, "d 'de' MMMM", { locale: es })}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Hora de inicio</Label>
                  <Input type="time" value={blockTime} onChange={e => setBlockTime(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Duración (minutos)</Label>
                  <Input type="number" value={blockDuration} onChange={e => setBlockDuration(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsBlocking(false)}>Cancelar</Button>
                <Button onClick={() => createBlockMutation.mutate()} disabled={!blockTime || createBlockMutation.isPending}>
                  {createBlockMutation.isPending ? 'Bloqueando...' : 'Confirmar Bloqueo'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Badge variant="outline" className="px-3 py-1 h-fit w-fit">
            {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
          </Badge>
        </div>
      </div>

      {/* Resumen Visual */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <CalendarIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Citas</p>
              <p className="text-2xl font-bold">{totalCitas}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-emerald-500/10 rounded-full">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recaudación Estimada</p>
              <p className="text-2xl font-bold text-emerald-600">${totalRecaudado}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Filtros */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <Label className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-muted-foreground" /> Seleccionar Fecha</Label>
            <Input
              type="date"
              className="w-full"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => {
                const date = parseISO(e.target.value);
                if (!isNaN(date.getTime())) {
                  setSelectedDate(date);
                  setFilterRange('day');
                }
              }}
            />
          </div>

          <div className="flex-1 w-full space-y-2">
            <Label className="flex items-center gap-2"><Filter className="w-4 h-4 text-muted-foreground" /> Navegación Rápida</Label>
            <div className="flex gap-2">
              <Button
                variant={isSameDay(selectedDate, new Date()) && filterRange === 'day' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => { setSelectedDate(new Date()); setFilterRange('day'); }}
              >
                Hoy
              </Button>
              <Button
                variant={isSameDay(selectedDate, addDays(new Date(), 1)) && filterRange === 'day' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => { setSelectedDate(addDays(new Date(), 1)); setFilterRange('day'); }}
              >
                Mañana
              </Button>
              <Button
                variant={filterRange === 'week' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => { setSelectedDate(new Date()); setFilterRange('week'); }}
              >
                7 días
              </Button>
            </div>
          </div>

          {profile?.role === 'admin' && (
            <div className="flex-1 w-full space-y-2">
              <Label className="flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /> Filtrar por Barbero</Label>
              <Select value={selectedBarberId} onValueChange={setSelectedBarberId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los barberos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {barbers?.map((barber) => (
                    <SelectItem key={barber.id} value={barber.id}>{barber.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {appointments?.length === 0 ? (
        <Card className="bg-muted/50 border-dashed border-2">
          <CardContent className="p-12 text-center text-muted-foreground">
            No hay turnos programados para el período seleccionado.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {appointments?.map((app) => (
            <Card key={app.id} className={`${app.status === 'completed' ? 'opacity-60 grayscale' : ''} ${app.status === 'blocked' ? 'border-amber-500 bg-amber-50' : ''}`}>
              <CardContent className="p-6 flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary font-bold text-lg">
                      <Clock className="w-5 h-5" />
                      {format(new Date(app.start_time), 'HH:mm')} - {format(new Date(app.end_time), 'HH:mm')}
                    </div>
                    <Badge variant={app.status === 'completed' ? 'secondary' : app.status === 'blocked' ? 'warning' as any : 'default'}>
                      {app.status === 'confirmed' ? 'Pendiente' : app.status === 'completed' ? 'Completado' : app.status === 'blocked' ? 'Bloqueado' : 'Cancelado'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Cliente</p>
                      <div className="flex items-center gap-2">
                        {app.status === 'blocked' ? <ShieldAlert className="w-4 h-4 text-amber-600" /> : <User className="w-4 h-4 text-muted-foreground" />}
                        <span className="font-medium">{app.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {app.customer_email}
                      </div>
                      {app.customer_phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {app.customer_phone}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Servicio y Barbero</p>
                      <div className="font-medium">{app.services?.name}</div>
                      <div className="text-sm text-muted-foreground italic">Atendido por: {app.barbers?.name}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:border-l md:pl-6">
                  {app.status === 'confirmed' && (
                    <Button
                      onClick={() => updateStatusMutation.mutate({ id: app.id, status: 'completed' })}
                      className="flex-1 md:flex-none gap-2"
                      size="sm"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Marcar Completado
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if(confirm('¿Seguro que deseas cancelar este turno?')) {
                        updateStatusMutation.mutate({ id: app.id, status: 'cancelled' });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
