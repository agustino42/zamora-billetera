import { createThirdwebClient } from "thirdweb";

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

export const thirdwebClient = createThirdwebClient(
  clientId
    ? { clientId }
    : {
        // Fallback para desarrollo sin Client ID configurado.
        // Permite renderizar la UI, pero las lecturas on-chain requieren Client ID.
        secretKey: process.env.THIRDWEB_SECRET_KEY ?? "",
      },
);

export const hasThirdwebClientId = Boolean(clientId);

export const inAppWalletConfig = {
  auth: {
    options: ["email", "google", "apple", "facebook"] as const,
  },
} as const;
