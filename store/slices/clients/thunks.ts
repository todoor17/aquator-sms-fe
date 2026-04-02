import { createAsyncThunk } from "@reduxjs/toolkit";
import { Client, ClientMode, ClientResources, FetchClientsResponse, FetchClientsParams } from "../../../models/clients/clients";
import { SMSRow, SMSStatus } from "../../../models/sms/sms";
import { ErrorResponse } from "../../../models/generic/generic";
import { Order } from "../../../models/orders/orders";
import {
    setClients,
    appendClients,
    setSelectedClient,
    addClient,
    editClient,
    deleteClient,
    updateClientMode,
    updateClientSmsEnabled,
    setResources,
    addOrder,
    editOrder,
    deleteOrder,
    addClientProgram,
    editClientProgram,
    deleteClientProgram,
    addOrderProgram,
    editOrderProgram,
    deleteOrderProgram,
    toggleClientProgramStatus,
    toggleOrderProgramStatus,
} from "./clients-slice";
import api from "../../../lib/api";

// ─── Resources ───

export const fetchClientResources = createAsyncThunk<ClientResources, void, { rejectValue: ErrorResponse }>(
    "clients/fetchResources",
    async (_, thunkAPI) => {
        try {
            const response = await api.get<ClientResources>("/clients/resources");
            thunkAPI.dispatch(setResources(response.data));
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({
                error: true,
                message: "SomethingWentWrong",
                code: error?.response?.data?.code,
                fields: error?.response?.data?.fields,
            });
        }
    }
);

// ─── Fetch / Search ───

interface FetchClientsThunkArgs {
    params: FetchClientsParams;
    onlyFilters?: boolean;
}

export const fetchClients = createAsyncThunk<FetchClientsResponse, FetchClientsThunkArgs, { rejectValue: ErrorResponse }>(
    "clients/fetchAll",
    async ({ params, onlyFilters = false }, thunkAPI) => {
        try {
            // Strip empty string values so they aren't sent as query params
            const cleanParams = Object.fromEntries(
                Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null)
            );
            const response = await api.get<FetchClientsResponse>("/clients", {
                params: cleanParams,
                signal: thunkAPI.signal,
            });
            const data = response.data;

            if (onlyFilters) {
                thunkAPI.dispatch(setClients(data));
            } else {
                thunkAPI.dispatch(appendClients(data));
            }

            return data;
        } catch (error: any) {
            if (error?.name === "CanceledError" || thunkAPI.signal.aborted) {
                return thunkAPI.rejectWithValue({
                    error: true,
                    message: "Aborted",
                    code: "ABORTED",
                });
            }
            return thunkAPI.rejectWithValue({
                error: true,
                message: "SomethingWentWrong",
                code: error?.response?.data?.code,
                fields: error?.response?.data?.fields,
            });
        }
    }
);

export const fetchClientById = createAsyncThunk<Client, { id: string }, { rejectValue: ErrorResponse }>(
    "clients/fetchById",
    async ({ id }, thunkAPI) => {
        try {
            const response = await api.get<Client>(`/clients/${id}`);
            const data = response.data;

            thunkAPI.dispatch(setSelectedClient(data));
            return data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({
                error: true,
                message: "SomethingWentWrong",
                code: error?.response?.data?.code,
                fields: error?.response?.data?.fields,
            });
        }
    }
);

// ─── Client CRUD ───

export const addClientThunk = createAsyncThunk<Client, { payload: Omit<Client, "id" | "orders" | "mode" | "smsRows"> }, { rejectValue: ErrorResponse }>(
    "clients/add",
    async ({ payload }, { dispatch, rejectWithValue }) => {
        try {
            const response = await api.post<Client>("/clients", payload);
            const data = response.data;

            dispatch(addClient(data));
            return data;
        } catch (error: any) {
            return rejectWithValue({
                error: true,
                message: "SomethingWentWrong",
                code: error?.response?.data?.code,
                fields: error?.response?.data?.fields,
            });
        }
    }
);

export const editClientThunk = createAsyncThunk<Client, { id: string; payload: Partial<Client> }, { rejectValue: ErrorResponse }>(
    "clients/edit",
    async ({ id, payload }, thunkAPI) => {
        try {
            const response = await api.put<Client>(`/clients/${id}`, payload);
            const data = response.data;

            thunkAPI.dispatch(editClient(data));
            return data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({
                error: true,
                message: "SomethingWentWrong",
                code: error?.response?.data?.code,
                fields: error?.response?.data?.fields,
            });
        }
    }
);

export const deleteClientThunk = createAsyncThunk<boolean, { id: string }, { rejectValue: ErrorResponse }>(
    "clients/delete",
    async ({ id }, thunkAPI) => {
        try {
            await api.delete(`/clients/${id}`);

            thunkAPI.dispatch(deleteClient({ id }));
            return true;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({
                error: true,
                message: "SomethingWentWrong",
                code: error?.response?.data?.code,
                fields: error?.response?.data?.fields,
            });
        }
    }
);

