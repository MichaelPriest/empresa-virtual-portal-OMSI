"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function makeSlug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 55);
}

export async function createCompany(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 120) redirect("/dashboard?error=nome");

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");

  const base = makeSlug(name);
  const slug = (base || "empresa") + "-" + crypto.randomUUID().slice(0, 8);
  const { error } = await supabase.from("companies").insert({
    name, slug, created_by: user.id
  });
  if (error) redirect("/dashboard?error=criar-empresa");
  revalidatePath("/dashboard");
  redirect("/dashboard?created=1");
}
