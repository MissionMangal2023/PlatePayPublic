import { useWindowDimensions } from "react-native";
import React, { useContext, useState } from "react";
import { Formik } from "formik";
import { Box, Icon, Input, Text } from "native-base";
const yup = require("yup");
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { sendOTPHandler, verifyOTPHandler } from "../../util/function";
import RegisterationContext from "../../store/RegisterationContext";
import PrimaryButton from "../Utility/PrimaryButton";

const Form1 = ({ scrollTo }) => {
    const { width, height } = useWindowDimensions();
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOTP, setSendingOTP] = useState(false);
    const [verifyingOTP, setVerifyingOTP] = useState(false);

    const [registerationData, setRegisterationData] =
        useContext(RegisterationContext);

    return (
        <Box w={width} px="4">
            <Formik
                initialValues={{
                    name: "",
                    phoneNumber: "",
                    otp: "",
                }}
                onSubmit={(values) => {
                    // console.log(values);
                    setRegisterationData((regData) => ({
                        ...regData,
                        name: values.name,
                        phone_number: values.phoneNumber,
                    }));
                }}
                validationSchema={yup.object().shape({
                    name: yup.string().required("Name is mandatory"),
                    phoneNumber: yup
                        .number("Invalid Phone")
                        .min(
                            1000000000,
                            "Phone number must have minimum 10 digits"
                        )
                        .max(
                            99999999999,
                            "Phone number cannot have more than 11 digits"
                        )
                        .required(),
                    otp: yup
                        .number()
                        .positive()
                        .min(1000, "Invalid OTP")
                        .max(9999, "Invalid OTP"),
                })}
            >
                {({
                    values,
                    handleChange,
                    errors,
                    setFieldTouched,
                    touched,
                    isValid,
                    handleSubmit,
                }) => (
                    <Box>
                        {/* Name Input */}
                        <Box mb="4">
                            <Input
                                value={values.name}
                                onChangeText={handleChange("name")}
                                placeholder="Name"
                                isDisabled={otpSent}
                                InputLeftElement={
                                    <Icon
                                        as={<MaterialIcons name="person" />}
                                        size={5}
                                        ml="2"
                                        color="gray.400"
                                    />
                                }
                                // Common Props
                                size="xl"
                                color="gray.100"
                                rounded="2xl"
                                mb="1"
                                onBlur={() => setFieldTouched("name")}
                            />

                            {touched.name && errors.name && (
                                <Text
                                    color="red.400"
                                    style={{
                                        fontSize: 12,
                                    }}
                                >
                                    {errors.name}
                                </Text>
                            )}
                        </Box>

                        {/* Phone Number Input */}
                        <Box mb="4">
                            <Input
                                value={values.phoneNumber}
                                onChangeText={handleChange("phoneNumber")}
                                placeholder="Phone Number"
                                isDisabled={otpSent}
                                keyboardType="phone-pad"
                                InputLeftElement={
                                    <Icon
                                        as={<Feather name="smartphone" />}
                                        size={5}
                                        ml="2"
                                        color="gray.400"
                                    />
                                }
                                mb="1"
                                size="xl"
                                color="gray.100"
                                rounded="2xl"
                                onBlur={() => setFieldTouched("phoneNumber")}
                            />
                            {touched.phoneNumber && errors.phoneNumber && (
                                <Text
                                    color="red.400"
                                    style={{
                                        fontSize: 12,
                                    }}
                                >
                                    {errors.phoneNumber}
                                </Text>
                            )}
                        </Box>

                        <PrimaryButton
                            bgColor={otpSent ? "#343839" : "white"}
                            _text={
                                otpSent
                                    ? {
                                          color: "gray.300",
                                      }
                                    : {
                                          color: "gray.900",
                                          fontWeight: "600",
                                          fontFamily: "Poppins-Bold",
                                      }
                            }
                            disabled={otpSent}
                            isLoading={sendingOTP}
                            isLoadingText="Sending OTP"
                            onPress={() => {
                                setSendingOTP(true);
                                handleSubmit();
                                sendOTPHandler(
                                    values.phoneNumber,
                                    isValid,
                                    setOtpSent
                                ).finally(() => setSendingOTP(false));
                            }}
                        >
                            Send OTP
                        </PrimaryButton>

                        <Box mb="4">
                            <Input
                                value={values.otp}
                                onChangeText={handleChange("otp")}
                                onBlur={() => setFieldTouched("otp")}
                                placeholder="OTP"
                                size="xl"
                                maxLength={6}
                                color="gray.100"
                                keyboardType="phone-pad"
                                rounded="2xl"
                                isDisabled={!otpSent}
                                InputLeftElement={
                                    <Icon
                                        as={<MaterialIcons name="sms" />}
                                        size={5}
                                        ml="2"
                                        color="gray.400"
                                    />
                                }
                                mb="1"
                            />
                            {touched.otp && errors.otp && (
                                <Text
                                    color="red.400"
                                    style={{
                                        fontSize: 12,
                                        // color: "#FF0D10",
                                    }}
                                >
                                    {errors.otp}
                                </Text>
                            )}
                        </Box>

                        <PrimaryButton
                            bgColor={!otpSent ? "#343839" : "white"}
                            _text={
                                !otpSent
                                    ? {
                                          color: "gray.300",
                                      }
                                    : {
                                          color: "gray.900",
                                          fontWeight: "600",
                                          fontFamily: "Poppins-Bold",
                                      }
                            }
                            isLoading={verifyingOTP}
                            isLoadingText="Verifying OTP"
                            disabled={!otpSent}
                            onPress={() => {
                                setVerifyingOTP(true);
                                handleSubmit();
                                verifyOTPHandler(
                                    values.phoneNumber,
                                    values.otp,
                                    scrollTo
                                ).finally(() => setVerifyingOTP());
                            }}
                        >
                            Verify OTP and Proceed
                        </PrimaryButton>
                    </Box>
                )}
            </Formik>
        </Box>
    );
};

export default Form1;
