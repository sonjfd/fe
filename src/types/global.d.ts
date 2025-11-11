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

  interface IFetchAccount {
    user: IUser
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

}