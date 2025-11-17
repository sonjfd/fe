import http from '@/services/axios.customize';


export type UploadMultiRes = IBackendRes<string[]>; // data = list url
export type UploadSingleRes = IBackendRes<string>; // data = single url


const BASE = '/api/v1/uploads';


// Upload nhiều file (trả về mảng URL)
export async function uploadFiles(files: File[]) {
const form = new FormData();
files.forEach((f) => form.append('files', f));
// Header multipart có thể để trình duyệt tự set boundary, nhưng thêm cũng ok
return await http.post<UploadMultiRes>(`${BASE}/files`, form, {
headers: { 'Content-Type': 'multipart/form-data' },
});
}


// Upload avatar theo userId (trả về 1 URL)
export async function uploadAvatar(userId: number | string, file: File) {
const form = new FormData();
form.append('file', file);
return await http.post<UploadSingleRes>(`${BASE}/users/${userId}/avatar`, form, {
headers: { 'Content-Type': 'multipart/form-data' },
});
}


// Upload 1 file vào thư mục chỉ định (trả về 1 URL)
export async function uploadToFolder(folder: string, file: File) {
const form = new FormData();
form.append('file', file);
return await http.post<UploadSingleRes>(`${BASE}/folders/${encodeURIComponent(folder)}/file`, form, {
headers: { 'Content-Type': 'multipart/form-data' },
});
}