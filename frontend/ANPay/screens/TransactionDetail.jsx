import React, { useEffect, useState } from "react";
import {
    Avatar,
    Box,
    Divider,
    Flex,
    HStack,
    Icon,
    IconButton,
    ScrollView,
    Text,
    VStack,
} from "native-base";
import { Ionicons, Entypo, Feather } from "react-native-vector-icons";
import ViewShot from "react-native-view-shot";
import { useRef } from "react";
import { shareAsync } from "expo-sharing";
import {
    generateFallback,
    getTransactionById,
    openLink,
} from "../util/function";
import SpinnerWithText from "../components/SpinnerWithText";

function InfoGroup({ name, value }) {
    return (
        <HStack space="3" alignItems="center">
            <Text color="gray.100" fontWeight="bold">
                {name}
            </Text>
            <Text color="gray.200">{value}</Text>
        </HStack>
    );
}

const TransactionDetail = ({ navigation, route }) => {
    const { transactionId } = route.params;
    const viewShotRef = useRef();
    const [transaction, setTransaction] = useState(null);

    useEffect(() => {
        getTransactionById(transactionId, setTransaction);
    }, []);

    async function captureViewShot() {
        let imageURI = await viewShotRef.current.capture();
        shareAsync(imageURI);
    }

    if (!transaction) {
        return (
            <Flex justify="center" flex="1">
                <SpinnerWithText title="Fetching your transaction..." />
            </Flex>
        );
    }

    return (
        <>
            <Box px="4" flex={1}>
                <HStack justifyContent="space-between">
                    {/* Go Back Button */}
                    <IconButton
                        icon={
                            <Icon
                                size="md"
                                as={Ionicons}
                                name="arrow-back"
                                color="white"
                            />
                        }
                        onPress={() => {
                            navigation.goBack();
                        }}
                    />

                    <HStack space="2" alignItems={"center"}>
                        {/* Share transaction Button */}
                        <IconButton
                            icon={
                                <Icon
                                    size="md"
                                    as={Entypo}
                                    name="share"
                                    color="white"
                                />
                            }
                            onPress={captureViewShot}
                        />

                        {/* Report Transaction Button */}
                        <IconButton
                            icon={
                                <Icon
                                    size="md"
                                    as={Ionicons}
                                    name="flag-outline"
                                    color="white"
                                />
                            }
                            onPress={() =>
                                openLink(
                                    `mailto:missionmangal2023@gmail.com?subject=Issue%20With%20Transaction%20ID%3A%20${transactionId}&body=Hi%2C%20%0AReport%20the%20following%20transaction%0A%0A%3CWhat's%20the%20issue%3E%0A%0AThanks%0A`
                                )
                            }
                        />

                        {/* <Icon
                        as={Entypo}
                        name="dots-three-vertical"
                        color="white"
                    /> */}
                    </HStack>
                </HStack>

                <ViewShot
                    ref={viewShotRef}
                    options={{
                        format: "jpg",
                        quality: 1.0,
                    }}
                >
                    <ScrollView>
                        <VStack space={4} alignItems="center" mx="auto" my="4">
                            {transaction?.status == 2 ? (
                                <Icon
                                    as={Feather}
                                    name="check-circle"
                                    color="green.400"
                                    size="6xl"
                                />
                            ) : (
                                <Icon
                                    as={Feather}
                                    name="x-circle"
                                    size="6xl"
                                    color="red.600"
                                />
                            )}
                            <Text fontSize="3xl" fontWeight="bold">
                                Payment{" "}
                                {transaction.status === 0
                                    ? "Failed"
                                    : "Succesful"}
                            </Text>
                        </VStack>

                        <Text
                            fontSize="5xl"
                            color="gray.100"
                            textAlign="center"
                            mb="6"
                            style={{
                                fontFamily: "Montserrat-Semibold",
                                fontWeight: "500",
                            }}
                        >
                            ₹ {transaction.amount}
                        </Text>
                        <VStack space="1" alignItems="center" mb="4">
                            <HStack space="2" alignItems="center" mb="1">
                                {transaction?.status == 2 ? (
                                    <Icon
                                        as={Ionicons}
                                        name="checkmark-circle"
                                        color="green.400"
                                    />
                                ) : (
                                    <Icon
                                        as={Ionicons}
                                        name={"close-circle"}
                                        color="red.600"
                                    />
                                )}
                                <Text fontSize="xs" color="white">
                                    {transaction?.status === 2
                                        ? "Success"
                                        : "Failed"}
                                </Text>
                            </HStack>
                            <Divider maxW="1/2" bg="gray.500" />
                            <Text fontSize="xs" color="white">
                                {new Date(transaction.timing)
                                    .toString()
                                    .slice(0, 24)}
                            </Text>
                        </VStack>

                        <Box
                            p="4"
                            mt="6"
                            mx="4"
                            borderColor="gray.500"
                            borderWidth="1"
                            rounded="xl"
                            position="relative"
                        >
                            <Text
                                textAlign="center"
                                fontWeight="bold"
                                position="absolute"
                                // w="full"
                                top="-12"
                                left="0"
                                right="0"
                                backgroundColor="black"
                            >
                                Merchant Info
                            </Text>
                            <HStack space="3" alignItems="center">
                                <Avatar
                                    _image={{
                                        resizeMode: "contain",
                                    }}
                                    mx="auto"
                                    size="lg"
                                    bgColor={"amber.600"}
                                >
                                    {generateFallback(
                                        transaction.merchant_info.outlet_name
                                    )}
                                </Avatar>
                                <VStack>
                                    <Text color="gray.100">
                                        Paid To{" "}
                                        {transaction.merchant_info.outlet_name}
                                    </Text>
                                    <Text color="gray.100">
                                        {transaction.merchant_info.location}
                                    </Text>
                                </VStack>
                            </HStack>
                        </Box>

                        <VStack
                            p="4"
                            space={2}
                            mt="6"
                            mx="4"
                            borderColor="gray.500"
                            borderWidth="1"
                            rounded="xl"
                        >
                            <InfoGroup
                                name="Transaction ID"
                                value={transactionId}
                            />
                            <InfoGroup
                                name="Device ID"
                                value={transaction.merchant_info.device_id}
                            />
                            <InfoGroup
                                name="Mode Of Payment"
                                value="PlatePay"
                            />
                            <InfoGroup
                                name="Amount"
                                value={"Rs. " + transaction.amount}
                            />
                            <InfoGroup
                                name="Timestamp"
                                value={new Date(transaction.timing)
                                    .toString()
                                    .slice(0, 24)}
                            />
                        </VStack>
                    </ScrollView>
                </ViewShot>
            </Box>
            <Text p="4" textAlign="center" fontFamily="Poppins-Bold">
                Thanks, Team Plate Pay 🙂
            </Text>
        </>
    );
};

export default TransactionDetail;
