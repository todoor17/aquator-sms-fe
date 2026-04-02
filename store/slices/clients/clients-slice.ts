import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Client, ClientMode, ClientResources, FetchClientsResponse } from "../../../models/clients/clients";
import { SMSRow, SMSStatus } from "../../../models/sms/sms";

interface ClientsState {
    items: Client[];
    quantity: number;
    totalQuantity: number;
    selectedClient: Client | null;
    resources: ClientResources | null;
}

const initialState: ClientsState = {
    items: [],
    quantity: 0,
    totalQuantity: 0,
    selectedClient: null,
    resources: null,
};

function normalizeMode(mode: string | undefined | null): ClientMode {
    if (!mode) return "Automat";
    const lower = mode.toLowerCase();
    if (lower === "manual") return "Manual";
    return "Automat";
}

function withDefaults(client: Client): Client {
    return {
        ...client,
        mode: normalizeMode(client.mode),
        smsEnabled: client.smsEnabled ?? true,
        smsRows: client.smsRows ?? [],
        orders: (client.orders ?? []).map((o) => ({ ...o, smsRows: o.smsRows ?? [] })),
    };
}

const clientsSlice = createSlice({
    name: "clients",
    initialState,
    reducers: {
        setClients: (state, action: PayloadAction<FetchClientsResponse>) => {
            state.items = action.payload.items.map(withDefaults);
            state.quantity = action.payload.quantity;
            state.totalQuantity = action.payload.totalQuantity;
        },
        appendClients: (state, action: PayloadAction<FetchClientsResponse>) => {
            const existingIds = new Set(state.items.map((c) => c.id));
            const newItems = action.payload.items.map(withDefaults).filter((c) => !existingIds.has(c.id));
            state.items = [...state.items, ...newItems];
            state.quantity = action.payload.quantity;
            state.totalQuantity = action.payload.totalQuantity;
        },
        addClient: (state, action: PayloadAction<Client>) => {
            state.items.unshift(withDefaults(action.payload));
            state.quantity += 1;
            state.totalQuantity += 1;
        },
        editClient: (state, action: PayloadAction<Client>) => {
            const index = state.items.findIndex((item) => item.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
            if (state.selectedClient?.id === action.payload.id) {
                state.selectedClient = action.payload;
            }
        },
        deleteClient: (state, action: PayloadAction<{ id: string }>) => {
            state.items = state.items.filter((item) => item.id !== action.payload.id);
            state.quantity -= 1;
            state.totalQuantity -= 1;
        },
        setSelectedClient: (state, action: PayloadAction<Client | null>) => {
            state.selectedClient = action.payload;
        },
        clearClients: (state) => {
            state.items = [];
            state.quantity = 0;
            state.totalQuantity = 0;
            state.selectedClient = null;
        },

        // Resources
        setResources: (state, action: PayloadAction<ClientResources>) => {
            state.resources = action.payload;
        },

        // Mode
        updateClientMode: (state, action: PayloadAction<{ clientId: string; mode: ClientMode }>) => {
            const client = state.items.find((c) => c.id === action.payload.clientId);
            if (client) {
                client.mode = action.payload.mode;
            }
        },

        // SMS enabled
        updateClientSmsEnabled: (state, action: PayloadAction<{ clientId: string; smsEnabled: boolean }>) => {
            const client = state.items.find((c) => c.id === action.payload.clientId);
            if (client) {
                client.smsEnabled = action.payload.smsEnabled;
            }
        },

        // Client-level programs
        addClientProgram: (state, action: PayloadAction<{ clientId: string; program: SMSRow }>) => {
            const client = state.items.find((c) => c.id === action.payload.clientId);
            if (client) {
                client.smsRows.push(action.payload.program);
            }
        },
        editClientProgram: (state, action: PayloadAction<{ clientId: string; program: SMSRow }>) => {
            const client = state.items.find((c) => c.id === action.payload.clientId);
            if (client) {
                const idx = client.smsRows.findIndex((r) => r.id === action.payload.program.id);
                if (idx !== -1) {
                    client.smsRows[idx] = action.payload.program;
                }
            }
        },
        deleteClientProgram: (state, action: PayloadAction<{ clientId: string; programId: string }>) => {
            const client = state.items.find((c) => c.id === action.payload.clientId);
            if (client) {
                client.smsRows = client.smsRows.filter((r) => r.id !== action.payload.programId);
            }
        },

        // Order CRUD
        addOrder: (state, action: PayloadAction<{ clientId: string; order: import("../../../models/orders/orders").Order }>) => {
            const client = state.items.find((c) => c.id === action.payload.clientId);
            if (client) {
                client.orders.unshift(action.payload.order);
            }
        },
        editOrder: (state, action: PayloadAction<{ clientId: string; order: import("../../../models/orders/orders").Order }>) => {
            const client = state.items.find((c) => c.id === action.payload.clientId);
            if (client) {
                const idx = client.orders.findIndex((o) => o.id === action.payload.order.id);
                if (idx !== -1) {
                    client.orders[idx] = action.payload.order;
                }
            }
        },
        deleteOrder: (state, action: PayloadAction<{ clientId: string; orderId: string }>) => {
            const client = state.items.find((c) => c.id === action.payload.clientId);
            if (client) {
                client.orders = client.orders.filter((o) => o.id !== action.payload.orderId);
            }
        },

        // Order-level programs
        addOrderProgram: (state, action: PayloadAction<{ clientId: string; orderId: string; program: SMSRow }>) => {
            const client = state.items.find((c) => c.id === action.payload.clientId);
            if (client) {
                const order = client.orders.find((o) => o.id === action.payload.orderId);
                if (order) {
                    order.smsRows.push(action.payload.program);
                }
            }
        },
        editOrderProgram: (state, action: PayloadAction<{ clientId: string; orderId: string; program: SMSRow }>) => {
            const client = state.items.find((c) => c.id === action.payload.clientId);
            if (client) {
                const order = client.orders.find((o) => o.id === action.payload.orderId);
                if (order) {
                    const idx = order.smsRows.findIndex((r) => r.id === action.payload.program.id);
                    if (idx !== -1) {
                        order.smsRows[idx] = action.payload.program;
                    }
                }
            }
        },
        deleteOrderProgram: (state, action: PayloadAction<{ clientId: string; orderId: string; programId: string }>) => {
            const client = state.items.find((c) => c.id === action.payload.clientId);
            if (client) {
                const order = client.orders.find((o) => o.id === action.payload.orderId);
                if (order) {
                    order.smsRows = order.smsRows.filter((r) => r.id !== action.payload.programId);
                }
            }
        },
        // SMS status toggle
        toggleClientProgramStatus: (state, action: PayloadAction<{ clientId: string; programId: string; status: SMSStatus }>) => {
            const client = state.items.find((c) => c.id === action.payload.clientId);
            if (client) {
                const row = client.smsRows.find((r) => r.id === action.payload.programId);
                if (row) {
                    row.status = action.payload.status;
                }
            }
        },
        toggleOrderProgramStatus: (state, action: PayloadAction<{ clientId: string; orderId: string; programId: string; status: SMSStatus }>) => {
            const client = state.items.find((c) => c.id === action.payload.clientId);
            if (client) {
                const order = client.orders.find((o) => o.id === action.payload.orderId);
                if (order) {
                    const row = order.smsRows.find((r) => r.id === action.payload.programId);
                    if (row) {
                        row.status = action.payload.status;
                    }
                }
            }
        },
    },
});

export const {
    setClients,
    appendClients,
    addClient,
    editClient,
    deleteClient,
    setSelectedClient,
    clearClients,
    setResources,
    updateClientMode,
    updateClientSmsEnabled,
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
} = clientsSlice.actions;

export default clientsSlice.reducer;
