"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowRight,
  GraduationCap,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  UserCog,
} from "lucide-react";
import { inAppWallet, preAuthenticate } from "thirdweb/wallets";
import { useConnect } from "thirdweb/react";
import { ZamoraLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/components/session-provider";
import { thirdwebClient, hasThirdwebClientId } from "@/lib/thirdweb/client";
import { chain } from "@/lib/config";
import { studentRelay } from "@/lib/onchain/relay-client";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

const ROLE_META: Record<
  Role,
  { label: string; icon: typeof GraduationCap; home: string; blurb: string }
> = {
  student: {
    label: "Estudiante",
    icon: GraduationCap,
    home: "/app",
    blurb: "Entra con tu correo: tu billetera ZAMORA se crea al instante.",
  },
  professor: {
    label: "Profesor",
    icon: UserCog,
    home: "/professor",
    blurb: "Accede con las credenciales que te entregó la administración.",
  },
  admin: {
    label: "Administrador",
    icon: ShieldCheck,
    home: "/admin",
    blurb: "Panel de control total del programa de incentivos.",
  },
};

function demoWallet(email: string) {
  let h = 0;
  for (let i = 0; i < email.length; i++) {
    h = (h * 31 + email.charCodeAt(i)) >>> 0;
  }
  const hex = h.toString(16).padStart(8, "0");
  return `0x${hex}${"a1b2c3d4e5f6".repeat(3)}`.slice(0, 42);
}

const inApp = inAppWallet({
  auth: { options: ["email", "google"] },
});

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn } = useSession();
  const { connect } = useConnect();

  const tipo = (params.get("tipo") ?? "estudiante") as
    | "estudiante"
    | "profesor"
    | "admin";
  const initialRole: Role =
    tipo === "profesor" ? "professor" : tipo === "admin" ? "admin" : "student";

  const [role, setRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const meta = ROLE_META[role];
  const isStudent = role === "student";

  async function handleSendCode() {
    if (!hasThirdwebClientId) {
      toast.error("Configura NEXT_PUBLIC_THIRDWEB_CLIENT_ID para entrar con correo.");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Introduce un correo válido.");
      return;
    }
    setLoading(true);
    try {
      await preAuthenticate({ client: thirdwebClient, strategy: "email", email });
      setCodeSent(true);
      toast.success("Te enviamos un código a tu correo.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo enviar el código.");
    } finally {
      setLoading(false);
    }
  }

  async function finishStudentLogin() {
    const wallet = await connect(async () => inApp);
    const account = wallet?.getAccount();
    if (!account) {
      throw new Error("No se pudo obtener la billetera.");
    }
    const name = (email.split("@")[0] || "Estudiante").replace(/[._]/g, " ");
    signIn({
      role: "student",
      name: name.replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      wallet: account.address,
    });
    try {
      await studentRelay({
        account,
        action: "register",
        payload: { nameHash: email },
      });
    } catch {
      // Registro on-chain best-effort.
    }
    toast.success("¡Bienvenido a Zamora!");
    router.push("/app");
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!hasThirdwebClientId) {
      toast.error("Configura NEXT_PUBLIC_THIRDWEB_CLIENT_ID para entrar.");
      return;
    }
    setLoading(true);
    try {
      await inApp.connect({
        client: thirdwebClient,
        chain,
        strategy: "email",
        email,
        verificationCode: code,
      });
      await finishStudentLogin();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Código incorrecto.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (!hasThirdwebClientId) {
      toast.error("Configura NEXT_PUBLIC_THIRDWEB_CLIENT_ID para entrar.");
      return;
    }
    setLoading(true);
    try {
      await inApp.connect({ client: thirdwebClient, chain, strategy: "google" });
      if (!email) setEmail("estudiante@campus.edu");
      await finishStudentLogin();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo conectar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStaff(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSupabaseConfigured && password) {
        try {
          const supabase = createSupabaseBrowserClient();
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
        } catch (error) {
          toast.warning(
            error instanceof Error
              ? `${error.message} — entrando en modo demo.`
              : "Entrando en modo demo.",
          );
        }
      }
      const name =
        role === "professor"
          ? (email.split("@")[0] || "Profesor").replace(/[._]/g, " ")
          : "Administrador";
      signIn({
        role,
        name: name.replace(/\b\w/g, (c) => c.toUpperCase()),
        email,
        wallet: demoWallet(email),
      });
      toast.success("Sesión iniciada.");
      router.push(meta.home);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink-gradient p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-brand/30 blur-3xl" />
        <Link href="/" className="relative">
          <ZamoraLogo />
        </Link>
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            Programa de incentivos on-chain
          </div>
          <h1 className="mt-6 font-display text-4xl font-black leading-tight">
            Bienvenido a tu
            <br />
            <span className="text-gradient">billetera Zamora</span>
          </h1>
          <p className="mt-4 max-w-md text-white/70">
            Sin descargas, sin gas, sin claves privadas que memorizar. Tu correo
            es tu llave y tus logros viven en la blockchain.
          </p>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/60">
            {["Gana ZAMORA", "Cursos certificados", "Logros verificables"].map(
              (t) => (
                <span key={t} className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand" />
                  {t}
                </span>
              ),
            )}
          </div>
        </div>
        <p className="relative text-xs text-white/40">
          © {new Date().getFullYear()} Zamora Wallet · Base Sepolia
        </p>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden">
            <Link href="/">
              <ZamoraLogo />
            </Link>
          </div>

          <h2 className="font-display text-2xl font-bold">Inicia sesión</h2>
          <p className="mt-1 text-sm text-muted-foreground">{meta.blurb}</p>

          <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-border bg-card p-1.5">
            {(Object.keys(ROLE_META) as Role[]).map((r) => {
              const Icon = ROLE_META[r].icon;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    setCodeSent(false);
                    setCode("");
                    setPassword("");
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-medium transition-all",
                    role === r
                      ? "bg-brand text-white shadow-lg shadow-brand/20"
                      : "text-muted-foreground hover:bg-accent",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {ROLE_META[r].label}
                </button>
              );
            })}
          </div>

          {isStudent ? (
            <form onSubmit={handleVerifyCode} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo institucional</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu.nombre@campus.edu"
                    className="pl-10"
                    disabled={codeSent}
                  />
                </div>
              </div>

              {codeSent && (
                <div className="space-y-2">
                  <Label htmlFor="code">Código de verificación</Label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="code"
                      inputMode="numeric"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="123456"
                      className="pl-10 tracking-[0.3em]"
                    />
                  </div>
                </div>
              )}

              {codeSent ? (
                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Verificar y entrar
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                  onClick={handleSendCode}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Crear / entrar con mi correo
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                disabled={loading}
                onClick={handleGoogle}
              >
                Continuar con Google
              </Button>
            </form>
          ) : (
            <form onSubmit={handleStaff} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-staff">Usuario</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email-staff"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@campus.edu"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Las credenciales de profesor son creadas por la administración.
                </p>
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              {!isSupabaseConfigured && (
                <p className="text-center text-xs text-muted-foreground">
                  Supabase no configurado: se entrará en modo demo.
                </p>
              )}
            </form>
          )}

          <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">¿Cómo funciona?</p>
            <p className="mt-1">
              Los estudiantes entran con un código a su correo (billetera
              gestionada, sin gas). Profesores y administradores usan las
              credenciales que creó la administración.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/login" className="font-semibold text-brand hover:underline">
              Regístrate como estudiante
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
