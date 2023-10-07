import React from "react";
import { Box, Button, HStack, Text } from "native-base";

const TextWithButtonLink = ({ onPress, text, buttonText }) => {
    return (
        <HStack>
            <Text color="gray.300" mr="2">
                {text}
            </Text>
            <Box>
                <Button
                    variant="ghost"
                    title="Sign Up"
                    p="0"
                    onPress={onPress}
                    fontFamily="Poppins-Regular"
                >
                    {buttonText}
                </Button>
            </Box>
        </HStack>
    );
};

export default TextWithButtonLink;
