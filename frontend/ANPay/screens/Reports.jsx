import React, { useEffect, useState } from "react";
import { Dimensions, View, ScrollView, StyleSheet } from "react-native";
import { Box, HStack, Text, Flex, Center, Heading } from "native-base";
import DrawerToggleButton from "../components/DrawerToggleButton";
import { BarChart, PieChart, LineChart } from "react-native-chart-kit";
import SpinnerWithText from "../components/SpinnerWithText";
import { useDispatch, useSelector } from "react-redux";
import {
    getLastWeekTransactions,
    getTransactionPieChart,
    getTransactionStatistics,
    getLastWeekBalance,
} from "../util/function";

const Reports = ({ navigation }) => {
    const user = useSelector((state) => state.user);
    const authToken = user.access_token;
    const [transactionpiechart, setTransactionpiechart] = useState(null);
    const [transactionstatistics, setTransactionstatistics] = useState(null);
    const [lastweektransactions, setLastweektransactions] = useState(null);
    const [lastweekbalance, setLastweekbalance] = useState(null);
    useEffect(() => {
        getTransactionPieChart(authToken, setTransactionpiechart);
        getTransactionStatistics(authToken, setTransactionstatistics);
        getLastWeekTransactions(authToken, setLastweektransactions);
        getLastWeekBalance(authToken, setLastweekbalance);
    }, []);
    return (
        <>
            <Box px="3" flex={1}>
                <HStack space={4} mb="2">
                    <DrawerToggleButton
                        onPress={() => navigation.openDrawer()}
                        navigation={navigation}
                    />
                    <Text color="gray.200" fontSize="3xl" fontWeight="black">
                        Reports
                    </Text>
                </HStack>
                <ScrollView>
                    <Box mt="4" flex={5}>
                        <Center>
                            <Heading>Last Week Expenses</Heading>
                            {lastweektransactions ? (
                                <LineChart
                                    data={lastweektransactions}
                                    width={Dimensions.get("window").width - 50}
                                    height={220}
                                    yAxisLabel="₹"
                                    yAxisInterval={1}
                                    chartConfig={{
                                        decimalPlaces: 2,
                                        color: (opacity = 100) =>
                                            `rgba(12, 255, 255, ${opacity})`,
                                        style: {
                                            borderRadius: 16,
                                        },
                                    }}
                                    bezier
                                    style={{
                                        marginVertical: 8,
                                        borderRadius: 16,
                                    }}
                                />
                            ) : (
                                <Flex
                                    align="center"
                                    justify="center"
                                    height="220"
                                >
                                    <SpinnerWithText title="Visualizing Data..." />
                                </Flex>
                            )}
                        </Center>
                    </Box>
                    <Box mt="4" flex={5}>
                        <Center>
                            <Heading>Last Week Balance</Heading>
                            {lastweekbalance ? (
                                <LineChart
                                    data={lastweekbalance}
                                    width={Dimensions.get("window").width - 50}
                                    height={220}
                                    yAxisLabel="₹"
                                    yAxisInterval={1}
                                    chartConfig={{
                                        decimalPlaces: 2,
                                        color: (opacity = 100) =>
                                            `rgba(12, 255, 255, ${opacity})`,
                                        propsForHorizontalLabels: {
                                            fontSize: 10,
                                        },
                                    }}
                                    bezier
                                    style={{
                                        marginVertical: 8,
                                        borderRadius: 16,
                                    }}
                                />
                            ) : (
                                <Flex
                                    align="center"
                                    justify="center"
                                    height="220"
                                >
                                    <SpinnerWithText title="Visualizing Data..." />
                                </Flex>
                            )}
                        </Center>
                    </Box>
                    <Box mt="4" flex={5}>
                        <Center>
                            <Heading size={"sm"}>
                                Transaction Performed With Each Vehicle
                            </Heading>
                            {transactionpiechart === null ? (
                                <Flex
                                    align="center"
                                    justify="center"
                                    height="220"
                                >
                                    <SpinnerWithText title="Visualizing Data..." />
                                </Flex>
                            ) : transactionpiechart.includes(
                                  "NO_TRANSACTIONS"
                              ) ? (
                                <Text
                                    p="6"
                                    borderWidth={2}
                                    my="4"
                                    borderColor="amber.400"
                                >
                                    {transactionpiechart.split("-")[1] ||
                                        "No transactions or no number plates"}
                                </Text>
                            ) : (
                                <PieChart
                                    data={transactionpiechart}
                                    width={Dimensions.get("window").width - 16}
                                    height={220}
                                    chartConfig={{
                                        backgroundColor: "#1cc910",
                                        backgroundGradientFrom: "#eff3ff",
                                        backgroundGradientTo: "#efefef",
                                        decimalPlaces: 2,
                                        color: (opacity = 1) =>
                                            `rgba(0, 0, 0, ${opacity})`,
                                        style: {
                                            borderRadius: 16,
                                        },
                                    }}
                                    style={{
                                        marginVertical: 8,
                                        borderRadius: 16,
                                    }}
                                    accessor="transactions"
                                    backgroundColor="transparent"
                                    paddingLeft="15"
                                    absolute
                                />
                            )}
                        </Center>
                    </Box>
                    <Box mt="4" flex={5}>
                        <Heading>Transaction Statistics</Heading>
                        {transactionstatistics === null ? (
                            <Flex align="center" justify="center" height="220">
                                <SpinnerWithText title="Visualizing Data..." />
                            </Flex>
                        ) : transactionstatistics === "NO_TRANSACTIONS" ? (
                            <Text
                                p="6"
                                borderWidth={2}
                                my="4"
                                borderColor="amber.400"
                            >
                                No transactions found. Start transacting to see
                                stats!
                            </Text>
                        ) : (
                            <Center>
                                <HStack space={3} mb="2">
                                    <Center
                                        backgroundColor={"#393E46"}
                                        borderRadius={"8"}
                                        padding={7}
                                    >
                                        <Text style={styles.infoTitle}>
                                            Total Transaction(s)
                                        </Text>
                                        <Text style={styles.infoValue}>
                                            {
                                                transactionstatistics.total_transactions
                                            }
                                        </Text>
                                    </Center>
                                    <Center
                                        backgroundColor={"#393E46"}
                                        borderRadius={"8"}
                                        padding={7}
                                    >
                                        <Text style={styles.infoTitle}>
                                            Total Expense
                                        </Text>
                                        <Text style={styles.infoValue}>
                                            ₹
                                            {transactionstatistics.total_amount}
                                        </Text>
                                    </Center>
                                </HStack>
                                <HStack space={3} mb="2">
                                    <Center
                                        backgroundColor={"#393E46"}
                                        borderRadius={"8"}
                                        padding={7}
                                    >
                                        <Text style={styles.infoTitle}>
                                            Min Transaction
                                        </Text>
                                        <Text style={styles.infoValue}>
                                            ₹
                                            {
                                                transactionstatistics.min_transaction
                                            }
                                        </Text>
                                    </Center>
                                    <Center
                                        backgroundColor={"#393E46"}
                                        borderRadius={"8"}
                                        padding={7}
                                    >
                                        <Text style={styles.infoTitle}>
                                            Max Transaction
                                        </Text>
                                        <Text style={styles.infoValue}>
                                            ₹
                                            {
                                                transactionstatistics.max_transaction
                                            }
                                        </Text>
                                    </Center>
                                </HStack>
                                <Center
                                    backgroundColor={"#393E46"}
                                    borderRadius={"8"}
                                    padding={7}
                                >
                                    <Text style={styles.infoTitle}>
                                        Avg Transaction
                                    </Text>
                                    <Text style={styles.infoValue}>
                                        ₹
                                        {
                                            transactionstatistics.average_transaction
                                        }
                                    </Text>
                                </Center>
                            </Center>
                        )}
                    </Box>
                </ScrollView>
            </Box>
        </>
    );
};

export default Reports;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: 10,
    },
    label1: {
        textAlign: "center",
        marginBottom: 10,
        fontSize: 20,
        color: "blue",
        paddingBottom: 3,
    },
    label2: {
        textAlign: "center",
        marginBottom: 10,
        fontSize: 30,
        color: "white",
        paddingBottom: 3,
        fontWeight: "bold",
    },
    infoContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    infoBox: {
        backgroundColor: "#393E46",
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginLeft: 5,
    },
    infoTitle: {
        color: "#FFFFFF",
        fontSize: 12,
        marginBottom: 5,
        textAlign: "center",
    },
    infoValue: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        color: "white",
    },
});
