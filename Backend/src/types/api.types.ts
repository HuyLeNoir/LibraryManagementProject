export interface PaginatedData {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    pagination?: PaginatedData;
    error?: any;
}
