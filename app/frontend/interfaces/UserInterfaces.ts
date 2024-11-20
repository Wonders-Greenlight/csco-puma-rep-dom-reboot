export enum Role { 
    ADMIN, 
    READ_ONLY, 
    WRITE_ONLY, 
    ERP_API_USER, 
    CUSTOMER
}

export interface IUserJWT {
    id:       string;
    userName: string;
    roles:    Role[];
}