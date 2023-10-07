import { StyleSheet } from "react-native";
import React from "react";
import {
    Box,
    Button,
    Text,
    useColorMode,
    useColorModeValue,
} from "native-base";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";

const TestScreen = () => {
    const redirectUrl = Linking.createURL("path/into/app", {
        queryParams: { hello: "world" },
    });
    const url = Linking.useURL();

    const { toggleColorMode } = useColorMode();
    const text = useColorModeValue("gray.800", "gray.100");
    const bg = useColorModeValue("warmGray.50", "#262526");

    return (
        <Box p="2" bg={bg} flex="1">
            <Text color={text} fontSize="2xl" fontWeight="bold">
                Test Screen
            </Text>

            <Button
                onPress={() => {
                    Notifications.scheduleNotificationAsync({
                        content: {
                            title: "Look at that notification",
                            body: "I'm so proud of myself!",
                        },
                        trigger: null,
                    });
                }}
            >
                This is a button
            </Button>

            <Button my="3" onPress={toggleColorMode}>
                Toggle color mode
            </Button>

            <Button
                onPress={() =>
                    Linking.openURL(
                        "exp://192.168.0.129:19000/--/approveTransaction/18"
                    )
                }
                my="4"
            >
                Press me to link
            </Button>
        </Box>
    );
};

export default TestScreen;

const styles = StyleSheet.create({});
