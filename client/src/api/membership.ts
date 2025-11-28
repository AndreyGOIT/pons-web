// client/src/api/membership.ts
import api from "./api";

export const getMyMembership = async () => {
    const { data } = await api.get("/membership/me/current");
    return data;
};

export const markMembershipPaid = async () => {
    const { data } = await api.patch("/membership/me/mark-paid");
    return data;
};