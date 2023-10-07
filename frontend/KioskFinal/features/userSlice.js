import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    access_token: null,
    refresh_token: null,
    device_id: null,
    machine_status: null,
    outlet_name: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        login: (state, action) => {
            let {
                access_token,
                refresh_token,
                device_id,
                machine_status,
                outlet_name,
            } = action.payload;
            state.access_token = access_token;
            state.refresh_token = refresh_token;
            state.device_id = device_id;
            state.machine_status = machine_status;
            state.outlet_name = outlet_name;
        },
        logout: (state) => {
            state = initialState;
        },
    },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
