import { verifyMessage } from "viem";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";

export type StudentAuth = {
  address: string;
  message: string;
  signature: `0x${string}`;
};

const MAX_AGE_MS = 5 * 60 * 1000;

/**
 * Verifica que la petición venga realmente del dueño de `address`, mediante una
 * firma de mensaje (EIP-191). Devuelve la dirección en minúsculas.
 */
export async function authenticateStudent(
  auth: StudentAuth | undefined,
  action: string,
): Promise<string> {
  if (!auth?.address || !auth.message || !auth.signature) {
    throw new Error("Falta firma de autenticación.");
  }
  const tsMatch = /timestamp: (\d+)/.exec(auth.message);
  if (!tsMatch) {
    throw new Error("Mensaje de autenticación inválido.");
  }
  const age = Math.abs(Date.now() - Number(tsMatch[1]));
  if (!Number.isFinite(age) || age > MAX_AGE_MS) {
    throw new Error("La firma de autenticación expiró.");
  }
  if (
    !auth.message.startsWith("Zamora Wallet") ||
    !auth.message.includes(`action: ${action}`) ||
    !auth.message.includes(`address: ${auth.address.toLowerCase()}`)
  ) {
    throw new Error("La firma no corresponde a esta acción.");
  }
  const valid = await verifyMessage({
    address: auth.address as `0x${string}`,
    message: auth.message,
    signature: auth.signature,
  });
  if (!valid) {
    throw new Error("Firma inválida.");
  }
  return auth.address.toLowerCase();
}

/**
 * Autentica a un profesor/admin. Si hay sesión de Supabase con rol, la usa;
 * en modo demo acepta la cabecera `x-zamora-role` (professor|admin).
 */
export async function authenticateStaff(
  roleHeader: string | null,
): Promise<"professor" | "admin"> {
  if (isSupabaseServerConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const role = (user?.app_metadata?.role ??
        user?.user_metadata?.role) as string | undefined;
      if (role === "admin" || role === "professor") {
        return role;
      }
    } catch {
      // Sin sesión válida: se evalúa el modo demo.
    }
  }

  if (roleHeader === "admin" || roleHeader === "professor") {
    return roleHeader;
  }

  throw new Error("No autorizado. Inicia sesión como profesor o administrador.");
}
