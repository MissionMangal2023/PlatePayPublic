import { StatusBar } from "expo-status-bar";
import { LogBox, StyleSheet, Text, View } from "react-native";
import { Provider } from "react-redux";
import Providers from "./components/Providers";
import NavigationScreens from "./components/NavigationScreens";
import axiosInstance from "./utils/axiosInstance";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import fonts from "./assets/fonts/fonts";
import { useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";

LogBox.ignoreLogs([
    "Constants.platform.ios.model has been deprecated in favor of expo-device's Device.modelName property. This API will be removed in SDK 45.",
    "In React 18, SSRProvider is not necessary and is a noop. You can remove it from your app.",
]);

export default function App() {
    // Fonts loading
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
        <Providers>
            <NavigationContainer>
                <View onLayout={onLayoutRootView} style={{ flex: 1 }}>
                    <NavigationScreens />
                </View>
            </NavigationContainer>
        </Providers>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
});
