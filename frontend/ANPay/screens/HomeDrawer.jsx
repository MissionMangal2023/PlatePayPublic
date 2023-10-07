import {
    DrawerContentScrollView,
    DrawerItem,
    DrawerItemList,
    createDrawerNavigator,
} from "@react-navigation/drawer";
import { Box, HStack, Icon, Image, Text } from "native-base";
import actionButtons, { merchantButtons } from "../util/data/homeActionButtons";
import Home from "./Home";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/users/userSlice";
import axios from "axios";
import { getAccessToken } from "../util/function";
import { AntDesign } from "@expo/vector-icons";

const Drawer = createDrawerNavigator();

export default function HomeDrawer({ navigation }) {
    const dispatch = useDispatch();
    async function logoutHandler() {
        // Make an api call to logout here,
        // this call deletes the device token from database,
        // and also clears the jwt token
        try {
            let response = await axios.post(
                "account/logout/",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${getAccessToken()}`,
                    },
                }
            );
            dispatch(logout());
        } catch (err) {
            console.log("Some Error Occurred While logging out");
        }
    }

    const profileType = useSelector((state) => state.user.profile.account_type);

    let drawerItemsList = actionButtons;
    if (profileType === "m") {
        drawerItemsList = merchantButtons;
    }

    return (
        <Drawer.Navigator
            drawerContent={(props) => (
                <DrawerContentScrollView {...props}>
                    <Box mb="4">
                        <HStack
                            alignItems="center"
                            justifyContent="center"
                            space="2"
                        >
                            {/* <Icon as={FontAwesome5} name="car" size="3xl" /> */}
                            <Image
                                source={require("../assets/icon.png")}
                                alt="Alternate Text"
                                size="xs"
                            />

                            <Text
                                fontSize="3xl"
                                color="gray.100"
                                fontFamily="Poppins-Bold"
                                textAlign="center"
                            >
                                PlatePay
                            </Text>
                        </HStack>
                        <Text
                            fontSize="xs"
                            textAlign="center"
                            maxW="3/4"
                            mx="auto"
                            color="#ccc"
                            fontFamily="Poppins-Regular"
                        >
                            Convenient Payment Solutions - on the go
                        </Text>
                    </Box>

                    <DrawerItemList {...props} />
                    <DrawerItem
                        label="Logout"
                        onPress={logoutHandler}
                        inactiveTintColor="red"
                        icon={({ focussed, size, color }) => (
                            <AntDesign
                                color={color}
                                size={size}
                                name="logout"
                            />
                        )}
                    />
                </DrawerContentScrollView>
            )}
            screenOptions={{
                headerShown: false,
                sceneContainerStyle: {
                    backgroundColor: "#151515",
                },
                drawerStyle: {
                    backgroundColor: "#161616",
                },
                drawerActiveBackgroundColor: "#333",
                drawerActiveTintColor: "white",
                drawerInactiveTintColor: "#aaa",
                // drawerType: "slide",
            }}
        >
            {drawerItemsList.map((actionBtn) => (
                <Drawer.Screen
                    name={actionBtn.verboseName}
                    key={actionBtn.verboseName}
                    component={actionBtn.component || Home}
                    options={{
                        drawerIcon: ({ focussed, color, size }) => (
                            <actionBtn.as
                                name={actionBtn.name}
                                size={size}
                                color={color}
                            />
                        ),
                        unmountOnBlur: true,
                    }}
                />
            ))}
        </Drawer.Navigator>
    );
}
