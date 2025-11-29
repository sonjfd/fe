import axios from "@/services/axios.customize";
import type { IDashboardStats } from "@/types/dashboard";

export const fetchDashboardStats = async () => {
    const url = "/api/v1/admin/dashboard";

    const res = await axios.get<IBackendRes<IDashboardStats>>(url);
    return res.data;
};