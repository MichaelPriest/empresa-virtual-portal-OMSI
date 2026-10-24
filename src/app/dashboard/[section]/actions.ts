"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ResourceSection = "garages" | "vehicles" | "careers";

function clean(value: FormDataEntryValue | null, max = 160) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function createResource(formData: FormData) {
  const section = clean(formData.get("section"), 20) as ResourceSection;
  const companyId = clean(formData.get("company_id"), 80);
  if (!["garages", "vehicles", "careers"].includes(section) || !companyId) {
    redirect("/dashboard?error=resource");
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  // RLS remains the authority for both tenant membership and allowed roles.
  let error: { message: string } | null = null;
  if (section === "garages") {
    const name = clean(formData.get("name"), 120);
    const city = clean(formData.get("city"), 100);
    if (name.length < 2) redirect(`/dashboard/garages?company=${companyId}&error=validation`);
    const result = await supabase.from("garages").insert({
      company_id: companyId,
      name,
      city: city || null,
      country_code: "BR",
    });
    error = result.error;
  } else if (section === "vehicles") {
    const fleetNumber = clean(formData.get("fleet_number"), 40);
    const displayName = clean(formData.get("display_name"), 120);
    const vehicleModel = clean(formData.get("vehicle_model"), 120);
    const simulator = clean(formData.get("simulator"), 20);
    const status = clean(formData.get("status"), 20);
    const garageId = clean(formData.get("garage_id"), 80);
    if (!fleetNumber || !displayName || !["omsi2", "openomsi", "both"].includes(simulator) || !["active", "maintenance", "inactive"].includes(status)) {
      redirect(`/dashboard/vehicles?company=${companyId}&error=validation`);
    }
    const result = await supabase.from("vehicles").insert({
      company_id: companyId,
      garage_id: garageId || null,
      fleet_number: fleetNumber,
      display_name: displayName,
      vehicle_model: vehicleModel || null,
      simulator,
      status,
    });
    error = result.error;
  } else {
    const title = clean(formData.get("title"), 160);
    const origin = clean(formData.get("origin"), 120);
    const destination = clean(formData.get("destination"), 120);
    const routeName = clean(formData.get("route_name"), 120);
    const simulator = clean(formData.get("simulator"), 20);
    const scheduledAt = clean(formData.get("scheduled_at"), 40);
    if (title.length < 2 || !["omsi2", "openomsi", "both"].includes(simulator)) {
      redirect(`/dashboard/careers?company=${companyId}&error=validation`);
    }
    const result = await supabase.from("careers").insert({
      company_id: companyId,
      title,
      origin: origin || null,
      destination: destination || null,
      route_name: routeName || null,
      simulator,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      created_by: user.id,
    });
    error = result.error;
  }

  if (error) {
    const safeSection = section;
    redirect(`/dashboard/${safeSection}?company=${companyId}&error=save`);
  }
  redirect(`/dashboard/${section}?company=${companyId}&saved=1`);
}
