'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AgendaView } from '@/components/admin/AgendaView';
import { BarberManagement } from '@/components/admin/BarberManagement';
import { ServiceManagement } from '@/components/admin/ServiceManagement';
import { Button } from '@/components/ui/button';
import { Scissors, LogOut, LayoutDashboard, Calendar, Users, Settings, Lock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface BarberProfile {
  role: 'admin' | 'barber';
}

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'barber' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);

      if (!session) {
        router.push('/login');
        return;
      }

      // Check role
      const { data: profile } = await supabase
        .from('barbers')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      setUserRole((profile as unknown as BarberProfile)?.role || 'barber');
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin Nav */}
      <nav className="bg-background border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 font-bold text-xl">
              <Scissors className="text-primary w-6 h-6" />
              <span>Admin <span className="text-primary">Panel</span></span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {session.user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="agenda" className="space-y-6">
          <TabsList className="bg-background border">
            <TabsTrigger value="agenda" className="gap-2">
              <Calendar className="w-4 h-4" /> Agenda
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2">
              <LayoutDashboard className="w-4 h-4" /> Servicios
            </TabsTrigger>
            <TabsTrigger value="barbers" className="gap-2">
              <Users className="w-4 h-4" /> Barberos
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" /> Ajustes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agenda">
            <AgendaView />
          </TabsContent>

          <TabsContent value="services">
            {userRole === 'admin' ? (
              <ServiceManagement />
            ) : (
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="p-12 text-center space-y-4">
                  <Lock className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  <div className="text-muted-foreground">
                    Acceso restringido. Solo los administradores pueden gestionar servicios.
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="barbers">
            {userRole === 'admin' ? (
              <BarberManagement />
            ) : (
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="p-12 text-center space-y-4">
                  <Lock className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  <div className="text-muted-foreground">
                    Acceso restringido. Solo los administradores pueden gestionar la plantilla.
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de la Barbería</CardTitle>
              </CardHeader>
              <CardContent className="p-12 text-center text-muted-foreground">
                Configura horarios, días festivos y notificaciones.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
