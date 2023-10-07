import { Heading, Spinner } from "native-base";
import React from "react";

const SpinnerWithText = ({
    title = "Sit Tight!\n We are Logging You In",
    light = false,
}) => {
    return (
        <>
            <Spinner
                accessibilityLabel="Loading posts"
                size="lg"
                color="white"
            />
            <Heading color="gray.200" fontSize="md" mt="3" textAlign="center">
                {title}
            </Heading>
        </>
    );
};

export default SpinnerWithText;
