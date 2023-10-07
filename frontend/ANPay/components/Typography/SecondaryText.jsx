import { Text } from "native-base";
import React from "react";

const SecondaryText = ({ title, ...props }) => {
    return (
        <Text
            fontSize="xl"
            color="#ccc"
            fontFamily="Poppins-Regular"
            {...props}
        >
            {title}
        </Text>
    );
};

export default SecondaryText;
