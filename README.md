# DSH Store Frontend

Dự án frontend của hệ thống bán hàng DSH Store, xây dựng bằng React, TypeScript, Vite và TailwindCSS. Mục tiêu của dự án là cung cấp giao diện người dùng cho các chức năng bán hàng, xem sản phẩm và thao tác giỏ hàng.

## Công nghệ sử dụng

- React
- TypeScript
- Vite
- TailwindCSS
- Axios
- ESLint
- Docker

## Các tính năng chính

### Trang chủ

Hiển thị banner, danh mục ngành hàng và danh sách sản phẩm nổi bật hoặc mới nhất.

### Danh sách sản phẩm

Hiển thị danh sách sản phẩm theo danh mục. Có thể bao gồm lọc, tìm kiếm hoặc sắp xếp tùy theo phần đã triển khai.

### Chi tiết sản phẩm

Hiển thị thông tin sản phẩm, mô tả, giá và các dữ liệu liên quan. Hỗ trợ thêm sản phẩm vào giỏ hàng.

### Giỏ hàng

Quản lý các sản phẩm đã thêm, chỉnh số lượng, tính tổng giá trị và xóa sản phẩm.

### Xác thực người dùng

Nếu backend hỗ trợ: đăng ký, đăng nhập, quản lý tài khoản, xem đơn hàng.

### Các trang tĩnh

Giới thiệu, liên hệ, chính sách và các trang thông tin khác nếu có.

## Cách chạy dự án

### Cài đặt dependencies

```bash
npm install
```

### Chạy chế độ phát triển

```bash
npm run dev
```

### Build sản phẩm

```bash
npm run build
```

### Xem thử bản build

```bash
npm run preview
```

## Cấu hình môi trường (.env)

Tạo file `.env` ở thư mục gốc dự án và khai báo các biến sau (giá trị chỉ là ví dụ):

```env
VITE_BACKEND_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

Giải thích:

- `VITE_BACKEND_URL`: URL backend cung cấp API cho frontend.
- `VITE_GOOGLE_CLIENT_ID`: Client ID dùng cho đăng nhập Google.
- `VITE_GOOGLE_REDIRECT_URI`: Đường dẫn callback sau khi đăng nhập Google thành công.

## Thông tin liên hệ

- Tác giả: Đinh Ngọc Sơn
- Email: sonjfddev@gmail.com
- Liên hệ hợp tác: Nếu bạn muốn trao đổi hoặc cộng tác phát triển dự án, vui lòng liên hệ qua email.
