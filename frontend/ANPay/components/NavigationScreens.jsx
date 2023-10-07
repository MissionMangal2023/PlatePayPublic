import React from "react";
import { useSelector } from "react-redux";
import AddNumberPlate from "../screens/AddNumberPlate/AddNumberPlate";
import FormPage1 from "../screens/AddNumberPlate/FormPage1";
import NumberPlateDetail from "../screens/NumberPlateDetail";
import TransactionDetail from "../screens/TransactionDetail";
import TransactionApproval from "../screens/TransactionApproval";
import Profile from "../screens/Profile";
import HomeDrawer from "../screens/HomeDrawer";
import Registeration from "../screens/Registeration";
import PreAuthSettings from "../screens/PreAuthSettings";
import TestScreen from "../screens/TestScreen";
import Login from "../screens/Login";
import OutletList from "../screens/OutletList";
import OutletDetail from "../screens/OutletDetail";

const NavigationScreens = ({ Stack }) => {
    const user = useSelector((state) => state.user.user);
    const isSignedIn = user !== null;
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    backgroundColor: "transparent",
                },
                animation: "slide_from_right",
            }}
        >
            {/* if user is not logged in */}
            {!isSignedIn ? (
                <>
                    <Stack.Screen name="Login" component={Login} />
                    <Stack.Screen
                        name="Registeration"
                        component={Registeration}
                    />
                </>
            ) : (
                <>
                    <Stack.Screen name="HomeDrawer" component={HomeDrawer} />
                    <Stack.Screen name="TestScreen" component={TestScreen} />
                    <Stack.Screen name="Profile" component={Profile} />

                    <Stack.Screen
                        name="AddNumberPlate"
                        component={AddNumberPlate}
                    />
                    <Stack.Screen
                        name="PreAuthSettings"
                        component={PreAuthSettings}
                    />
                    <Stack.Screen
                        name="AddNumberPlateForm1"
                        component={FormPage1}
                    />
                    <Stack.Screen
                        name="NumberPlateDetail"
                        component={NumberPlateDetail}
                    />
                    <Stack.Screen
                        name="TransactionDetail"
                        component={TransactionDetail}
                    />
                    <Stack.Screen
                        name="TransactionApproval"
                        component={TransactionApproval}
                    />
                    <Stack.Screen name="OutletList" component={OutletList} />
                    <Stack.Screen
                        name="OutletDetail"
                        component={OutletDetail}
                    />
                </>
            )}
        </Stack.Navigator>
    );
};

export default NavigationScreens;
