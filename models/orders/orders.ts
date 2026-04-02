import { SMSRow } from "../sms/sms";

export interface Order {
    id: string;
    telefon: string;
    data: string;
    products: string[];
    smsRows: SMSRow[];
}

export interface FetchOrdersResponse {
    items: Order[];
    quantity: number;
}

export interface FetchOrdersParams {
    clientId: string;
    page?: number;
    limit?: number;
}
