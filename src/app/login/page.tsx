'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors, Mail, Lock, Loader2, Key } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

type LoginMode = 'password' | 'magic-link';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false); // Only for magic link

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Sesión iniciada correctamente');
      router.push('/admin');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Error al intentar iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (error) throw error;

      setIsSent(true);
      toast.success('¡Magic Link enviado! Revisa tu correo.');
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar Magic Link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Scissors className="text-primary-foreground w-6 h-6" />
          </div>
          <CardTitle className="text-2xl">Acceso Administrativo</CardTitle>
          <CardDescription>
            {mode === 'password'
              ? 'Ingresa tus credenciales para acceder al panel.'
              : 'Ingresa tu email para recibir un enlace de acceso instantáneo.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSent && mode === 'magic-link' ? (
            <div className="text-center py-6 space-y-4">
              <div className="bg-primary/10 text-primary p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8" />
              </div>
              <p className="font-medium text-lg">¡Revisa tu bandeja de entrada!</p>
              <p className="text-sm text-muted-foreground">
                Hemos enviado un enlace mágico a <strong>{email}</strong>.
              </p>
              <Button variant="outline" onClick={() => setIsSent(false)} className="mt-4">
                Intentar con otro email
              </Button>
            </div>
          ) : (
            <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLinkLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="barbero@ejemplo.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>

              {mode === 'password' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full py-6 text-lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'password' ? 'Iniciando sesión...' : 'Enviando...'}
                  </>
                ) : (
                  mode === 'password' ? 'Iniciar Sesión' : 'Enviar Magic Link'
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t py-6">
          <Button
            variant="link"
            size="sm"
            className="text-primary gap-2"
            onClick={() => {
              setMode(mode === 'password' ? 'magic-link' : 'password');
              setIsSent(false);
            }}
          >
            {mode === 'password' ? (
              <><Key className="h-4 w-4" /> Usar Magic Link</>
            ) : (
              <><Lock className="h-4 w-4" /> Usar Contraseña</>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Solo personal autorizado. Si eres cliente, vuelve al <Link href="/" className="text-primary hover:underline">inicio</Link>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
