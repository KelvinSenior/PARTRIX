import { prisma } from "@/lib/prisma";
import { defaultSettings, settingsSchema } from "@/lib/settingsValidation";
import { requireOrganizationContext } from "@/lib/tenant";
import { logActivity } from "@/services/audit";
import type { SettingsDTO, SettingsPayload } from "@/types/settings";

function mergeSettings(raw: unknown): SettingsDTO {
  if (!raw || typeof raw !== "object") {
return JSON.parse(JSON.stringify(defaultSettings)) as SettingsDTO;
  }

  const safeRaw = raw as Partial<SettingsDTO>;

  return {
    business: {
      ...defaultSettings.business,
      ...safeRaw.business,
    },
    rental: {
      ...defaultSettings.rental,
      ...safeRaw.rental,
    },
    deposit: {
      ...defaultSettings.deposit,
      ...safeRaw.deposit,
    },
    invoice: {
      ...defaultSettings.invoice,
      ...safeRaw.invoice,
    },
    payment: {
      ...defaultSettings.payment,
      ...safeRaw.payment,
    },
    notifications: {
      ...defaultSettings.notifications,
      ...safeRaw.notifications,
    },
    appearance: {
      ...defaultSettings.appearance,
      ...safeRaw.appearance,
    },
  };
}

export async function getOrganizationSettings(): Promise<SettingsDTO> {
  const user = await requireOrganizationContext();
  const organization = await prisma.organization.findUnique({
    where: { id: user.organizationId! },
    select: { settings: true },
  });

  return mergeSettings(organization?.settings ?? null);
}

export async function updateOrganizationSettings(payload: SettingsPayload): Promise<SettingsDTO> {
  const parsed = settingsSchema.parse(payload);
  const user = await requireOrganizationContext();

  const updatedOrganization = await prisma.organization.update({
    where: { id: user.organizationId! },
    data: { settings: parsed as any },
    select: { settings: true },
  });

  await logActivity({
    organizationId: user.organizationId!,
    userId: user.id,
    action: "Update workspace settings",
    entity: "Organization",
    entityId: user.organizationId!,
    details: { updatedFields: Object.keys(parsed) },
    level: "INFO",
  });

  return mergeSettings(updatedOrganization.settings ?? null);
}
