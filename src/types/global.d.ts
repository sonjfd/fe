export {};

declare global {

    interface Window {
        global: any;
    }

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
        provider: string

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


    interface ContactMessage {
        id: number;
        fullName: string;
        email: string;
        phone?: string | null;
        subject?: string | null;
        message: string;
        status: ContactStatus;
        ipAddress?: string | null;
        userAgent?: string | null;
        createdAt: string;
        updatedAt: string;
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

    interface IHomeProductVariant {
        variantId: number;
        variantName: string;
        productName: string;
        productId: number;
        sku: string;
        price: number;
        stock: number;
        sold: number;
        thumbnailUrl: string | null;
        ratingAverage: number | null;
        ratingCount: number | null;
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
        productId: number;
    }


    interface IAddress {
        id: number;
        fullName: string;
        phone: string;
        province: string;
        district: string;
        ward: string;
        addressDetail: string;
        default: boolean;
        createdAt: string;
    }

    interface IUpsertAddressReq {
        fullName: string;
        phone: string;
        provinceId: number;
        districtId: number;
        wardId: number;
        addressDetail: string;
        isDefault?: boolean;
    }


    interface AttributeValueFilter {
        id: number;
        value: string;
    }

    interface AttributeFilter {
        id: number;
        name: string;
        code: string;
        values: AttributeValueFilter[];
    }


    type AttributeValueDTO = {
        id: number;
        value: string;
    };

    interface AttributeDTO {
        id: number;
        code: string;
        name: string;
        values: AttributeValueDTO[];
    };

    interface VariantDTO {
        id: number;
        sku: string;
        name: string;
        price: number;
        stock: number;
        sold: number;
        thumbnail: string;
        valueIds: number[];
    };

    interface ProductDetailDTO {
        id: number;
        name: string;
        code: string;
        sku: string;
        description: string;
        images: string[];
        attributes: AttributeDTO[];
        variants: VariantDTO[];
        defaultVariantId: number;
    };


    export interface ICartItem {
        id: number;
        variantId: number;
        sku: string;
        productName: string;
        thumbnailUrl: string;
        quantity: number;
        price: number;
        total: number;
    }


    export interface ICartResponse {
        cartId: number;
        items: ICartItem[];
        total: number;
    }


    export interface AddToCartRequest {
        variantId: number;
        quantity: number;
    }

    export interface UpdateCartQuantityRequest {
        cartDetailId: number;
        quantity: number;
    }


    interface ShippingQuote {
        fee: number;
        serviceFee: number;
        insuranceFee: number;
        expectedDeliveryTime: string;
    }

    interface OrderItem {
        variantId: number;
        quantity: number;
        price: number;
    }

    interface CreateOrderRequest {
        addressId: number;
        codAmount: number;
        itemsValue: number;
        items: OrderItem[];
        paymentMethod: string;
        voucherId?: number | null;
        voucherDiscount?: number | null;
    }


    interface Order {
        id: number;
        totalPrice: number;
        paymentMethod: string;
        paymentStatus: string;
        ghnOrderCode: string;
        ghnFee: number;
        ghnExpectedDelivery: string;
        orderStatus: string;
    }

    interface OrderCreateResponse {
        order: Order;
        paymentUrl?: string;
    }


    export interface UpdateCartQuantityRequest {
        cartDetailId: number;
        quantity: number;
    }

    // ========== Voucher types ==========
    type VoucherDiscountType = "PERCENT" | "FIXED";
    type VoucherStatus = "ACTIVE" | "INACTIVE" | "EXPIRED";
    type VoucherApplyScope = "ALL" | "ASSIGNED";

    interface IVoucher {
        id: number;
        code: string;
        imageUrl?: string | null;
        discountType: VoucherDiscountType;
        discountValue: number;
        maxDiscountAmount?: number | null;
        minOrderValue?: number | null;
        usageLimit?: number | null;
        usedCount?: number | null;
        userLimit?: number | null;
        applyScope: VoucherApplyScope;
        startDate: string; // ISO
        endDate: string;   // ISO
        status: VoucherStatus;
    }

    interface ICreateVoucherReq {
        code: string;
        imageUrl?: string | null;
        discountType: VoucherDiscountType;
        discountValue: number;
        maxDiscountAmount?: number | null;
        minOrderValue?: number | null;
        usageLimit?: number | null;
        userLimit?: number | null;
        applyScope: VoucherApplyScope;
        startDate: string; // datetime-local string -> backend parse
        endDate: string;
        assignedUserEmails?: string[];
        status: VoucherStatus;
        // dùng khi cần gửi danh sách email (nếu backend hỗ trợ)
    }

    interface IUpdateVoucherReq extends ICreateVoucherReq {
        id: number;
    }

    interface IUserEmailLite {
        id: number;
        email: string;
        fullName: string;
    }


    export interface OrderUser {
        id: number;
        fullName: string;
        email: string;
        phone: string;
    }

    export interface Order {
        id: number;
        totalPrice: number;
        paymentMethod: string;
        paymentStatus: string;
        orderStatus: string;
        ghnExpectedDelivery: string;
        ghnFee: number;
        province: string;
        district: string;
        ward: string;
        addressDetail: string;
        user: OrderUser;
        voucherId?: number | null;
        voucherDiscount?: number | null;
    }


    interface IVariantOrder {
        id: number;
        name: string;
        thumbnail: string;
    }

    interface IOrderDetailItem {
        id: number;
        quantity: number;
        price: number;
        variant: IVariantOrder;
    }

    interface OneOrder {
        id: number;
        totalPrice: number;
        paymentMethod: "VN_PAY" | "CASH";
        paymentStatus: "PAID" | "PENDING" | "FAILED" | "CANCELLED" | "REFUNDED";
        orderStatus: "COMPLETED" | "PROCESSING" | "SHIPPING" | "DELIVERED" | "CANCELLED";

        ghnExpectedDelivery: string;
        ghnFee: number;

        province: string;
        district: string;
        ward: string;
        addressDetail: string;
        voucherId?: number | null;
        voucherCode?: string | null;
        voucherDiscount?: number | null;
        user: OrderUser;
        details: IOrderDetailItem[];
       
    }

    interface VNPayResponse {
        paymentUrl: string
    }

    interface AdminNotification {
        id: number;
        title: string;
        message: string;
        createdAt: string;
        isRead: boolean;
        receiver: string;
        type: "ORDER" | "CONTACT" | "OTHER";
        referenceId: number;
    }


}