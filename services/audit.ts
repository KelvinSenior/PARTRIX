import { prisma } from "@/lib/prisma";
import { requireOrganizationContext } from "@/lib/tenant";

export interface ActivityLogParams {
  organizationId: string;
  userId?: string | null;
  bookingId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, unknown>;
  level?: "INFO" | "WARNING" | "ERROR";
  tx?: any;
}

export interface ActivityLogDTO {
  id: string;
  userId: string | null;
  userName: string | null;
  bookingId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  details: Record<string, unknown>;
  level: "INFO" | "WARNING" | "ERROR";
  createdAt: string;
}

export async function logActivity(params: ActivityLogParams): Promise<void> {
  const client = params.tx ?? prisma;

  await client.activityLog.create({
    data: {
      organizationId: params.organizationId,
      userId: params.userId ?? null,
      bookingId: params.bookingId ?? null,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId ?? null,
      details: params.details ? JSON.stringify(params.details) : null,
      level: params.level ?? "INFO",
    },
  });
}

export async function listActivityLogs(): Promise<ActivityLogDTO[]> {
  const user = await requireOrganizationContext();

  const logs = await prisma.activityLog.findMany({
    where: { organizationId: user.organizationId! },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: true },
  });

  return logs.map((log) => {
    let details: Record<string, unknown> = {};
    if (typeof log.details === "string") {
      try {
        details = JSON.parse(log.details);
      } catch {
        details = { raw: log.details };
      }
    } else {
      details = log.details ?? {};
    }

    return {
      id: log.id,
      userId: log.userId,
      userName: log.user?.name ?? log.user?.email ?? null,
      bookingId: log.bookingId,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      details,
      level: log.level,
      createdAt: log.createdAt.toISOString(),
    };
  });
}
