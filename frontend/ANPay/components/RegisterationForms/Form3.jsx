import { Alert, useWindowDimensions } from "react-native";
import React, { useContext, useState } from "react";
import { Formik } from "formik";
import { addMessage } from "../../features/appState/appStateSlice";

import {
    Box,
    Button,
    Checkbox,
    HStack,
    Icon,
    Input,
    Pressable,
    Radio,
    Text,
} from "native-base";
const yup = require("yup");
import { FontAwesome } from "@expo/vector-icons";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import RegisterationContext from "../../store/RegisterationContext";
import { getLocation, registerHandler } from "../../util/function";
import { useDispatch } from "react-redux";
import SecondaryButton from "../Utility/SecondaryButton";
import PrimaryButton from "../Utility/PrimaryButton";

const Form3 = ({ scrollBack, navigation }) => {
    let dispatch = useDispatch();
    const { width, height } = useWindowDimensions();
    const [registerationData, setRegisterationData, setIsLoading] =
        useContext(RegisterationContext);
    const [date, setDate] = useState(
        new Date(new Date(Date.now()).toISOString().slice(0, 10))
    );

    // Functions used for opening and setting date time picker
    const showMode = (currentMode, dobHandler) => {
        DateTimePickerAndroid.open({
            value: date,
            onChange: (event, selectedDate) => {
                const currentDate = selectedDate;
                let res = currentDate.toISOString().slice(0, 10);
                dobHandler(res);
            },
            mode: currentMode,
            is24Hour: true,
        });
    };
    const showDatepicker = (dobHandler) => {
        showMode("date", dobHandler);
    };

    return (
        <Box w={width} px="4">
            <Formik
                initialValues={{
                    address: "",
                    date_of_birth: "",
                    gender: "Male",
                    termsAccept: false,
                }}
                onSubmit={async (values) => {
                    const finalValues = {
                        ...registerationData,
                        address: values.address,
                        date_of_birth:
                            values.date_of_birth === ""
                                ? null
                                : values.date_of_birth,
                        gender: values.gender,
                    };

                    setRegisterationData((regData) => {
                        return {
                            ...regData,
                            address: values.address,
                            date_of_birth:
                                values.date_of_birth === ""
                                    ? null
                                    : values.date_of_birth,
                            gender: values.gender,
                        };
                    });

                    if (!values.termsAccept) {
                        return Alert.alert(
                            "Please accept the terms and conditions to proceed"
                        );
                    }

                    let response = await registerHandler(
                        setIsLoading,
                        finalValues
                    );

                    console.log(response);
                    if (response && response.status === 201) {
                        console.log(response.status);
                        dispatch(
                            addMessage({
                                title: "Registeration Success!",
                                status: "success",
                            })
                        );
                        navigation.navigate("Login", {
                            username: finalValues.username,
                            password: finalValues.password,
                        });
                    } else {
                        dispatch(
                            addMessage({
                                title: "An error occured while creating an account!",
                                status: "danger",
                            })
                        );
                    }
                }}
                validationSchema={yup.object().shape({
                    address: yup.string(),
                    date_of_birth: yup.date(),
                    termsAccept: yup
                        .boolean()
                        .required("Please accept the terms and conditions")
                        .oneOf(
                            [true],
                            "Please accept the terms and conditions"
                        ),
                    gender: yup.mixed().oneOf(["Male", "Female", "Other"]),
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
                    setFieldValue,
                }) => (
                    <Box>
                        <Box mb="4">
                            <Pressable
                                onPress={() =>
                                    showDatepicker(
                                        handleChange("date_of_birth")
                                    )
                                }
                            >
                                <Input
                                    value={values.date_of_birth}
                                    editable={false}
                                    onBlur={() =>
                                        setFieldTouched("date_of_birth")
                                    }
                                    placeholder="Date Of Birth"
                                    size="xl"
                                    color="gray.100"
                                    rounded="2xl"
                                    InputLeftElement={
                                        <Icon
                                            as={FontAwesome}
                                            size={5}
                                            name="birthday-cake"
                                            ml="2"
                                            color="gray.400"
                                        />
                                    }
                                    mb="1"
                                />
                            </Pressable>
                            {touched.date_of_birth && errors.date_of_birth && (
                                <Text
                                    color="red.400"
                                    style={{
                                        fontSize: 12,
                                        // color: "#FF0D10",
                                    }}
                                >
                                    {errors.date_of_birth}
                                </Text>
                            )}
                        </Box>

                        <Text color="gray.400" mb="4">
                            We store your default home location, to be able to
                            better protect you from fraud. This is completely
                            optional. You can press the Get Location button to
                            set your current location as the home location.
                        </Text>

                        <Box mb="4">
                            <Input
                                value={values.address}
                                placeholder="Address"
                                color="gray.100"
                                rounded="2xl"
                                onChangeText={handleChange("address")}
                                onBlur={() => setFieldTouched("address")}
                                mb="1"
                                size="xl"
                                InputRightElement={
                                    <Button
                                        size="md"
                                        rounded="none"
                                        h="full"
                                        bgColor="gray.600"
                                        onPress={() => {
                                            setFieldValue(
                                                "address",
                                                "Fetching Location..."
                                            );
                                            getLocation().then((latlong) => {
                                                setFieldValue(
                                                    "address",
                                                    latlong
                                                );
                                            });
                                        }}
                                    >
                                        Get Location
                                    </Button>
                                }
                            />

                            {touched.address && errors.address && (
                                <Text
                                    color="red.400"
                                    style={{
                                        fontSize: 12,
                                        // color: "#FF0D10",
                                    }}
                                >
                                    {errors.address}
                                </Text>
                            )}
                        </Box>

                        <Box mb="4">
                            <Radio.Group
                                name="gender"
                                accessibilityLabel="Gender"
                                value={values.gender}
                                onChange={handleChange("gender")}
                                placeholder="Gender"
                                onBlur={() => setFieldTouched("gender")}
                                size="xl"
                                rounded="2xl"
                            >
                                <HStack space="4" alignItems="center">
                                    <Radio
                                        value="Male"
                                        my={1}
                                        _text={{
                                            color: "gray.100",
                                        }}
                                    >
                                        Male
                                    </Radio>
                                    <Radio
                                        _text={{
                                            color: "gray.100",
                                        }}
                                        value="Female"
                                        my={1}
                                    >
                                        Female
                                    </Radio>
                                    <Radio
                                        _text={{
                                            color: "gray.100",
                                        }}
                                        value="Other"
                                        my={1}
                                    >
                                        Other
                                    </Radio>
                                </HStack>
                            </Radio.Group>
                            {touched.password2 && errors.password2 && (
                                <Text
                                    color="red.400"
                                    style={{
                                        fontSize: 12,
                                    }}
                                >
                                    {errors.password2}
                                </Text>
                            )}
                        </Box>

                        <Box mb="8" alignItems="center">
                            <HStack space={6}>
                                <Checkbox
                                    shadow={2}
                                    value="test"
                                    accessibilityLabel="I accept terms and conditions"
                                    isChecked={values.termsAccept}
                                    onChange={(isSelected) => {
                                        setFieldValue(
                                            "termsAccept",
                                            isSelected
                                        );
                                    }}
                                    _text={{
                                        color: "gray.100",
                                    }}
                                >
                                    I accept the terms & conditions
                                </Checkbox>
                            </HStack>
                        </Box>

                        {/* Action Buttons */}
                        <Box>
                            <SecondaryButton onPress={scrollBack}>
                                Previous
                            </SecondaryButton>

                            <PrimaryButton
                                onPress={() => {
                                    handleSubmit();
                                }}
                            >
                                Register
                            </PrimaryButton>
                        </Box>
                    </Box>
                )}
            </Formik>
        </Box>
    );
};

export default Form3;
