"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string, max = 120) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim().slice(0, max) : "";
}

export async function createCareerRun(formData: FormData) {
  const companyId = value(formData, "company_id", 80);
  const careerId = value(formData, "career_id", 80);
  const vehicleId = value(formData, "vehicle_id", 80);
  if (!companyId || !careerId) redirect("/dashboard/operations?error=validation");
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  const result = await supabase.from("career_runs").insert({
    company_id: companyId,
    career_id: careerId,
    driver_id: user.id,
    vehicle_id: vehicleId || null,
    status: "planned",
    notes: value(formData, "notes", 1000) || null,
  });
  if (result.error) redirect(`/dashboard/operations?company=${companyId}&error=save`);
  redirect(`/dashboard/operations?company=${companyId}&saved=1`);
}
