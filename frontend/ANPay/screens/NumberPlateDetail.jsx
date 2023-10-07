import {
    Avatar,
    Box,
    Center,
    FlatList,
    Flex,
    Pressable,
    Text,
} from "native-base";
import React, { useEffect, useRef, useState } from "react";
import NumberPlate from "../components/NumberPlate";
import {
    bgColorByStatus,
    borderColorByStatus,
    generateFallback,
    getTransactionsByNumberPlate,
    textColorByStatus,
} from "../util/function";
import { useSelector } from "react-redux";
import { Animated } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import HeaderWithMenuProfileGreeting from "../components/HeaderWithMenuProfileGreeting";
import HugeText from "../components/Typography/HugeText";
import SpinnerWithText from "../components/SpinnerWithText";

function transactionClickHandler(navigation, transactionId, status) {
    if (status === 1) {
        navigation.navigate("TransactionApproval", {
            transactionId,
        });
    } else {
        navigation.navigate("TransactionDetail", {
            transactionId,
        });
    }
}

function Transaction({
    merchant_info,
    status,
    amount,
    avatar,
    timing,
    id,
    navigation,
}) {
    const title = "Paid to " + merchant_info.outlet_name,
        fallback = generateFallback(merchant_info.outlet_name);
    const anim = useRef(new Animated.Value(1));
    const isFocussed = useIsFocused();

    useEffect(() => {
        if (status === 1) {
            Animated.loop(
                // runs given animations in a sequence
                Animated.sequence([
                    // increase size
                    // decrease size
                    Animated.timing(anim.current, {
                        toValue: 0.98,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim.current, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [isFocussed]);

    const contents = (
        <Pressable
            onPress={() => transactionClickHandler(navigation, id, status)}
        >
            <Flex
                bg={bgColorByStatus(status)}
                px="2"
                py="4"
                mb="4"
                borderColor={borderColorByStatus(status)}
                borderWidth="2"
                rounded="lg"
                direction="row"
                justify="space-evenly"
            >
                <Center>
                    <Avatar
                        source={{
                            uri: avatar,
                        }}
                        bg="purple.400"
                        mr="3"
                    >
                        {fallback}
                    </Avatar>
                </Center>
                <Box>
                    <Text color="gray.100" fontWeight="bold">
                        {title}
                    </Text>
                    <Text color="gray.100" fontSize="xs">
                        {status === 1
                            ? "Click to accept or reject!"
                            : timing.slice(0, 10) + "@" + timing.slice(11, 19)}
                    </Text>
                </Box>
                <Center>
                    <Text
                        // color="amber.400"
                        color={textColorByStatus(status)}
                        fontWeight="bold"
                        fontSize="xl"
                        ml="3"
                    >
                        ₹ {amount}
                    </Text>
                </Center>
            </Flex>
        </Pressable>
    );

    return status === 1 ? (
        <Animated.View style={{ transform: [{ scale: anim.current }] }}>
            {contents}
        </Animated.View>
    ) : (
        contents
    );
}

const NumberPlateDetail = ({ navigation, route }) => {
    const { numberPlate } = route.params;
    const [transactions, setTransactions] = useState([]);
    const user = useSelector((state) => state.user);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getTransactionsByNumberPlate(numberPlate.value, setTransactions).then(
            (res) => {
                setIsLoading(false);
            }
        );
    }, []);

    return (
        <Box px="4" flex="1">
            <HeaderWithMenuProfileGreeting
                user={user}
                navigation={navigation}
            />

            <NumberPlate
                numberPlate={numberPlate.value}
                blocked={numberPlate.blocked}
            />

            <HugeText
                size="4xl"
                title="Transactions"
                textAlign="center"
                mb="6"
                mt="4"
            />

            <Box flex="1">
                {isLoading ? (
                    <Flex align="center" justify="center" flex="1">
                        <SpinnerWithText title="Fetching your transactions.." />
                    </Flex>
                ) : transactions.length > 0 ? (
                    <FlatList
                        data={transactions}
                        renderItem={({ item }) => {
                            return (
                                <Transaction
                                    {...item}
                                    navigation={navigation}
                                />
                            );
                        }}
                        keyExtractor={(item) => item.id}
                    />
                ) : (
                    <Text
                        fontSize="sm"
                        color="#ccc"
                        fontFamily="Poppins-Regular"
                        textAlign="center"
                    >
                        You don't have any transactions to show
                    </Text>
                )}
            </Box>
        </Box>
    );
};

export default NumberPlateDetail;
