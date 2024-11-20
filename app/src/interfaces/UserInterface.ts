import { Request } from 'express'
import { Document } from 'mongoose';

export enum Role { 
    ADMIN, 
    READ_ONLY, 
    WRITE_ONLY, 
    ERP_API_USER, 
    CUSTOMER
}

export interface IUser extends Document {
    _id?: number | string;
    userName: string;
    roles: Role[];
    password: string;
    ip?: string;
    createdAt: Date;
    comparePassword: ( password: string ) => Promise<boolean>
}

export interface IUserJWT {
    id:       string;
    userName: string;
    roles:    Role[];
}

export interface UserRequest extends Request {
    user:       IUserJWT;
}