// ─── Client Mode (Manual / Automat) ───

export const updateClientModeThunk = createAsyncThunk<
    { clientId: string; mode: ClientMode },
    { clientId: string; mode: ClientMode },
    { rejectValue: ErrorResponse }
>(
    "clients/updateMode",
    async ({ clientId, mode }, thunkAPI) => {
        try {
            await api.put(`/clients/${clientId}/mode`, { mode });

            thunkAPI.dispatch(updateClientMode({ clientId, mode }));
            return { clientId, mode };
        } catch (error: any) {
            return thunkAPI.rejectWithValue({
                error: true,
                message: "SomethingWentWrong",
                code: error?.response?.data?.code,
                fields: error?.response?.data?.fields,
            });
        }
    }
);

// ─── Client SMS Settings (dummy) ───

export const updateClientSmsSettingsThunk = createAsyncThunk<
    { clientId: string; smsEnabled: boolean },
    { clientId: string; smsEnabled: boolean },
    { rejectValue: ErrorResponse }
>(
    "clients/updateSmsSettings",
    async ({ clientId, smsEnabled }, thunkAPI) => {
        try {
            await api.put(`/clients/${clientId}/sms_enabled`, { smsEnabled });

            thunkAPI.dispatch(updateClientSmsEnabled({ clientId, smsEnabled }));
            return { clientId, smsEnabled };
        } catch (error: any) {
            return thunkAPI.rejectWithValue({
                error: true,
                message: "SomethingWentWrong",
                code: error?.response?.data?.code,
                fields: error?.response?.data?.fields,
            });
        }
    }
);

// ─── Program CRUD (client-level) ───

export const createClientProgramThunk = createAsyncThunk<
    SMSRow,
    { clientId: string; payload: Omit<SMSRow, "id" | "status"> },
    { rejectValue: ErrorResponse }
>(
    "clients/createClientProgram",
    async ({ clientId, payload }, { dispatch, rejectWithValue }) => {
        try {
            const response = await api.post<SMSRow>(`/clients/${clientId}/programs`, payload);
            const data = response.data;

            dispatch(addClientProgram({ clientId, program: data }));
            return data;
        } catch (error: any) {
            return rejectWithValue({
                error: true,
                message: "SomethingWentWrong",
                code: error?.response?.data?.code,
                fields: error?.response?.data?.fields,
            });
        }
    }
);

export const updateClientProgramThunk = createAsyncThunk<
    SMSRow,
    { clientId: string; programId: string; payload: Partial<SMSRow> },
    { rejectValue: ErrorResponse }
>(
    "clients/updateClientProgram",
    async ({ clientId, programId, payload }, thunkAPI) => {
        // Optimistic update
        thunkAPI.dispatch(editClientProgram({ clientId, program: { id: programId, ...payload } as SMSRow }));

        try {
            const response = await api.put<SMSRow>(`/clients/${clientId}/programs/${programId}`, payload);
            const data = response.data;

            thunkAPI.dispatch(editClientProgram({ clientId, program: data }));
            return data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({
                error: true,
                message: "SomethingWentWrong",
                code: error?.response?.data?.code,
                fields: error?.response?.data?.fields,
            });
        }
    }
);

export const deleteClientProgramThunk = createAsyncThunk<boolean, { clientId: string; programId: string }, { rejectValue: ErrorResponse }>(
    "clients/deleteClientProgram",
    async ({ clientId, programId }, thunkAPI) => {
        thunkAPI.dispatch(deleteClientProgram({ clientId, programId }));

        try {
            await api.delete(`/clients/${clientId}/programs/${programId}`);
            return true;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({
                error: true,
                message: "SomethingWentWrong",
                code: error?.response?.data?.code,
                fields: error?.response?.data?.fields,
            });
        }
    }
);

// ─── Program CRUD (order-level) ───

export const createOrderProgramThunk = createAsyncThunk<
    SMSRow,
    { clientId: string; orderId: string; payload: Omit<SMSRow, "id" | "status"> },
    { rejectValue: ErrorResponse }
>(
    "clients/createOrderProgram",
    async ({ clientId, orderId, payload }, { dispatch, rejectWithValue }) => {
        try {
            const response = await api.post<SMSRow>(`/orders/${orderId}/programs`, payload);
            const data = response.data;

            dispatch(addOrderProgram({ clientId, orderId, program: data }));
            return data;
        } catch (error: any) {
            return rejectWithValue({
                error: true,
                message: "SomethingWentWrong",
                code: error?.response?.data?.code,
                fields: error?.response?.data?.fields,
            });
        }
    }
);

export const updateOrderProgramThunk = createAsyncThunk<
    SMSRow,
    { clientId: string; orderId: string; programId: string; payload: Partial<SMSRow> },
    { rejectValue: ErrorResponse }
