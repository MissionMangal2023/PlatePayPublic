import { Text } from "native-base";
import React from "react";

const HugeText = ({ title, size = "5xl", ...props }) => {
    return (
        <Text
            fontSize={size}
            color="#fff"
            fontFamily="Poppins-Bold"
            mb="2"
            {...props}
        >
            {title}
        </Text>
    );
};

export default HugeText;
