export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    tenantName: string;
    userName: string;
    email: string;
    password: string;
}
export declare class CreateCustomerDto {
    name: string;
    email: string;
    phone?: string;
    notes?: string;
}
export declare class UpdateCustomerDto {
    name?: string;
    email?: string;
    phone?: string;
    notes?: string;
}
