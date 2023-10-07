import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useContext } from "react";
import { Button, Icon } from "@rneui/themed";
import Title from "../components/Title";
import CustomInput from "../components/CustomInput";
import { ScreenContext } from "../store/ScreenContext";
import OTPTextInput from "react-native-otp-textinput";
import Stack from "../components/Stack";
import { Text as BaseText } from "@rneui/base";

const OTPVerification = ({ navigation }) => {
    const setScreen = useContext(ScreenContext);

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1, margin: 15 }}
        >
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
                        Step 02/02
                    </Text>
                    <Text
                        style={{ color: "#ccc", fontFamily: "Poppins-Regular" }}
                    >
                        OTP Verification
                    </Text>
                </View>
            </Stack>

            <View
                style={{
                    flex: 1,
                }}
            >
                <Title
                    title="Verify OTP"
                    textStyles={{
                        fontSize: 24,
                    }}
                />

                <BaseText
                    style={{
                        color: "#ccc",
                        fontSize: 18,
                        fontFamily: "Poppins-Regular",
                    }}
                >
                    Enter the OTP sent to your Email ID
                </BaseText>
                {/* <Title title="Verify OTP" /> */}

                <View>
                    <View style={{ marginVertical: 10 }}>
                        <View style={{ marginBottom: 30 }}>
                            <OTPTextInput
                                textInputStyle={{ color: "#ccc" }}
                                // inputCount={6}
                            />
                        </View>
                    </View>

                    <Button
                        title="Verify OTP"
                        onPress={() => navigation.navigate("Login")}
                        radius={10}
                        size="lg"
                        raised
                    />
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
        </ScrollView>
    );
};

export default OTPVerification;

const styles = StyleSheet.create({});
