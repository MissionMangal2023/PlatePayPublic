import { StyleSheet, View } from "react-native";
import { Box, Text } from "native-base";
import React from "react";

const FullScreenOverlay = ({ isShown, children }) => {
    return isShown ? (
        <Box
            space={2}
            justifyContent="center"
            alignItems="center"
            backgroundColor="rgba(0, 0, 0, 0.8)"
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                zIndex: 50,
            }}
        >
            <Box>{children}</Box>
        </Box>
    ) : (
        <Box></Box>
    );
};

export default FullScreenOverlay;
