export { };

declare global {
  interface IBackendRes<T> {
    message?: string;
    data?: T;
  }

  interface IChildCategory {
    id: number;
    name: string;
  }

  interface IModelPaginate<T> {
    page: number;
    size: number;
    total: number;
    items: T[];
  }


  export interface IUser {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    avatar: string;
    status: IUserStatus;
    gender: IGender;
    role: { id: number };
  }


  export interface IContext {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    avatar: string;
    status: IUserStatus;
    gender: IGender;
    role: string

  }

  export interface IAccount {
    user: {
      id: number;
      fullName: string;
      email: string;
      phone: string;
      avatar: string;
      status: IUserStatus;
      gender: IGender;
      role: string
    }
  }

  interface ContactMessage {
    id: number;
    full_name: string;
    email: string;
    phone?: string | null;
    subject?: string | null;
    message: string;
    status: ContactStatus;
    created_at: string; // ISO string
    updated_at: string; // ISO string
  }

  interface ILogin {
    access_token: string;
    user: {
      id: string;
      email: string;
      fullName: string;
      phone: string;
      avatar: string;
      role: string
      status: string
    }
  }


  interface ICreateProduct {
    id: number;
    name: string;
    code: string;
    category: {
      id: number
    }
  }

  export interface IProductTable {
    id: number;
    code: string;
    name: string;
    category: {
      id: number;
    };
  }

  type IUserStatus = "ACTIVE" | "NOT_ACTIVE" | "BAN";
  type IGender = "MALE" | "FEMALE" | "OTHER" | null;


  interface ICreateUserReq {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    status: IUserStatus;
    gender: IGender;
    role: { id: number };
  }

  interface IUpdateUserReq {
    id: string | number;
    fullName: string;
    phone: string;
    gender: IGender;
    status: IUserStatus;
  }

  interface ICategoryRow {
    id: number;
    name: string;
    description?: string | null;
    parentId: number | null;
  }

  //CONTACT 
  type ContactStatus = 'PENDING' | 'READ' | 'RESOLVED';



  export interface ContactMessage {
    id: number;
    full_name: string;
    email: string;
    phone?: string | null;
    subject?: string | null;
    message: string;
    status: ContactStatus;
    ip_address?: string | null;
    user_agent?: string | null;
    created_at: string; // ISO
    updated_at: string; // ISO
  }

  //Profile
  export interface IUserProfile {
    id: number;                 // cùng kiểu với IUser.id của bạn
    fullName: string;           // TÊN ĐĂNG NHẬP = Fullname (không cho sửa)
    email: string;              // không cho sửa
    phone: string;              // bắt buộc khi cập nhật
    avatar: string;             // URL ảnh (Cloudinary)
    status: IUserStatus;        // "ACTIVE" | "NOT_ACTIVE" | "BAN"
    gender: IGender;            // "MALE" | "FEMALE" | "OTHER" | null
    role: { id: number };
  }

  // Payload cập nhật hồ sơ
  export interface IUpdateProfileReq {
    fullName: string;           // * bắt buộc
    phone: string;              // * bắt buộc
    gender: IGender;            // * bắt buộc
    avatar?: string;            // URL ảnh sau khi upload (tùy chọn)
  }

  // Payload đổi mật khẩu
  export interface IChangePasswordReq {
    currentPassword: string;    // * bắt buộc
    newPassword: string;        // * bắt buộc (≥8, có hoa/thường/ký tự đặc biệt)
  }

  // ===== Address (FE dùng camelCase) =====
  export interface IAddress {
    id: number | string;
    userId: number;             // liên kết tới IUser.id
    name: string;               // tên người nhận
    phone: string;              // sđt người nhận
    province: string;
    district: string;
    ward: string;
    addressDetail: string;
    isDefault: boolean;
    createdAt: string;          // ISO string
    updatedAt: string;          // ISO string
  }

  // Payload tạo/cập nhật địa chỉ
  export interface IUpsertAddressReq {
    name: string;               // * bắt buộc
    phone: string;              // * bắt buộc
    province: string;           // * bắt buộc
    district: string;           // * bắt buộc
    ward: string;               // * bắt buộc
    addressDetail: string;      // * bắt buộc
    isDefault?: boolean;        // tùy chọn (true để đặt mặc định)
  }

  // ===== (Tùy chọn) Kiểu khi BE trả snake_case =====
  // Nếu API trả đúng theo cột DB, bạn có thể dùng các DTO này để map sang FE
  export interface IAddressResDTO {
    id: number | string;
    user_id: number;
    full_name: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    address_detail: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
  }

  export interface IUserProfileResDTO {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    avatar: string;
    status: IUserStatus;
    gender: IGender;
    role: { id: number };
  }
}