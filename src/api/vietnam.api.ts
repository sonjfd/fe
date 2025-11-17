import axios from "axios";

const BASE = "https://provinces.open-api.vn/api";

export async function getProvinces() {
    const res = await axios.get(`${BASE}/p/`);
    return res.data as { code: number; name: string }[];
}

export async function getDistricts(provinceCode: number) {
    const res = await axios.get(`${BASE}/p/${provinceCode}?depth=2`);
    return (res.data.districts || []) as { code: number; name: string }[];
}

export async function getWards(districtCode: number) {
    const res = await axios.get(`${BASE}/d/${districtCode}?depth=2`);
    return (res.data.wards || []) as { code: number; name: string }[];
}
