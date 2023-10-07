import { NativeBaseProvider } from "native-base";
import React from "react";
import { Provider } from "react-redux";
import store from "../store/store";

const Providers = ({ children }) => {
    return (
        <Provider store={store}>
            <NativeBaseProvider>{children}</NativeBaseProvider>
        </Provider>
    );
};

export default Providers;
