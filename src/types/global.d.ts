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
      provider: string
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





  // HOME CATEGORY
  interface IHomeCategory {
    id: number;
    name: string;
    description?: string | null;
    deleted: boolean;
    parentId: number | null;
    children: IChildCategory[];

    createdAt: string;
    updatedAt: string | null;
    createdBy: string;
    updatedBy: string | null;
  }

  interface ISlider {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    redirectUrl: string;
    position: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  }

  interface IWishlistItem {
    wishlistId: number;
    productId: number;
    productName: string;
    productSlug: string;
    productVariantId: number;
    sku: string;
    price: number;
    promotionPrice: number | null;
    thumbnail: string | null;
  }

  interface IHomeProductVariant {
    variantId: number;
    variantName: string;
    productName: string;
    price: number;
    stock: number;
    sold: number;
    thumbnailUrl: string | null;
  }

  interface IHomeCategorySection {
    categoryId: number;
    categoryName: string;
    variants: IHomeProductVariant[];
  }



  interface IWishlistProductVariant extends IHomeProductVariant {
    wishlistId: number;
  }

  interface VariantFilter {
    id: number;
    name: string;
    sku: string;
    price: number;
    sold: number
    stock: number;
    thumbnail: string;
  }



  interface IAddress {
    id: number;
    fullName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    addressDetail: string;
    isDefault: boolean;
    createdAt: string;
  }

  interface IUpsertAddressReq {
    fullName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    addressDetail: string;
    isDefault?: boolean;
  }

}