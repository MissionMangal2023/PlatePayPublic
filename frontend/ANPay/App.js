// React Hooks
import { useCallback, useEffect, useRef, useState } from "react";

// Axios
import axios from "axios";

// Expo Imports
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";
import * as SplashScreen from "expo-splash-screen";
import fonts from "./assets/fonts/fonts";
import * as Notifications from "expo-notifications";

// React Native Imports
import { View, LogBox } from "react-native";
import "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Redux Imports
import store from "./store/store";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { logout } from "./features/users/userSlice";

// Unclassified
import { Box, NativeBaseProvider } from "native-base";
import { StripeProvider } from "@stripe/stripe-react-native";
import { theme } from "./util/data/theme";
import Messages from "./components/ScreenMessages/Messages";
import {
    refreshToken,
    registerForPushNotificationsAsync,
} from "./util/function";
import { setExpoPushToken } from "./features/appState/appStateSlice";
import { navigationRef } from "./util/RootNavigation";
import NavigationScreens from "./components/NavigationScreens";

// Let the splash screen stay visible, until some processing is done
SplashScreen.preventAutoHideAsync();

// ignoring some common error messages
LogBox.ignoreLogs([
    "We can not support a function callback. See Github Issues for details https://github.com/adobe/react-spectrum/issues/2320",
    'Key "cancelled" in the image picker result is deprecated and will be removed in SDK 48, use "canceled" instead',
]);
LogBox.ignoreLogs([
    "Require cycle: util/function.js -> store/store.js -> util/services/ProfileAPI.js -> util/function.js",
    "Require cycles are allowed, but can result in uninitialized values. Consider refactoring to remove the need for a cycle.",
]);

// Axios interceptors to refresh tokens
axios.interceptors.response.use(
    function (response) {
        return response;
    },
    async (err) => {
        const originalConfig = err.config;
        // Token refresh action happens here
        // console.log("Error occured", err.request.responseURL);
        // An error occurred, for an endpoint which was not the refresh endpoint, with a status 401
        if (err.response && err.response.status === 401) {
            if (
                err.request.responseURL !==
                `${baseURL}/account/api/token/refresh/`
            ) {
                if (!originalConfig._retry) {
                    // Do something, call refreshToken() request for example;
                    // return a request

                    originalConfig._retry = true;
                    const rs = await refreshToken();
                    return axios(originalConfig);
                } else {
                    // Even a retry didnt help
                    console.log("Refreshing access token didnt solve it! :(");
                    store.dispatch(logout());
                    return Promise.reject(err);
                }
            } else {
                // The 401 error occured at the refresh token page
                console.log("Refresh token endpoint failed! Login again");
                store.dispatch(logout());
                return true;
            }
        }
        return Promise.reject(err);
    }
);

// Axios config
const baseURL = "http://192.168.1.43:8000";
// const baseURL = "http://192.168.8.84:8000";
// const baseURL = "http://192.168.0.193:8000";
// const baseURL = "http://192.168.0.129:8000";
// const baseURL = "https://cyberverse.co.in";
axios.defaults.baseURL = baseURL;

// React Native Navigation
const Stack = createNativeStackNavigator();
const prefix = Linking.createURL("/");

// Redux Persist
let persistor = persistStore(store);

// Push notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

