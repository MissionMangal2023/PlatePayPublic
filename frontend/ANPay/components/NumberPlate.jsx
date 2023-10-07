import { Box, Flex, Image, Pressable, Switch, Text } from "native-base";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toggleNumberPlateBlock } from "../util/function";

const NumberPlate = ({
    numberPlate,
    blocked = false,
    showBlockSwitch = true,
    ...props
}) => {
    const user = useSelector((state) => state.user);
    const authToken = user.access_token;

    const [blockedState, setBlockedState] = useState(blocked);

    return (
        <>
            {/* <Pressable onPress={openNavigationDetail}> */}
            <Flex
                bgColor="#eee"
                py="2"
                px="2"
                direction="row"
                align="center"
                justify="space-between"
                mb="4"
                rounded="2xl"
                borderColor="gray.500"
                borderWidth="6"
                {...props}
            >
                <Image
                    source={require("../assets/indiaflag.webp")}
                    alt="Alternate Text"
                    size="xl"
                    width="12"
                    height="8"
                />
                <Text
                    color="#363636"
                    bold
                    textAlign="center"
                    fontSize="2xl"
                    style={{
                        fontFamily: "RobotoCondensed-Bold",
                        fontWeight: "600",
                    }}
                >
                    {numberPlate}
                </Text>
                {showBlockSwitch && (
                    <Switch
                        isChecked={!blockedState}
                        colorScheme="success"
                        onToggle={() =>
                            toggleNumberPlateBlock(authToken, numberPlate).then(
                                (status) => {
                                    if (status === "success") {
                                        setBlockedState(
                                            (blockedState) => !blockedState
                                        );
                                    }
                                }
                            )
                        }
                    />
                )}
            </Flex>
            {/* </Pressable> */}
        </>
    );
};

export default NumberPlate;
