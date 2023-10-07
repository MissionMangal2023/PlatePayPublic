import { Box, Flex, HStack, Icon, Text, VStack } from "native-base";
import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { BarChart } from "react-native-chart-kit";
import { ActivityIndicator, Dimensions } from "react-native";
import SpinnerWithText from "../SpinnerWithText";

const LastWeekTransactionsScene = ({ outletData, outlet }) => (
    <>
        <Box
            rounded="2xl"
            backgroundColor="gray.800"
            px="6"
            py="4"
            mx="4"
            mb="6"
            borderWidth={4}
            borderColor="amber.100"
        >
            <HStack space="8" alignItems="center">
                <Icon as={AntDesign} name="eyeo" size="4xl" color="teal.400" />
                <VStack space="2">
                    <Text color="gray.400">
                        <Text
                            fontSize={"xl"}
                            color="gray.100"
                            fontWeight="bold"
                            fontFamily="NotoSerif-Black"
                            mx="2"
                        >
                            ₹ {outlet.sales_today}
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
                            {outlet.transactions_today}
                        </Text>
                        {"   "}
                        (Transactions Today)
                    </Text>

                    <Text color="gray.400">
                        <Text
                            fontSize={"xl"}
                            color="gray.100"
                            fontWeight="bold"
                            fontFamily="NotoSerif-Black"
                            mx="2"
                        >
                            ₹ {outlet.total_sales}
                        </Text>
                        {"   "}
                        (Total Sales)
                    </Text>
                </VStack>
            </HStack>
        </Box>

        <Box>
            <Text fontSize="xl" fontWeight="bold" color="gray.200" mb="6">
                Last 7 days transactions
            </Text>
            {outletData ? (
                <BarChart
                    data={{
                        labels: outletData.graph_input.days,
                        datasets: [{ data: outletData.graph_input.amounts }],
                    }}
                    width={Dimensions.get("window").width - 50}
                    height={220}
                    yAxisLabel="₹"
                    yAxisInterval={1}
                    chartConfig={{
                        backgroundGradientFromOpacity: 0,
                        backgroundGradientToOpacity: 0,
                        color: (opacity = 1) => `rgba(0, 255, 255, ${opacity})`,
                        strokeWidth: 2,
                        barPercentage: 0.5,
                        useShadowColorFromDataset: false,
                    }}
                />
            ) : (
                <Flex align="center" justify="center" height="220">
                    <SpinnerWithText title="Visualizing Data..." />
                </Flex>
            )}
        </Box>
    </>
);

export default LastWeekTransactionsScene;
