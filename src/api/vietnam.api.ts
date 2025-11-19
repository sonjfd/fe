import instance from "@/services/axios.customize";
export type LocationItem = {
    id: number;
    name: string;
};

const LOCATION_BASE = "/api/v1/locations";

export async function getProvinces(): Promise<LocationItem[]> {
    const res = await instance.get<IBackendRes<LocationItem[]>>(
        `${LOCATION_BASE}/provinces`
    );
    // do interceptor đã return response.data nên ở đây res = ApiResponse<LocationItem[]>
    return res.data!;
}

export async function getDistricts(provinceId: number): Promise<LocationItem[]> {
    const res = await instance.get<IBackendRes<LocationItem[]>>(
        `${LOCATION_BASE}/districts`,
        {
            params: { provinceId },
        }
    );
    return res.data!;
}

export async function getWards(districtId: number): Promise<LocationItem[]> {
    const res = await instance.get<IBackendRes<LocationItem[]>>(
        `${LOCATION_BASE}/wards`,
        {
            params: { districtId },
        }
    );
    return res.data!;
}