export type UserRole = 'citizen' | 'admin';
export interface User {
    id: string;
    name: string;
    contactNumber: string;
    address: string;
    barangayId: string;
    role: UserRole;
}
