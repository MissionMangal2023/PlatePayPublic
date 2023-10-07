import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/users/userSlice";
import appStateReducer from "../features/appState/appStateSlice";
import { persistReducer } from "redux-persist";
// import storage from "redux-persist/lib/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { profileApi } from "../util/services/ProfileAPI";

let rootReducer = combineReducers({
    user: userReducer,
    appState: appStateReducer,
});

let persistConfig = {
    key: "root",
    storage: AsyncStorage,
};

let persistedReducer = persistReducer(persistConfig, rootReducer);

export default configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

// export default configureStore({
//     reducer: {
//         user: userReducer,
//         appState: appStateReducer,
//     },
// });
