import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { addMinutes } from 'date-fns';
import { toast } from 'sonner';

interface CreateAppointmentParams {
  barberId: string;
  serviceId: string;
  serviceDuration: number;
  startTime: Date;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

export function useBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateAppointmentParams) => {
      const endTime = addMinutes(params.startTime, params.serviceDuration);

      const { data, error } = await (supabase
        .from('appointments') as any)
        .insert({
          barber_id: params.barberId,
          service_id: params.serviceId,
          customer_name: params.customerName,
          customer_email: params.customerEmail,
          customer_phone: params.customerPhone,
          start_time: params.startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'confirmed',
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23P01') {
          throw new Error('Lo sentimos, este horario acaba de ser reservado. Por favor elige otro.');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      toast.success('¡Reserva confirmada con éxito!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Hubo un error al procesar tu reserva.');
    },
  });
}
