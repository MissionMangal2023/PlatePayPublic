import React, { useRef, useState } from "react";
import { Box, Button, FlatList, Heading, Spinner, Text } from "native-base";
import Form1 from "../components/RegisterationForms/Form1";
import Form2 from "../components/RegisterationForms/Form2";
import Form3 from "../components/RegisterationForms/Form3";
import { Animated } from "react-native";
import RegisterationContext from "../store/RegisterationContext";
import FullScreenOverlay from "../components/FullScreenOverlay";
import SpinnerWithText from "../components/SpinnerWithText";
import HugeText from "../components/Typography/HugeText";
import SecondaryText from "../components/Typography/SecondaryText";
const yup = require("yup");

const Registeration = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;

    const [registerationData, setRegisterationData] = useState({
        username: null,
        password: null,
        name: null,
        address: "",
        phone_number: null,
        date_of_birth: null,
        email: null,
        gender: "Male",
    });

    const formChanged = useRef(({ viewableItems }) => {
        setCurrentIndex(viewableItems[0].index);
    }).current;

    const formChangeConfig = useRef({
        viewAreaCoveragePercentThreshold: 50,
    }).current;
    const flatListRef = useRef(null);

    const scrollTo = (index) => {
        flatListRef.current.scrollToIndex({ animated: true, index });
    };

    return (
        <>
            {isLoading && (
                <FullScreenOverlay isShown={isLoading}>
                    <SpinnerWithText
                        title={`Sit Tight!\n We are creating your account`}
                    />
                </FullScreenOverlay>
            )}
            <Box my="4">
                {/* Header, with leading text */}
                <Box px="2">
                    <HugeText size="4xl" title="Registration" />
                    <SecondaryText title="Create an account in 3 simple steps" />
                </Box>

                <Box my="10">
                    {/* This context provider passes the registerationData
                     (allowing edits in all 3 form screen), 
                     and loading (allowing to trigger loading state in last form) */}

                    <RegisterationContext.Provider
                        value={[
                            registerationData,
                            setRegisterationData,
                            setIsLoading,
                        ]}
                    >
                        {/* The three sections of the form, are implemented as a horizontal flatlist */}
                        <FlatList
                            scrollEnabled={false}
                            showsHorizontalScrollIndicator={false}
                            horizontal
                            pagingEnabled
                            data={[
                                <Form1 scrollTo={() => scrollTo(1)} />,
                                <Form2 scrollTo={() => scrollTo(2)} />,
                                <Form3
                                    scrollBack={() => scrollTo(1)}
                                    navigation={navigation}
                                />,
                            ]}
                            ref={flatListRef}
                            onViewableItemsChanged={formChanged}
                            renderItem={({ item }) => item}
                            bounces={false}
                            keyExtractor={(item, index) => index}
                            scrollEventThrottle={32}
                            viewabilityConfig={formChangeConfig}
                            onScroll={Animated.event(
                                [
                                    {
                                        nativeEvent: {
                                            contentOffset: { x: scrollX },
                                        },
                                    },
                                ],
                                {
                                    useNativeDriver: false,
                                }
                            )}
                        />
                    </RegisterationContext.Provider>
                </Box>
            </Box>
        </>
    );
};

export default Registeration;
