import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AdminState = { status: "loading" } | { status: "signed_out" } | { status: "forbidden" } | { status: "admin"; user: User };

async function resolve(): Promise<AdminState> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { status: "signed_out" };
  // Claims a pending invite (first admin) or confirms an existing admin role, server-side.
  const { data: isAdmin, error } = await supabase.rpc("claim_admin_invite");
  if (error || !isAdmin) return { status: "forbidden" };
  return { status: "admin", user: data.user };
}

export function useAdminAccess() {
  const [state, setState] = useState<AdminState>({ status: "loading" });
  useEffect(() => {
    let active = true;
    const run = () => resolve().then((s) => active && setState(s));
    run();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") run();
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);
  return state;
}

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/** Uploads to the private product-images bucket and returns a long-lived signed URL. */
export async function uploadImage(file: File, folder: string) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { data, error: signError } = await supabase.storage.from("product-images").createSignedUrl(path, TEN_YEARS);
  if (signError) throw signError;
  return data.signedUrl;
}

export const ORDER_STATUSES = [
  { value: "beklemede", label: "Beklemede" },
  { value: "odendi", label: "Ödendi" },
  { value: "hazirlaniyor", label: "Hazırlanıyor" },
  { value: "kargoda", label: "Kargoda" },
  { value: "teslim_edildi", label: "Teslim edildi" },
  { value: "iptal", label: "İptal" },
] as const;

export const statusLabel = (s: string) => ORDER_STATUSES.find((o) => o.value === s)?.label ?? s;

export const slugify = (s: string) =>
  s
    .toLocaleLowerCase("tr")
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const LOW_STOCK = 3;
