import { prisma } from "@/lib/prisma";
import { defaultSettings, settingsSchema } from "@/lib/settingsValidation";
import { requireOrganizationContext } from "@/lib/tenant";
import { logActivity } from "@/services/audit";
import { createNotification } from "@/services/notification";
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
    localization: {
      currency: {
        ...defaultSettings.localization.currency,
        ...safeRaw.localization?.currency,
      },
      timeZone: safeRaw.localization?.timeZone ?? defaultSettings.localization.timeZone,
      dateFormat: safeRaw.localization?.dateFormat ?? defaultSettings.localization.dateFormat,
    },
  };
}

export async function getOrganizationSettings(): Promise<SettingsDTO> {
  const user = await requireOrganizationContext();
  const organization = await prisma.organization.findUnique({
    where: { id: user.organizationId! },
    select: { name: true, slug: true, settings: true },
  });

  const settings = mergeSettings(organization?.settings ?? null);
  return {
    ...settings,
    business: {
      ...settings.business,
      name: organization?.name ?? settings.business.name,
      slug: organization?.slug ?? settings.business.slug,
    },
  };
}

export async function updateOrganizationSettings(payload: SettingsPayload): Promise<SettingsDTO> {
  const parsed = settingsSchema.parse(payload);
  const user = await requireOrganizationContext();

  const updatedOrganization = await prisma.organization.update({
    where: { id: user.organizationId! },
    data: {
      name: parsed.business.name,
      slug: parsed.business.slug,
      settings: parsed as any,
    },
    select: { name: true, slug: true, settings: true },
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

  await createNotification({
    organizationId: user.organizationId!,
    userId: user.id,
    type: "SYSTEM",
    priority: "INFO",
    title: "Settings updated",
    message: "Workspace settings were updated.",
    href: "/settings",
    entity: "Organization",
    entityId: user.organizationId!,
    metadata: { updatedFields: Object.keys(parsed) },
  });

  const settings = mergeSettings(updatedOrganization.settings ?? null);
  return {
    ...settings,
    business: {
      ...settings.business,
      name: updatedOrganization.name,
      slug: updatedOrganization.slug,
    },
  };
}
