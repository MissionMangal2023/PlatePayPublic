import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getTransactions } from "../../util/function";
import { FlatList, Icon, Input, Spinner, Text } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import Transaction from "./Transaction";

const AllTransactions = ({ outletData, navigation }) => {
    const user = useSelector((state) => state.user);
    const [transactions, setTransactions] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingTransactions, setLoadingTransactions] = useState(true);

    function fetchMore() {
        getTransactions(
            setTransactions,
            transactions.length / 9 + 1,
            searchQuery,
            "Outlet",
            outletData.id
        ).finally(() => {
            setLoadingTransactions(false);
        });
    }

    return (
        <>
            {/* Search Bar */}
            <Input
                placeholder="Search"
                variant="filled"
                width="100%"
                borderRadius="10"
                py="2"
                px="3"
                size="lg"
                mb="4"
                onChangeText={async (newQuery) => {
                    setTransactions((transactions) => []);
                    setSearchQuery(newQuery);
                    await getTransactions(
                        setTransactions,
                        1,
                        newQuery,
                        "Outlet",
                        outletData.id
                    );
                    setLoadingTransactions(false);
                }}
                InputLeftElement={
                    <Icon
                        ml="2"
                        size="4"
                        color="gray.400"
                        as={<Ionicons name="ios-search" />}
                    />
                }
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
                            There are no transactions yet! Start accepting ANPR,
                            and you'll love it
                        </Text>
                    </>
                }
                ListFooterComponent={false ? <></> : <Spinner size="sm" />}
                onEndReachedThreshold={0.2}
                onEndReached={fetchMore}
            />
        </>
    );
};

export default AllTransactions;
