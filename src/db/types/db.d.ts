export interface DbUser {
    password: string;
    lastLogging: number;
    totalLogging: number;
    ip: string;
}
export interface UserDocRequest {
    password: string;
    ip: string;
}
