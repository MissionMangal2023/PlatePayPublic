import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    loading: false,
    isModalOpen: false,
    messages: [],
    expoPushToken: "",
};

const appStateSlice = createSlice({
    name: "appState",
    initialState,
    reducers: {
        toggleLoading: (state) => {
            state.loading = !state.loading;
        },
        setModalState: (state, action) => {
            if (action.payload === "open") {
                state.isModalOpen = true;
            } else {
                state.isModalOpen = false;
            }
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        clearMessages: (state) => {
            state.messages = [];
            console.log("Messages cleared!");
        },
        setExpoPushToken: (state, action) => {
            state.expoPushToken = action.payload;
        },
    },
});

export const {
    toggleLoading,
    setModalState,
    addMessage,
    clearMessages,
    setExpoPushToken,
} = appStateSlice.actions;
export default appStateSlice.reducer;
