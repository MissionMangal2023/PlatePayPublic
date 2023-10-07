import React from "react";
import { Button } from "native-base";

const SecondaryButton = ({ onPress, children, ...props }) => {
    return (
        <Button
            variant="subtle"
            rounded="2xl"
            bgColor="#343839"
            mb="3"
            size="lg"
            onPress={onPress}
            _text={{
                color: "gray.300",
            }}
            {...props}
        >
            {children}
        </Button>
    );
};

export default SecondaryButton;