>(
    "clients/updateOrderProgram",
    async ({ clientId, orderId, programId, payload }, thunkAPI) => {
        // Optimistic update
        thunkAPI.dispatch(editOrderProgram({ clientId, orderId, program: { id: programId, ...payload } as SMSRow }));

        try {
            const response = await api.put<SMSRow>(`/orders/${orderId}/programs/${programId}`, payload);
            const data = response.data;

            thunkAPI.dispatch(editOrderProgram({ clientId, orderId, program: data }));
            return data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({
                error: true,
                message: "SomethingWentWrong",
                code: error?.response?.data?.code,
                fields: error?.response?.data?.fields,
            });
        }
    }
);

export const deleteOrderProgramThunk = createAsyncThunk<boolean, { clientId: string; orderId: string; programId: string }, { rejectValue: ErrorResponse }>(
    "clients/deleteOrderProgram",
    async ({ clientId, orderId, programId }, thunkAPI) => {
        thunkAPI.dispatch(deleteOrderProgram({ clientId, orderId, programId }));

        try {
            await api.delete(`/orders/${orderId}/programs/${programId}`);
            return true;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({
                error: true,
                message: "SomethingWentWrong",
                code: error?.response?.data?.code,
                fields: error?.response?.data?.fields,
            });
        }
    }
);

// ─── Order CRUD ───

export const addOrderThunk = createAsyncThunk<
    Order,
    { clientId: string; payload: Omit<Order, "id" | "smsRows"> },
    { rejectValue: ErrorResponse }
>(
    "clients/addOrder",
    async ({ clientId, payload }, { dispatch, rejectWithValue }) => {
        try {
            const response = await api.post<Order>(`/clients/${clientId}/orders`, payload);
            const data = response.data;

            dispatch(addOrder({ clientId, order: data }));
            return data;
        } catch (error: any) {
            return rejectWithValue({
                error: true,
                message: "SomethingWentWrong",
                code: error?.response?.data?.code,
                fields: error?.response?.data?.fields,
            });
        }
    }
);

export const editOrderThunk = createAsyncThunk<
    Order,
    { clientId: string; orderId: string; payload: Partial<Order> },
    { rejectValue: ErrorResponse }
>(
    "clients/editOrder",
    async ({ clientId, orderId, payload }, thunkAPI) => {
        try {
            const response = await api.put<Order>(`/orders/${orderId}`, payload);
            const data = response.data;

            thunkAPI.dispatch(editOrder({ clientId, order: data }));
            return data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({
                error: true,
                message: "SomethingWentWrong",
                code: error?.response?.data?.code,
                fields: error?.response?.data?.fields,
            });
        }
    }
);

export const deleteOrderThunk = createAsyncThunk<boolean, { clientId: string; orderId: string }, { rejectValue: ErrorResponse }>(
    "clients/deleteOrder",
    async ({ clientId, orderId }, thunkAPI) => {
        try {
            await api.delete(`/orders/${orderId}`);

            thunkAPI.dispatch(deleteOrder({ clientId, orderId }));
            return true;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({
                error: true,
                message: "SomethingWentWrong",
                code: error?.response?.data?.code,
                fields: error?.response?.data?.fields,
            });
        }
    }
);

// ─── SMS Status Toggle (send / mark as sent) ───

export const toggleClientProgramStatusThunk = createAsyncThunk<
    { clientId: string; programId: string; status: SMSStatus },
    { clientId: string; programId: string; status: SMSStatus },
    { rejectValue: ErrorResponse }
>(
    "clients/toggleClientProgramStatus",
    async ({ clientId, programId, status }, thunkAPI) => {
        try {
            await api.put(`/clients/${clientId}/programs/${programId}/status`, { status });

            thunkAPI.dispatch(toggleClientProgramStatus({ clientId, programId, status }));
            return { clientId, programId, status };
        } catch (error: any) {
            return thunkAPI.rejectWithValue({
                error: true,
                message: "SomethingWentWrong",
                code: error?.response?.data?.code,
                fields: error?.response?.data?.fields,
            });
        }
    }
);

export const toggleOrderProgramStatusThunk = createAsyncThunk<
    { clientId: string; orderId: string; programId: string; status: SMSStatus },
    { clientId: string; orderId: string; programId: string; status: SMSStatus },
    { rejectValue: ErrorResponse }
>(
    "clients/toggleOrderProgramStatus",
    async ({ clientId, orderId, programId, status }, thunkAPI) => {
        try {
            await api.put(`/orders/${orderId}/programs/${programId}/status`, { status });

            thunkAPI.dispatch(toggleOrderProgramStatus({ clientId, orderId, programId, status }));
            return { clientId, orderId, programId, status };
        } catch (error: any) {
            return thunkAPI.rejectWithValue({
                error: true,
                message: "SomethingWentWrong",
                code: error?.response?.data?.code,
                fields: error?.response?.data?.fields,
            });
        }
    }
);
