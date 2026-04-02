export interface ErrorResponse {
    error: boolean;
    message: string;
    code?: string;
    fields?: Record<string, string>;
}

export interface FetchParams {
    page?: number;
    limit?: number;
    search?: string;
}
