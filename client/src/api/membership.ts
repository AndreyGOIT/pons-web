// client/src/api/membership.ts
import api from "./api";

export const getUserPayments = async () => {
    const { data } = await api.get("/membership/user/payments");
    return data;
};

export const markMembershipPaid = async (paymentId: number) => {
    const { data } = await api.post("/membership/user/mark-paid", { paymentId });
    return data;
};