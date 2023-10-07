import { Alert, useWindowDimensions } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Avatar, Box, Button, HStack, Icon, Skeleton, Text } from "native-base";
import MapView, { Marker } from "react-native-maps";
import {
    approveTransaction,
    generateFallback,
    generateRandomColor,
    getTransactionById,
    rejectTransaction,
} from "../util/function";
import { AntDesign } from "@expo/vector-icons";
import FullScreenOverlay from "../components/FullScreenOverlay";
import SpinnerWithText from "../components/SpinnerWithText";
import LottieView from "lottie-react-native";
import { Animated } from "react-native";
import { Alert as NBAlert } from "native-base";
import { useIsFocused } from "@react-navigation/native";

const TransactionApproval = ({ navigation, route }) => {
    const { transactionId } = route.params;
    const [isLoading, setIsLoading] = useState(false);
    const [isOverlayShown, setIsOverlayShown] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;
    const [error, setError] = useState(false);
    const isFocussed = useIsFocused();

    const [transaction, setTransaction] = useState(null);

    function startAnimation(animation) {
        Animated.timing(animation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
        }).start();
    }

    useEffect(() => {
        if (isFocussed) {
            getTransactionById(transactionId, setTransaction);
        }
    }, [isFocussed]);

    return (
        <>
            <FullScreenOverlay isShown={isOverlayShown}>
                {isLoading ? (
                    <SpinnerWithText />
                ) : error ? (
                    <LottieView
                        progress={animation}
                        style={{
                            width: 200,
                            height: 200,
                        }}
                        // Find more Lottie files at https://lottiefiles.com/featured
                        source={require("../assets/lottieanimations/16305-payment-failed.json")}
                    />
                ) : (
                    <LottieView
                        progress={animation}
                        style={{
                            width: 200,
                            height: 200,
                        }}
                        // Find more Lottie files at https://lottiefiles.com/featured
                        source={require("../assets/lottieanimations/83666-payment-successfull.json")}
                    />
                )}
            </FullScreenOverlay>

            <Box flex="1">
                <Box overflow="hidden" flex="1">
                    {transaction ? (
                        <MapView
                            style={{
                                flex: 0.8,
                            }}
                            initialRegion={{
                                latitude: parseFloat(
                                    transaction.merchant_info.coordinates.split(
                                        ","
                                    )[0]
                                ),
                                longitude: parseFloat(
                                    transaction.merchant_info.coordinates.split(
                                        ","
                                    )[1]
                                ),
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421,
                            }}
                        >
                            <Marker
                                coordinate={{
                                    latitude: parseFloat(
                                        transaction.merchant_info.coordinates.split(
                                            ","
                                        )[0]
                                    ),
                                    longitude: parseFloat(
                                        transaction.merchant_info.coordinates.split(
                                            ","
                                        )[1]
                                    ),
                                }}
                                title="Outlet is here"
                            />
                        </MapView>
                    ) : (
                        <Skeleton
                            style={{
                                flex: 1,
                            }}
                        />
                    )}
                </Box>

                <Box
                    bg="blueGray.800"
                    roundedTop="3xl"
                    position="absolute"
                    bottom="0"
                    left="0"
                    right="0"
                >
                    <Box p="6">
                        <HStack alignItems="center">
                            <Avatar
                                _image={{
                                    resizeMode: "contain",
                                }}
                                size="lg"
                                mr="4"
                                bgColor={generateRandomColor()}
                            >
                                {transaction &&
                                    generateFallback(
                                        transaction?.merchant_info.outlet_name
                                    )}
                            </Avatar>
                            <Text
                                fontSize="lg"
                                color="gray.100"
                                textAlign="center"
                                style={{
                                    fontFamily: "Montserrat-Bold",
                                    fontWeight: "500",
                                }}
                            >
                                {transaction?.merchant_info.outlet_name}
                            </Text>
                        </HStack>
                    </Box>

                    <Box bg="white" roundedTop="3xl" p="4" w="full">
                        <HStack alignItems="center" space={6}>
                            {/* Icon here */}
                            <Box bg="amber.400" p="4" rounded="full">
                                <Icon
                                    size="xl"
                                    color="red.800"
                                    as={AntDesign}
                                    name="clockcircleo"
                                />
                            </Box>
                            <Box>
                                <Text
                                    color="gray.600"
                                    style={{
                                        fontFamily: "Montserrat-Bold",
                                        fontWeight: "500",
                                    }}
                                >
                                    Amount Requested
                                </Text>

                                <Text
                                    fontSize="4xl"
                                    color="black"
                                    // textAlign="center"
                                    style={{
                                        fontFamily: "Montserrat-Black",
                                        fontWeight: "900",
                                    }}
                                >
                                    ₹ {transaction?.amount}
                                </Text>

                                <Text color="gray.600" fontSize="sm">
                                    {transaction &&
                                        new Date(
                                            transaction.timing
                                        ).toDateString() +
                                            "\n" +
                                            new Date(transaction.timing)
                                                .toTimeString()
                                                .slice(0, 8)}
                                </Text>
                            </Box>
                        </HStack>

                        {transaction?.status !== 1 ? (
                            <Box>
                                <NBAlert>
                                    <Text>
                                        Request Expired. Please request merchant
                                        to initiate a new transaction
                                    </Text>
                                </NBAlert>
                            </Box>
                        ) : (
                            <Button.Group variant="outline" mt="3">
                                <Button
                                    colorScheme="teal"
                                    flexGrow={1}
                                    onPress={async () => {
                                        let result = await approveTransaction(
                                            transactionId,
                                            setIsLoading
                                        );
                                        if (
                                            result ===
                                            `Transaction ${transactionId} approved!`
                                        ) {
                                            navigation.replace(
                                                "TransactionDetail",
                                                {
                                                    transactionId,
                                                }
                                            );
                                        } else {
                                            Alert.alert(result);
                                            setTimeout(() => {
                                                navigation.goBack();
                                            }, 3000);
                                        }
                                    }}
                                >
                                    Approve
                                </Button>

                                <Button
                                    colorScheme="danger"
                                    flexGrow={1}
                                    onPress={async () => {
                                        setIsOverlayShown(true);

                                        let result = await rejectTransaction(
                                            transactionId,
                                            setIsLoading
                                        );
                                        setError(true);
                                        startAnimation(animation);

                                        navigation.navigate("AddNumberPlate");
                                    }}
                                >
                                    Reject
                                </Button>
                            </Button.Group>
                        )}
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default TransactionApproval;
