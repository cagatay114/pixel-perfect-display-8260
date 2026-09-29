import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  customerName: z.string().trim().min(3).max(100),
  phone: z.string().trim().regex(/^[0-9+\s()-]{10,20}$/),
  email: z.string().trim().email().max(255),
  city: z.string().trim().min(2).max(100),
  address: z.string().trim().min(10).max(500),
  note: z.string().trim().max(500).optional(),
  userId: z.string().uuid().nullable().optional(),
  lines: z
    .array(z.object({ slug: z.string().min(1).max(200), size: z.string().max(20), qty: z.number().int().min(1).max(20) }))
    .min(1)
    .max(50),
});

export const createCodOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");

    // Verify the user id only if the caller really owns that session is not possible here without a token;
    // store it only when the user exists and the email matches.
    let userId: string | null = null;
    if (data.userId) {
      const { data: u } = await db.auth.admin.getUserById(data.userId);
      if (u.user && u.user.email?.toLowerCase() === data.email.toLowerCase()) userId = u.user.id;
    }

    const slugs = [...new Set(data.lines.map((l) => l.slug))];
    const { data: products, error: pErr } = await db
      .from("products")
      .select("id, slug, name, price, color, is_active")
      .in("slug", slugs);
    if (pErr) throw new Error("Ürünler okunamadı");

    const items = data.lines.map((l) => {
      const p = products?.find((x) => x.slug === l.slug && x.is_active);
      if (!p) throw new Error("Sepetinizdeki bir ürün artık satışta değil.");
      return { product_id: p.id, product_name: p.name, size: l.size, color: p.color, unit_price: Number(p.price), quantity: l.qty };
    });

    const { data: settings } = await db.from("site_settings").select("value").eq("key", "free_shipping_limit").maybeSingle();
    const limit = Number(settings?.value) > 0 ? Number(settings?.value) : 1500;
    const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
    const shipping = subtotal >= limit ? 0 : 89;

    const { data: order, error } = await db
      .from("orders")
      .insert({
        user_id: userId,
        customer_name: data.customerName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        address: data.address,
        note: data.note || null,
        payment_method: "kapida",
        status: "beklemede",
        subtotal,
        shipping_fee: shipping,
        total: subtotal + shipping,
      })
      .select("id, order_number, total")
      .single();
    if (error || !order) throw new Error("Sipariş oluşturulamadı");

    const { error: iErr } = await db.from("order_items").insert(items.map((i) => ({ ...i, order_id: order.id })));
    if (iErr) {
      await db.from("orders").delete().eq("id", order.id);
      throw new Error("Sipariş kalemleri kaydedilemedi");
    }
    return { orderNumber: order.order_number, total: Number(order.total) };
  });
