import { HStack, Icon, Pressable, Text } from "native-base";
import React from "react";
import { textColorByStatus } from "../../util/function";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

function Transaction({ transaction, onPress }) {
    return (
        <Pressable
            onPress={onPress}
            backgroundColor="gray.800"
            mb="2"
            p="4"
            rounded="lg"
        >
            <HStack alignItems="center" justifyContent="space-between">
                <Text color="gray.400">
                    #{transaction?.merchant_info.device_id}-{transaction.id}
                </Text>
                {/* <Text color="gray.100" w="50%">
                    - {transaction.error_message} - {transaction.status}
                </Text> */}

                <Text
                    color="white"
                    p="2"
                    pb="1"
                    pt="3"
                    fontFamily="RobotoCondensed-Bold"
                    fontSize="lg"
                    rounded="md"
                >
                    {transaction?.number_plate}{" "}
                    {!transaction?.number_plate_stolen ? (
                        <Icon
                            as={Ionicons}
                            name="checkmark-circle"
                            color="green.400"
                        />
                    ) : (
                        <Icon
                            as={MaterialCommunityIcons}
                            name={"robber"}
                            color="red.600"
                        />
                    )}
                </Text>

                <Text
                    color={textColorByStatus(transaction?.status)}
                    fontWeight="bold"
                    fontSize="xl"
                    ml="3"
                    width="20"
                    textAlign="right"
                >
                    ₹ {transaction?.amount}
                </Text>
            </HStack>
        </Pressable>
    );
}

export default Transaction;
