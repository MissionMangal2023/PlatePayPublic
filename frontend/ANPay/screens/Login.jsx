import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert } from "react-native";
import { Icon, Input, Pressable, Box } from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import FullScreenOverlay from "../components/FullScreenOverlay";
import SpinnerWithText from "../components/SpinnerWithText";
import { loginHandler } from "../util/function";
import PrimaryButton from "../components/Utility/PrimaryButton";
import SecondaryButton from "../components/Utility/SecondaryButton";
import HugeText from "../components/Typography/HugeText";
import SecondaryText from "../components/Typography/SecondaryText";
import TextWithButtonLink from "../components/Typography/TextWithButtonLink";
import { useRoute } from "@react-navigation/native";

const Login = ({ navigation }) => {
    let dispatch = useDispatch();
    const expoPushToken = useSelector((state) => state.appState.expoPushToken);
    const [isLoading, setIsLoading] = useState(false);
    const [show, setShow] = useState(false);

    const route = useRoute();
    const initialData = {
        username: "",
        password: "",
    };

    useEffect(() => {
        // If we reach login page from the registeration page,
        // fetch the credentials of the just signed up user
        // and populate the fields
        if (route.params) {
            setLoginFormData({
                username: route.params.username,
                password: route.params.password,
            });
        }
    }, []);

    const [loginFormData, setLoginFormData] = useState(initialData);

    async function handleSubmit(e) {
        if (!(loginFormData.username && loginFormData.password)) {
            Alert.alert("Invalid Data!");
            return;
        }

        let response = await loginHandler(
            loginFormData,
            expoPushToken,
            setIsLoading,
            dispatch
        );
        if (response.status === 200) {
            navigation.navigate("HomeDrawer");
        } else if (response.status === 401) {
            Alert.alert("No account with those credentials exists!");
        } else {
            Alert.alert("Some error has occurred!");
        }
    }

    return (
        <>
            <FullScreenOverlay isShown={isLoading}>
                <SpinnerWithText title={`Sit Tight!\n We are Logging You In`} />
            </FullScreenOverlay>

            <Box m="4">
                <HugeText title="Login" />
                <SecondaryText title="Please sign in to continue" />

                {/* Username and Password Input */}
                <Box my="10">
                    <Input
                        size="xl"
                        color="gray.100"
                        value={loginFormData.username}
                        rounded="2xl"
                        onChangeText={(value) =>
                            setLoginFormData((loginFormData) => ({
                                ...loginFormData,
                                username: value,
                            }))
                        }
                        InputLeftElement={
                            <Icon
                                as={<MaterialIcons name="person" />}
                                size={5}
                                ml="2"
                                color="gray.400"
                            />
                        }
                        mb="8"
                        placeholder="Name"
                    />

                    <Input
                        type={show ? "text" : "password"}
                        size="xl"
                        color="gray.200"
                        value={loginFormData.password}
                        rounded="2xl"
                        onChangeText={(value) =>
                            setLoginFormData((loginFormData) => ({
                                ...loginFormData,
                                password: value,
                            }))
                        }
                        InputRightElement={
                            <Pressable onPress={() => setShow(!show)}>
                                <Icon
                                    as={
                                        <MaterialIcons
                                            name={
                                                show
                                                    ? "visibility"
                                                    : "visibility-off"
                                            }
                                        />
                                    }
                                    size={5}
                                    mr="2"
                                    color="gray.400"
                                />
                            </Pressable>
                        }
                        placeholder="Password"
                    />
                </Box>

                {/* Action buttons */}
                <Box mb="6">
                    <SecondaryButton
                        onPress={() => {
                            setLoginFormData({
                                username: "",
                                password: "",
                            });
                        }}
                    >
                        Reset Input
                    </SecondaryButton>
                    <PrimaryButton onPress={handleSubmit}>Login</PrimaryButton>
                </Box>

                {/* Redirect to signup page */}
                <TextWithButtonLink
                    text="Don't have an account?"
                    buttonText="Sign Up"
                    onPress={() => navigation.navigate("Registeration")}
                />
            </Box>
        </>
    );
};

export default Login;
