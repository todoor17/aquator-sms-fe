import { Order } from "../orders/orders";
import { SMSRow } from "../sms/sms";

export type ClientMode = "Manual" | "Automat";

export interface Client {
    id: string;
    title: string;
    idPlatforma: string;
    platforma: string;
    nume: string;
    prenume: string;
    telefon: string;
    isRoPhone: boolean;
    mode: ClientMode;
    smsEnabled: boolean;
    smsRows: SMSRow[];
    orders: Order[];
}

export interface FetchClientsResponse {
    items: Client[];
    quantity: number;
    totalQuantity: number;
}

export interface FetchClientsParams {
    offset?: number;
    limit?: number;
    search?: string;
    magazin?: string;
    anComanda?: string;
    lunaComanda?: string;
    tipClient?: string;
    smsEnabled?: string;
    mode?: string;
}

export interface SelectOption {
    value: string;
    label: string;
}

export interface ClientResources {
    magazines: SelectOption[];
    tipClient: SelectOption[];
    years: string[];
    months: SelectOption[];
}

export interface AddClientPayload {
    title: string;
    idPlatforma: string;
    platforma: string;
    nume: string;
    prenume: string;
    telefon: string;
}

export interface EditClientPayload {
    title?: string;
    idPlatforma?: string;
    platforma?: string;
    nume?: string;
    prenume?: string;
    telefon?: string;
}
