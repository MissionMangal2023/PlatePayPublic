import { Alert, ImageBackground } from "react-native";
import React, { useState } from "react";
import { login } from "../features/userSlice";
import { useDispatch } from "react-redux";
import { Heading, HStack, Image, Box, Text, Button } from "native-base";
import axiosInstance from "../utils/axiosInstance";

const Login = ({ navigation }) => {
    let dispatch = useDispatch();
    // console.log(process.env);
    const [loginFormData, setLoginFormData] = useState({
        device_id: 2145987,
    });

    async function handleSubmit(e) {
        if (!loginFormData.device_id) {
            Alert.alert("Invalid Data!");
            return;
        }

        try {
            let response = await axiosInstance.post(
                "account/kiosklogin/",
                loginFormData
            );
            dispatch(
                login({
                    // access_token: response.data.access_token,
                    access_token: response.data.access,
                    refresh_token: response.data.refresh,
                    device_id: response.data.device_id,
                    machine_status: response.data.machine_status,
                    outlet_name: response.data.outlet_name,
                })
            );
            navigation.navigate("HomePage");
            // navigation.navigate("TakePicture");
        } catch (err) {
            if (err.response && err.response.status === 401) {
                return Alert.alert(err.response.data.message);
            }
            return Alert.alert("Network Error", "Please try again later");
        }
    }

    return (
        <>
            <HStack
                alignItems={"center"}
                flex={1}
                pl="8"
                space={4}
                backgroundColor="#fff"
            >
                <Box flex={1} height="50%">
                    {/* Icon with Name Heading */}
                    <HStack mb="8" alignItems="center" space={4}>
                        <Image
                            source={require("../assets/icon.png")}
                            alt="Plate Pay Icon"
                            width={100}
                            height={100}
                        />
                        <Heading size={"2xl"}>Plate Pay</Heading>
                    </HStack>

                    {/* Welcome with tagline */}
                    <Box mb="12">
                        <Heading size={"xl"}>Welcome Back!</Heading>
                        <Text fontSize="lg" textAlign="justify">
                            The ultimate payment app for hassle-free business
                            management. Streamline payments, focus on your
                            business, and leave the rest to us.
                        </Text>
                    </Box>

                    {/* Login Button */}
                    <Button
                        size="lg"
                        onPress={handleSubmit}
                        mb="10"
                        colorScheme="orange"
                        rounded="2xl"
                        _text={{
                            fontWeight: "semibold",
                            fontSize: "2xl",
                        }}
                        // radius={10}
                    >
                        Click here to Login
                    </Button>

                    <Text color="blue.600" underline textAlign="center">
                        Terms and Conditions - Privacy Policy
                    </Text>
                </Box>

                {/* Right Hero Image */}
                <Box flex={1}>
                    <Image
                        source={require("../assets/Login/loginhero.jpg")}
                        alt="Login Hero"
                        style={{
                            resizeMode: "contain",
                        }}
                    />
                </Box>
            </HStack>
        </>
    );
};

export default Login;

{
    /* <ImageBackground
    source={require("../assets/Login/loginBg.jpg")}
    resizeMode="cover"
    style={{
        flex: 1,
        justifyContent: "center",
    }}
></ImageBackground> */
}
