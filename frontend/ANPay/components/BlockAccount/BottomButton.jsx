import { Box, Button, Icon } from "native-base";
import React from "react";
import { AntDesign } from "@expo/vector-icons";

const BottomButton = ({ onPress, children, ...props }) => {
    // Note, the props are passed to the button
    return (
        <Box p="3">
            <Button
                colorScheme="danger"
                size="lg"
                py="4"
                rounded="full"
                onPress={onPress}
                leftIcon={
                    <Icon
                        as={AntDesign}
                        name="minuscircle"
                        color="#eee"
                        mr="2"
                    />
                }
                {...props}
            >
                {children}
            </Button>
        </Box>
    );
};

export default BottomButton;
