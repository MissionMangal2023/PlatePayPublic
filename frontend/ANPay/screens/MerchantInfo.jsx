import React, { useEffect, useState } from "react";
import {
    Box,
    FlatList,
    HStack,
    Heading,
    Icon,
    Input,
    Pressable,
    Spinner,
    Text,
    VStack,
} from "native-base";
import HeaderWithMenuProfileGreeting from "../components/HeaderWithMenuProfileGreeting";
import Transaction from "../components/MerchantInfo/Transaction";
import { useSelector } from "react-redux";
import { fetchBasicMerchantDetails, getTransactions } from "../util/function";
import { Entypo, FontAwesome, Ionicons } from "@expo/vector-icons";
import HugeText from "../components/Typography/HugeText";
import SearchBar from "../components/SearchBar";

const MerchantInfo = ({ navigation }) => {
    const user = useSelector((state) => state.user);
    const [merchantBasicDetails, setMerchantBasicDetails] = useState(null);
    const authToken = user.access_token;
    const [transactions, setTransactions] = useState([]);
    const [count, setCount] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    function fetchMore() {
        // console.log("Fetching More");
        getTransactions(
            setTransactions,
            transactions.length / 9 + 1,
            searchQuery,
            "Merchant"
        ).then((res) => {
            if (res) {
                setCount(res);
            }
        });
    }

    useEffect(() => {
        fetchBasicMerchantDetails(setMerchantBasicDetails);
    }, []);

    return (
        <Box flex={1}>
            <HeaderWithMenuProfileGreeting
                navigation={navigation}
                user={user}
                greeting={false}
                title="Merchant Dashboard"
            />

            <HugeText
                title={`Welcome, ${merchantBasicDetails?.name || "User"}`}
                size="4xl"
                mb="5"
                mx="3"
            />

            <Box
                rounded="2xl"
                backgroundColor="gray.800"
                px="6"
                py="4"
                mx="4"
                borderWidth={4}
                borderColor="amber.100"
            >
                <HStack space="8" alignItems="center">
                    <Icon as={Entypo} name="shop" size="4xl" color="teal.400" />
                    <VStack space="2">
                        <Pressable
                            onPress={() => navigation.navigate("OutletList")}
                        >
                            <HStack space={2} alignItems="center">
                                <Text fontSize="lg" fontWeight="bold">
                                    {merchantBasicDetails?.no_of_outlets}{" "}
                                    Outlets
                                </Text>
                                <Icon as={FontAwesome} name="external-link" />
                            </HStack>
                        </Pressable>

                        <Text color="gray.400">
                            <Text
                                fontSize={"xl"}
                                color="gray.100"
                                fontWeight="bold"
                                fontFamily="NotoSerif-Black"
                                mx="2"
                            >
                                ₹ {merchantBasicDetails?.today_sale}
                            </Text>
                            {"   "}
                            (Sale Today)
                        </Text>

                        <Text color="gray.400">
                            <Text
                                fontSize={"xl"}
                                color="gray.100"
                                fontWeight="bold"
                                fontFamily="NotoSerif-Black"
                                mx="2"
                            >
                                ₹ {merchantBasicDetails?.total_sale}
                            </Text>
                            {"   "}
                            (Total Sales)
                        </Text>
                    </VStack>
                </HStack>
            </Box>

            <Box px="3" py="3" flex={1}>
                <Heading
                    fontFamily="Poppins-Bold"
                    fontWeight="600"
                    mb="6"
                    mt="4"
                    textAlign={"center"}
                >
                    Transactions Board {"\n"} (All Outlets)
                </Heading>

                {/* Search Bar */}
                <SearchBar
                    onChangeText={async (newQuery) => {
                        setTransactions((transactions) => []);
                        setSearchQuery(newQuery);
                        await getTransactions(
                            setTransactions,
                            0,
                            newQuery,
                            "Merchant"
                        );
                    }}
                />

                <FlatList
                    data={transactions}
                    renderItem={({ item }) => (
                        <Transaction
                            transaction={item}
                            onPress={() =>
                                navigation.navigate("TransactionDetail", {
                                    transactionId: item.id,
                                })
                            }
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={
                        <>
                            <Text
                                fontSize="lg"
                                color="gray.400"
                                textAlign="center"
                                my="3"
                                fontFamily="RobotoCondensed-Regular"
                            >
                                There are no transactions yet! Start accepting
                                ANPR, and you'll love it
                            </Text>
                        </>
                    }
                    ListFooterComponent={
                        transactions.length === count ? (
                            <></>
                        ) : (
                            <Spinner size="sm" />
                        )
                    }
                    onEndReachedThreshold={0.2}
                    onEndReached={fetchMore}
                />
            </Box>
        </Box>
    );
};

export default MerchantInfo;
