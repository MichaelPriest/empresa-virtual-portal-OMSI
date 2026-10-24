"use client";

import { deleteResource } from "@/app/dashboard/[section]/actions";

export default function DeleteResourceButton({ section, companyId, resourceId, label }: {
  section: "garages" | "vehicles" | "careers";
  companyId: string;
  resourceId: string;
  label: string;
}) {
  return <form action={deleteResource} onSubmit={(event) => {
    if (!window.confirm(`Excluir ${label}? Esta ação não pode ser desfeita.`)) event.preventDefault();
  }}>
    <input type="hidden" name="section" value={section} />
    <input type="hidden" name="company_id" value={companyId} />
    <input type="hidden" name="resource_id" value={resourceId} />
    <button className="resource-delete-button" type="submit" aria-label={`Excluir ${label}`}>Excluir</button>
  </form>;
}
