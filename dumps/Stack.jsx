import { View, Text } from "react-native";
import React from "react";

const Stack = ({ children, spacing = "center", containerStyle = {} }) => {
    return (
        <View
            style={[
                {
                    flexDirection: "row",
                    // alignContent: "center",
                    alignItems: "center",
                    justifyContent: spacing,
                },
                containerStyle,
            ]}
        >
            {children}
        </View>
    );
};

export default Stack;
