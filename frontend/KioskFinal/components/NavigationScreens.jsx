import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import LoginScreen from "../screens/LoginScreen";
import HomePage from "../screens/HomePage";
import Dumps from "../screens/Dumps";
import AmountPage from "../screens/AmountPage";
import TakePicture from "../screens/TakePicture";

const Stack = createStackNavigator();

const NavigationScreens = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="HomePage" component={HomePage} />
            {/* <Stack.Screen name="TakePicture" component={TakePicture} /> */}
            <Stack.Screen name="Dumps" component={Dumps} />
            <Stack.Screen name="AmountPage" component={AmountPage} />

            {/* <Stack.Screen name="SuccessPage" component={SuccessPage} />
              <Stack.Screen name="FailPage" component={FailPage} /> */}
        </Stack.Navigator>
    );
};

export default NavigationScreens;
