import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    access_token: null,
    refresh_token: null,
    user: null,
    profile: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        login: (state, action) => {
            let { access_token, refresh_token, user, profile } = action.payload;
            state.access_token = access_token;
            state.refresh_token = refresh_token;
            state.user = user;
            state.profile = profile;
        },
        logout: (state) => {
            // state = initialState;
            let { access_token, refresh_token, user, profile } = initialState;
            state.access_token = access_token;
            state.refresh_token = refresh_token;
            state.user = user;
            state.profile = profile;
        },
        updateProfile: (state, action) => {
            let { profile } = action.payload;
            state.profile = { ...state.profile, ...profile };
        },
    },
});

export const { login, logout, updateProfile } = userSlice.actions;
export default userSlice.reducer;
