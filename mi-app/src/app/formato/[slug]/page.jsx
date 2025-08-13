"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PublicFormatoPage() {
  const { slug } = useParams();           // ← el publicLink
  const router = useRouter();

  useEffect(() => {
    if (!slug) return;

    // Guardamos el slug en sessionStorage para que lo lea el Dashboard
    sessionStorage.setItem(
      "publicLinkHandoff",
      JSON.stringify({ publicLink: slug, ts: Date.now() })
    );

    // Redirigimos a la raíz (donde vive tu Dashboard)
    router.replace("/");
  }, [slug, router]);

  // UI mínima por si se ve un instante
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-gray-600">Abriendo formato…</p>
    </div>
  );
}
