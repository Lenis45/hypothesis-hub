import { Role } from "@prisma/client";

const rank: Record<Role, number> = { VIEWER: 0, EDITOR: 1, ADMIN: 2 };

export function hasRole(role: Role, minimum: Role) {
  return rank[role] >= rank[minimum];
}
