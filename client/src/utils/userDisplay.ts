// src/utils/userDisplay.ts
export type DisplayUser = {
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
    email?: string | null;
};

export const getDisplayName = (user: DisplayUser): string => {
    if (user.firstName || user.lastName) {
        return [user.firstName, user.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();
    }

    if (user.name?.trim()) {
        return user.name.replace(/\s+/g, " ").trim();
    }

    return user.email ?? "—";
};