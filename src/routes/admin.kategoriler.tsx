import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/kategoriler")({ component: Categories });

export const categoriesQuery = {
  queryKey: ["admin", "categories"],
  queryFn: async () => {
    const { data, error } = await supabase.from("categories").select("*").order("sort_order").order("name");
    if (error) throw error;
    return data;
  },
};

function Categories() {
  const qc = useQueryClient();
  const { data: cats = [] } = useQuery(categoriesQuery);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [parent, setParent] = useState("");
  const roots = cats.filter((c) => !c.parent_id);

  const reset = () => { setEditing(null); setName(""); setParent(""); };

  async function save() {
    if (!name.trim()) return;
    const row = { name: name.trim(), slug: slugify(name), parent_id: parent || null };
    const { error } = editing
      ? await supabase.from("categories").update(row).eq("id", editing)
      : await supabase.from("categories").insert(row);
    if (error) { toast.error(error.code === "23505" ? "Bu isimde bir kategori zaten var." : error.message); return; }
    toast.success("Kategori kaydedildi");
    reset();
    qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    qc.invalidateQueries({ queryKey: ["catalog"] });
  }

  async function remove(id: string) {
    if (!window.confirm("Kategori ve alt kategorileri silinsin mi? Ürünler kategorisiz kalır.")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    qc.invalidateQueries({ queryKey: ["catalog"] });
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-display text-3xl">Kategoriler</h1>
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 sm:flex-row">
        <Input placeholder="Kategori adı" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={parent} onChange={(e) => setParent(e.target.value)}>
          <option value="">Ana kategori</option>
          {roots.filter((r) => r.id !== editing).map((r) => <option key={r.id} value={r.id}>Alt: {r.name}</option>)}
        </select>
        <Button onClick={save}>{editing ? "Güncelle" : "Ekle"}</Button>
        {editing && <Button variant="ghost" onClick={reset}>Vazgeç</Button>}
      </div>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {roots.map((r) => (
          <li key={r.id}>
            <Row name={r.name} onEdit={() => { setEditing(r.id); setName(r.name); setParent(""); }} onDelete={() => remove(r.id)} />
            {cats.filter((c) => c.parent_id === r.id).map((c) => (
              <Row key={c.id} sub name={c.name} onEdit={() => { setEditing(c.id); setName(c.name); setParent(r.id); }} onDelete={() => remove(c.id)} />
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Row({ name, sub, onEdit, onDelete }: { name: string; sub?: boolean; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 text-sm ${sub ? "pl-10 text-muted-foreground" : ""}`}>
      <span>{sub ? "↳ " : ""}{name}</span>
      <span className="flex gap-1">
        <Button size="icon" variant="ghost" aria-label="Düzenle" onClick={onEdit}><Pencil className="h-4 w-4" /></Button>
        <Button size="icon" variant="ghost" aria-label="Sil" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
      </span>
    </div>
  );
}
