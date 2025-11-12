import http from '@/services/axios.customize';

export type SortDir = 'asc' | 'desc';

export interface PaginationDTO<T> { page: number; size: number; total: number; items: T }
export interface Slider { id: number; title: string; description?: string|null; imageUrl: string; redirectUrl?: string|null; position: number; active: boolean; createdAt: string; updatedAt: string }
export interface CreateSliderRequest { title: string; description?: string; imageUrl: string; redirectUrl?: string; position?: number; active?: boolean }
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateSliderRequest extends Partial<CreateSliderRequest> {}

const BASE = '/api/v1/admin/sliders';

export const listSliders = async (params?: { page?: number; size?: number; keyword?: string; active?: boolean; startDate?: string; endDate?: string; sort?: string; }) => {
  const q = new URLSearchParams();
  q.set('page', String(params?.page ?? 0));
  q.set('size', String(params?.size ?? 10));
  q.set('sort', params?.sort ?? 'createdAt,desc');
  if (params?.keyword) q.set('keyword', params.keyword);
  if (typeof params?.active === 'boolean') q.set('active', String(params.active));
  if (params?.startDate) q.set('startDate', params.startDate);
  if (params?.endDate) q.set('endDate', params.endDate);
  const res = await http.get<IBackendRes<PaginationDTO<Slider[]>>>(`${BASE}?${q}`);
  return res.data; // backend đã chuẩn ApiResponse<T>
};

export const getSliderById = async (id: number) => (await http.get<IBackendRes<Slider>>(`${BASE}/${id}`)).data;
export const createSlider = async (payload: CreateSliderRequest) => (await http.post<IBackendRes<Slider>>(BASE, payload)).data;
export const updateSlider = async (id: number, payload: UpdateSliderRequest) => (await http.patch<IBackendRes<Slider>>(`${BASE}/${id}`, payload)).data;
export const deleteSlider = async (id: number) => (await http.delete<IBackendRes<null>>(`${BASE}/${id}`)).data;
export const updateSliderActive = async (id: number, active: boolean) => (await http.patch<IBackendRes<Slider>>(`${BASE}/${id}/active`, null, { params: { active } })).data;
export const updateSliderPosition = async (id: number, position: number) => (await http.patch<IBackendRes<Slider>>(`${BASE}/${id}/position`, null, { params: { position } })).data;
