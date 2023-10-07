import { useWindowDimensions } from "react-native";
import React, { useContext } from "react";
import { Formik } from "formik";
import { Box, Icon, Input, Text } from "native-base";
const yup = require("yup");
import { MaterialIcons } from "@expo/vector-icons";
import RegisterationContext from "../../store/RegisterationContext";
import PrimaryButton from "../Utility/PrimaryButton";
import { checkUserNameExists } from "../../util/function";

const Form1 = ({ scrollTo }) => {
    const { width, height } = useWindowDimensions();
    const [registerationData, setRegisterationData] =
        useContext(RegisterationContext);
    var cancelToken;

    yup.addMethod(yup.string, "checkUserNameExists", checkUserNameExists);

    return (
        <Box w={width} px="4">
            <Formik
                initialValues={{
                    username: "",
                    email: "",
                    password: "",
                    password2: "",
                }}
                // validateOnChange={false}
                onSubmit={(values) => {
                    setRegisterationData((regData) => ({
                        ...regData,
                        username: values.username,
                        password: values.password,
                        email: values.email,
                    }));
                }}
                validationSchema={yup.object().shape({
                    username: yup
                        .string()
                        .required("Please, provide your name!")
                        .test(
                            "unique username",
                            "Username already exists",
                            checkUserNameExists
                        ),
                    email: yup.string().email().required(),
                    password: yup
                        .string()
                        .min(
                            8,
                            "Password should have a minimum of 8 characters"
                        )
                        .max(10, "Password should not exceed 10 chars.")
                        .required(),
                    password2: yup
                        .string()
                        .oneOf(
                            [yup.ref("password"), null],
                            "Passwords don't match!"
                        )
                        .required(),
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
                        <Box mb="4">
                            <Input
                                value={values.name}
                                // style={inputStyle}
                                onChangeText={handleChange("username")}
                                onBlur={() => setFieldTouched("username")}
                                placeholder="Username"
                                size="xl"
                                color="gray.100"
                                rounded="2xl"
                                InputLeftElement={
                                    <Icon
                                        as={<MaterialIcons name="person" />}
                                        size={5}
                                        ml="2"
                                        color="gray.400"
                                    />
                                }
                                mb="1"
                            />
                            {touched.username && errors.username && (
                                <Text
                                    color="red.400"
                                    style={{
                                        fontSize: 12,
                                        // color: "#FF0D10",
                                    }}
                                >
                                    {errors.username}
                                </Text>
                            )}
                        </Box>

                        <Box mb="4">
                            <Input
                                value={values.email}
                                onChangeText={handleChange("email")}
                                onBlur={() => setFieldTouched("email")}
                                placeholder="E-mail"
                                size="xl"
                                color="gray.100"
                                rounded="2xl"
                                InputLeftElement={
                                    <Icon
                                        as={<MaterialIcons name="email" />}
                                        size={5}
                                        ml="2"
                                        color="gray.400"
                                    />
                                }
                                mb="1"
                            />
                            {touched.email && errors.email && (
                                <Text
                                    color="red.400"
                                    style={{
                                        fontSize: 12,
                                        // color: "#FF0D10",
                                    }}
                                >
                                    {errors.email}
                                </Text>
                            )}
                        </Box>

                        <Box mb="4">
                            <Input
                                value={values.password}
                                // style={inputStyle}
                                onChangeText={handleChange("password")}
                                placeholder="Password"
                                onBlur={() => setFieldTouched("password")}
                                secureTextEntry={true}
                                size="xl"
                                color="gray.100"
                                rounded="2xl"
                                InputLeftElement={
                                    <Icon
                                        as={<MaterialIcons name="lock" />}
                                        size={5}
                                        ml="2"
                                        color="gray.400"
                                    />
                                }
                                mb="1"
                            />
                            {touched.password && errors.password && (
                                <Text
                                    color="red.400"
                                    style={{
                                        fontSize: 12,
                                        // color: "#FF0D10",
                                    }}
                                >
                                    {errors.password}
                                </Text>
                            )}
                        </Box>
                        <Box mb="8">
                            <Input
                                value={values.password2}
                                // style={inputStyle}
                                onChangeText={handleChange("password2")}
                                placeholder="Confirm Password"
                                onBlur={() => setFieldTouched("password2")}
                                secureTextEntry={true}
                                size="xl"
                                color="gray.100"
                                rounded="2xl"
                                InputLeftElement={
                                    <Icon
                                        as={<MaterialIcons name="lock" />}
                                        size={5}
                                        ml="2"
                                        color="gray.400"
                                    />
                                }
                                mb="1"
                            />
                            {touched.password2 && errors.password2 && (
                                <Text
                                    color="red.400"
                                    style={{
                                        fontSize: 12,
                                        // color: "#FF0D10",
                                    }}
                                >
                                    {errors.password2}
                                </Text>
                            )}
                        </Box>
                        <Box>
                            <PrimaryButton
                                _text={{
                                    color: "gray.900",
                                    fontWeight: "600",
                                    fontFamily: "Poppins-Bold",
                                }}
                                onPress={() => {
                                    handleSubmit();
                                    scrollTo();
                                }}
                            >
                                Next
                            </PrimaryButton>
                        </Box>
                    </Box>
                )}
            </Formik>
        </Box>
    );
};

export default Form1;
