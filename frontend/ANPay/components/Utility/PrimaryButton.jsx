import React from "react";
import { Button } from "native-base";

const PrimaryButton = ({ onPress, children, ...props }) => {
    return (
        <Button
            size="lg"
            bgColor="white"
            rounded="2xl"
            _text={{
                color: "gray.900",
                fontWeight: "600",
                fontFamily: "Poppins-Bold",
            }}
            onPress={onPress}
            mb="3"
            {...props}
        >
            {children}
        </Button>
    );
};

export default PrimaryButton;
