import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import React, { useContext, useState } from "react";
import CustomInput from "../components/CustomInput";
import PasswordInput from "../components/PasswordInput";
import { Button, CheckBox, Dialog, Icon, Input, Text } from "@rneui/themed";
import Title from "../components/Title";
import Container from "../components/Container";
import Stack from "../components/Stack";
import axios from "axios";
import Loading from "../components/Loading";
import {
    getIconForEmailInput,
    getIconForUsernameInput,
    getRegisterBody,
    registerationDataValid,
} from "../util/function";
import { useDispatch } from "react-redux";
import { login } from "../features/users/userSlice";

function validateEmail(value) {
    return value.match(
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    );
}

const Registeration = ({ navigation }) => {
    let cancelToken;
    let dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [registerationData, setRegisterationData] = useState({
        username: {
            value: null,
            isValid: false,
            errorMsg: "",
        },
        email: {
            value: null,
            isValid: false,
            errorMsg: "",
        },
        password: {
            value: null,
            isValid: false,
            errorMsg: "",
        },
        password2: {
            value: null,
            isValid: false,
            errorMsg: "",
        },
        termsAccept: false,
    });

    async function usernameHandler(value) {
        setRegisterationData((registerationData) => ({
            ...registerationData,
            username: {
                ...registerationData.username,
                isValid: "loading",
                value,
            },
        }));

        let newState = {};

        if (typeof cancelToken != typeof undefined) {
            cancelToken.cancel(
                "New Key Press Found, so cancelling old request"
            );
        }
        cancelToken = axios.CancelToken.source();

        try {
            let response = await axios.get(`api/v1/${value}/exist/`, {
                cancelToken: cancelToken.token,
            });
            if (!response.data.exists) {
                newState = {
                    value,
                    isValid: true,
                    errorMsg: "",
                };
            } else {
                newState = {
                    value,
                    isValid: false,
                    errorMsg: "User with that Username already exists!",
                };
            }
        } catch (err) {
            console.log(
                "Error in Registeration Page, Verify duplicate Username: ",
                err
            );
        }

        setRegisterationData((registerationData) => ({
            ...registerationData,
            username: newState,
        }));
    }

    async function emailHandler(value) {
        if (!validateEmail(value)) {
            setRegisterationData((registerationData) => ({
                ...registerationData,
                email: {
                    isValid: false,
                    errorMsg: "Invalid Email Format",
                    value,
                },
            }));
            return;
        }

        setRegisterationData((registerationData) => ({
            ...registerationData,
            email: {
                ...registerationData.email,
                isValid: "loading",
                value,
            },
        }));

        let newState = {};

        if (typeof cancelToken != typeof undefined) {
            cancelToken.cancel(
                "Email: New Key Press Found, so cancelling old request"
            );
        }
        cancelToken = axios.CancelToken.source();

        try {
            let response = await axios.get(`api/v1/${value}/emailexist/`, {
                cancelToken: cancelToken.token,
            });
            if (!response.data.exists) {
                newState = {
                    value,
                    isValid: true,
                    errorMsg: "",
                };
            } else {
                newState = {
                    value,
                    isValid: false,
                    errorMsg: "User with that Email already exists!",
                };
            }
        } catch (err) {
            console.log(
                "Error in Registeration Page, Verify duplicate Username: ",
                err
            );
        }

        setRegisterationData((registerationData) => ({
            ...registerationData,
            email: newState,
        }));
    }

    async function handleSubmit(e) {
        if (!registerationDataValid(registerationData)) {
            Alert.alert("Invalid Data!");
            return;
        }

        setIsLoading(true);
        try {
            let response = await axios.post(
                "account/register/",
                getRegisterBody(registerationData)
            );
            console.log(response.data);
            setIsLoading(false);
            dispatch(
                login({
                    access_token: response.data.token.access,
                    refresh_token: response.data.token.refresh,
                    user: {
                        username: response.data.username,
                        email: response.data.email,
                    },
                })
            );
        } catch (err) {
            setIsLoading(false);
            console.log(err);
        } finally {
            navigation.navigate("Home");
        }
    }

    return (
        <Container>
            <Loading isLoading={isLoading} />
            <Stack spacing="space-between" style={{ marginBottom: 10 }}>
                <View>
                    <Button
                        title="Back"
                        type="clear"
                        color="#ccc"
                        iconPosition="left"
                        onPress={() => navigation.goBack()}
                        icon={
                            <Icon
                                name="left"
                                type="antdesign"
                                color="#ccc"
                                size={14}
                                style={{ marginRight: 4 }}
                            />
                        }
                    />
                </View>
                <View
                    style={{
                        alignItems: "flex-end",
                    }}
                >
                    <Text
                        style={{ color: "#ccc", fontFamily: "Poppins-Regular" }}
                    >
                        Step 01/02
                    </Text>
                    <Text
                        style={{ color: "#ccc", fontFamily: "Poppins-Regular" }}
                    >
                        Personal Info
                    </Text>
                </View>
            </Stack>

            <View
                style={{
                    flex: 1,
                }}
            >
                <Title
                    title="Register Individual Account"
                    containerStyles={{
                        marginVertical: 18,
                        alignItems: "center",
                    }}
                    textStyles={{
                        fontSize: 28,
                        textAlign: "center",
                    }}
                />

                <View>
                    <View style={{ marginVertical: 10 }}>
                        <CustomInput
                            title="Username"
                            rightIcon={getIconForUsernameInput(
                                registerationData
                            )}
                            errorMessage={registerationData.username.errorMsg}
                            value={registerationData.username.value}
                            onChangeText={usernameHandler}
                        />
                        {/* <Input keyboardType="phone-pad"></Input> */}
                        {/* <CustomInput
                            keyboardType="number-pad"
                            title="Phone Number"
                            keyboard
                            value={registerationData.username}
                            onChangeText={(value) =>
                                setRegisterationData((registerationData) => ({
                                    ...registerationData,
                                    username: value,
                                }))
                            }
                        /> */}
                        <CustomInput
                            title="Email"
                            value={registerationData.email.value}
                            errorMessage={registerationData.email.errorMsg}
                            rightIcon={getIconForEmailInput(registerationData)}
                            onChangeText={emailHandler}
                        />
                        <PasswordInput
                            title="Password"
                            value={registerationData.password.value}
                            errorMessage={registerationData.password.errorMsg}
                            onChangeText={(value) =>
                                setRegisterationData((registerationData) => ({
                                    ...registerationData,
                                    password: {
                                        value,
                                        isValid: true,
                                        errorMsg: "",
                                    },
                                }))
                            }
                        />
                        <PasswordInput
                            title="Password"
                            value={registerationData.password2.value}
                            errorMessage={registerationData.password2.errorMsg}
                            onChangeText={(value) =>
                                setRegisterationData((registerationData) => ({
                                    ...registerationData,
                                    password2: {
                                        value,
                                        isValid:
                                            value ===
                                            registerationData.password.value,
                                        errorMsg:
                                            value !==
                                                registerationData.password
                                                    .value &&
                                            "Passwords do not match!",
                                    },
                                }))
                            }
                        />
                        <CheckBox
                            checked={registerationData.termsAccept}
                            onPress={() =>
                                setRegisterationData((registerationData) => ({
                                    ...registerationData,
                                    termsAccept: !registerationData.termsAccept,
                                }))
                            }
                            title="I agree to the terms and conditions"
                            center
                            checkedColor="pink"
                            textStyle={{ color: "#ccc" }}
                            containerStyle={{
                                backgroundColor: "transparent",
                            }}
                        />
                    </View>

                    <Button
                        title="Register"
                        onPress={handleSubmit}
                        radius={10}
                        size="lg"
                        raised
                    />

                    <Stack containerStyle={{ marginTop: 20 }}>
                        <Text>Already have an account? </Text>
                        <View>
                            <Button
                                type="clear"
                                title="Log In"
                                size="sm"
                                onPress={() => navigation.navigate("Login")}
                                buttonStyle={{
                                    padding: 0,
                                }}
                                titleStyle={{
                                    fontFamily: "Poppins-Regular",
                                    fontSize: 14,
                                }}
                            />
                        </View>
                    </Stack>
                </View>
            </View>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignContent: "center",
                    padding: 10,
                    marginTop: 20,
                }}
            >
                <Icon name="lock" color="#aaa" size={14} />
                <Text style={{ color: "#aaa", marginLeft: 10, fontSize: 12 }}>
                    Your info is safely secured
                </Text>
            </View>
        </Container>
    );
};

export default Registeration;

const styles = StyleSheet.create({});
