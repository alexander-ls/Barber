'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, Clock, User, Phone, Mail, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function AgendaView() {
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: async () => {
      const today = startOfDay(new Date()).toISOString();
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          barbers(name),
          services(name)
        `)
        .gte('start_time', today)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'confirmed' | 'completed' | 'cancelled' | 'blocked' }) => {
      const { error } = await (supabase
        .from('appointments') as any)
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      toast.success('Estado actualizado');
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Agenda de Hoy</h2>
        <Badge variant="outline" className="px-3 py-1">
          {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
        </Badge>
      </div>

      {appointments?.length === 0 ? (
        <Card className="bg-muted/50 border-dashed border-2">
          <CardContent className="p-12 text-center text-muted-foreground">
            No hay turnos programados para hoy.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {appointments?.map((app: any) => (
            <Card key={app.id} className={`${app.status === 'completed' ? 'opacity-60 grayscale' : ''}`}>
              <CardContent className="p-6 flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary font-bold text-lg">
                      <Clock className="w-5 h-5" />
                      {format(new Date(app.start_time), 'HH:mm')} - {format(new Date(app.end_time), 'HH:mm')}
                    </div>
                    <Badge variant={app.status === 'completed' ? 'secondary' : 'default'}>
                      {app.status === 'confirmed' ? 'Pendiente' : app.status === 'completed' ? 'Completado' : 'Cancelado'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Cliente</p>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
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