// A deep link handler, to redirect users to the transactions approval page on notification arrival
const linking = {
    prefixes: [prefix],
    config: {
        // Configuration for linking
        screens: {
            TransactionApproval: {
                path: "/approveTransaction/:transactionId",
                parse: {
                    transactionId: (transactionId) => `${transactionId}`,
                },
                stringify: {
                    transactionId: (transactionId) => transactionId,
                },
            },
        },
    },
    async getInitialURL() {
        // First, you may want to do the default deep link handling
        // Check if app was opened from a deep link
        const url = await Linking.getInitialURL();

        if (url != null) {
            return url;
        }

        // Handle URL from expo push notifications
        const response = await Notifications.getLastNotificationResponseAsync();

        return response?.notification.request.content.data.url;
    },
    subscribe(listener) {
        const onReceiveURL = ({ url }) => listener(url);

        // Listen to incoming links from deep linking
        const eventListenerSubscription = Linking.addEventListener(
            "url",
            onReceiveURL
        );

        // Listen to expo push notifications
        const subscription =
            Notifications.addNotificationResponseReceivedListener(
                (response) => {
                    const url = response.notification.request.content.data.url;

                    // Any custom logic to see whether the URL needs to be handled
                    //...

                    // Let React Navigation handle the URL
                    listener(url);
                }
            );

        return () => {
            // Clean up the event listeners
            eventListenerSubscription.remove();
            subscription.remove();
        };
    },
};

export default function App() {
    // Notifications
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        // had to use store.dispatch, as useDispatch doesnt work in App component as there is no parent <Provider /> to it.
        registerForPushNotificationsAsync().then((token) =>
            store.dispatch(setExpoPushToken(token))
        );

        // Update the app on notification received.
        // Only if the app is foregrounded when a notification is received Expo will run the callback provided
        // through Notifications.addNotificationReceivedListener.
        notificationListener.current =
            Notifications.addNotificationReceivedListener((notification) => {
                setNotification(notification);
                if (
                    notification.request.content.title ===
                    "You've got a new Transaction Request!"
                ) {
                    const { amount, transactionId } =
                        notification.request.content.data;

                    console.log(`${prefix}approveTransaction/${transactionId}`);
                    Linking.openURL(
                        `${prefix}approveTransaction/${transactionId}`
                    );
                }
            });

        // Update the app on notification clicked.
        // When the user clicks on a notification Expo will launch the app and run the callback provided
        // through Notifications.addNotificationResponseReceivedListener
        responseListener.current =
            Notifications.addNotificationResponseReceivedListener(
                (response) => {
                    if (
                        response.notification.request.content.title ===
                        "You've got a new Transaction Request!"
                    ) {
                        const { amount, transactionId } =
                            response.notification.request.content.data;
                        console.log(
                            `${prefix}approveTransaction/${transactionId}`
                        );
                        Linking.openURL(
                            `${prefix}approveTransaction/${transactionId}`
                        );
                    }
                }
            );

        // Unsubscribing notification handlers
        return () => {
            Notifications.removeNotificationSubscription(
                notificationListener.current
            );
            Notifications.removeNotificationSubscription(
                responseListener.current
            );
        };
    }, []);

    // Fonts
    let res = {};
    for (let font in fonts) {
        for (let fontStyles of fonts[font]) {
            res = { ...res, ...fontStyles };
        }
    }
    const [fontsLoaded] = useFonts(res);
    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);
    if (!fontsLoaded) {
        return null;
    }

    return (
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <NativeBaseProvider theme={theme}>
                    <StripeProvider
                        publishableKey="pk_test_51Mzz4WSFN9O3EHguRkz5PiBAd637u53KZFWJJ9iGnRUMPCY1sAkdyEf0duWhLb2eyU9xPGbBKyBZcGndUfaq5f6L00sTbKnvio"
                        urlScheme="platepay"
                        merchantIdentifier="merchant.com.PlatePay"
                    >
                        <NavigationContainer
                            linking={linking}
                            ref={navigationRef}
                        >
                            <View
                                onLayout={onLayoutRootView}
                                style={{ flex: 1 }}
                            >
                                <StatusBar style="light" />

                                <Box bgColor="#151718" flex="1">
                                    <Messages />
                                    <SafeAreaView
                                        style={{
                                            flex: 1,
                                        }}
                                    >
                                        {/* Navigator Screens */}
                                        <NavigationScreens Stack={Stack} />
                                    </SafeAreaView>
                                </Box>
                            </View>
                        </NavigationContainer>
                    </StripeProvider>
                </NativeBaseProvider>
            </PersistGate>
        </Provider>
    );
}
