import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultWorkspace } from "@/lib/workspace";
import { hasRole } from "@/lib/roles";

export { hasRole } from "@/lib/roles";

export async function requireRole(minimum: Role) {
  const session = process.env.AUTH_SECRET ? await auth() : null;
  const email = session?.user?.email ?? process.env.DEMO_ADMIN_EMAIL ?? "admin@local.test";
  const workspace = await getDefaultWorkspace();
  const membership = await prisma.membership.findFirst({ where: { workspaceId: workspace.id, user: { email } } });
  if (!membership || !hasRole(membership.role, minimum)) throw new Error("Недостаточно прав для этого действия");
  return membership;
}
