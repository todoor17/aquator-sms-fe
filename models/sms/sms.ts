export type SMSStatus = "pending" | "planned" | "sent" | "cancelled" | "error";

export interface SMSRow {
    id: string;
    data: string;
    tipSMS: "schimb" | "achizitie" | "reminder achizitie" | "";
    telefon: string;
    status: SMSStatus;
}

export interface FetchSMSRowsResponse {
    items: SMSRow[];
    quantity: number;
}

export interface AddSMSRowPayload {
    data: string;
    tipSMS: SMSRow["tipSMS"];
    telefon: string;
    clientId?: string;
    orderId?: string;
}

export interface EditSMSRowPayload {
    data?: string;
    tipSMS?: SMSRow["tipSMS"];
    telefon?: string;
    status?: SMSStatus;
}
