export function toSlug(str: string) {
    return str
        .normalize("NFD") // tách dấu khỏi ký tự
        .replace(/[\u0300-\u036f]/g, "") // xóa dấu
        .replace(/đ/g, "d") // chuyển đ
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-") // khoảng trắng -> -
        .replace(/[^a-z0-9-]/g, "") // xóa ký tự không hợp lệ
        .replace(/-+/g, "-") // gộp nhiều dấu -
        .replace(/^-+|-+$/g, ""); // bỏ - đầu đuôi
}