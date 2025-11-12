import axios from 'services/axios.customize'

export const uploadFiles = async (files: File[]) => {
    const urlBackEnd = "/api/v1/uploads/files"
    const fd = new FormData();
    files.forEach(f => fd.append("files", f))
    const res = await axios.post<IBackendRes<string[]>>(urlBackEnd, fd, {
        headers: { "Content-Type": "multipart/form-data" },

    })
    return res.data ?? [];
}