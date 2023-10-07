import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/userSlice";
// import appStateReducer from "../features/appState/appStateSlice";

export default configureStore({
    reducer: {
        user: userReducer,
        // appState: appStateReducer,
    },
});
