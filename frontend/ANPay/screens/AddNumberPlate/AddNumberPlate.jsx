import React, { useEffect, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { Button, Box, Icon, Text, ScrollView, Pressable } from "native-base";
import NumberPlate from "../../components/NumberPlate";
import { getNumberPlates } from "../../util/function";
import { useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import HeaderWithMenuProfileGreeting from "../../components/HeaderWithMenuProfileGreeting";
import BottomButton from "../../components/BlockAccount/BottomButton";
import BlockAccountModal from "../../components/BlockAccount/BlockAccountModal";
import ConfirmAddNumberPlateModal from "../../components/AddNumberPlate/ConfirmAddNumberPlateModal";
import SecondaryText from "../../components/Typography/SecondaryText";
import SpinnerWithText from "../../components/SpinnerWithText";

const AddNumberPlate = ({ navigation }) => {
    const user = useSelector((state) => state.user);
    const isFocused = useIsFocused();
    const [numberPlates, setNumberPlates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // On load, get all linked number plates here
        if (isFocused) {
            getNumberPlates(setNumberPlates).then((res) => {
                setIsLoading(false);
            });
        }
    }, [getNumberPlates, setNumberPlates, setIsLoading, isFocused]);

    return (
        <>
            <ScrollView
                style={{
                    flex: 1,
                    paddingHorizontal: 10,
                }}
            >
                {/* Place your Modals here */}
                <ConfirmAddNumberPlateModal
                    showModal={showModal}
                    setShowModal={setShowModal}
                    navigation={navigation}
                />

                <HeaderWithMenuProfileGreeting
                    navigation={navigation}
                    user={user}
                />

                <SecondaryText
                    title="Here you can add your vehicles. To block a vehicle from the
                    wallet, just turn off the switch beside the number plate."
                    fontSize="lg"
                    mb="4"
                />

                <Box>
                    <Button
                        size="lg"
                        bg="amber.400"
                        leftIcon={
                            <Icon
                                name="pluscircle"
                                as={AntDesign}
                                color="black"
                                mr="2"
                            />
                        }
                        _text={{
                            color: "gray.900",
                            fontWeight: "600",
                            fontFamily: "Poppins-Bold",
                        }}
                        onPress={() => setShowModal(true)}
                        // colorScheme="dark"
                    >
                        Add Your Vehicle
                    </Button>

                    <Text
                        fontSize="2xl"
                        color="white"
                        my="4"
                        mt="8"
                        fontFamily="Montserrat-Bold"
                    >
                        Your Vehicles
                    </Text>

                    <Box
                        bgColor="green.200"
                        borderColor="green.600"
                        borderWidth="4"
                        px="1"
                        py="2"
                        mb="4"
                        rounded="2xl"
                    >
                        <Text color="#262626" bold textAlign="center">
                            {numberPlates.length} Vehicles Linked to your wallet
                        </Text>
                    </Box>

                    {/* Number Plates Come here */}
                    {isLoading ? (
                        // If loading, show the loader
                        <SpinnerWithText title="Fetching your vehicles..." />
                    ) : numberPlates.length === 0 ? (
                        // If there are no linked number plates
                        <>
                            <Text
                                fontSize="sm"
                                color="gray.400"
                                textAlign="center"
                                my="2"
                            >
                                You currently have no vehicles registered!{" "}
                                {"\n"} Click on the register button to add one
                            </Text>
                        </>
                    ) : (
                        // If there are number plates linked, render them
                        numberPlates.map((np) => (
                            <Pressable
                                key={np.value}
                                onPress={() => {
                                    navigation.navigate("NumberPlateDetail", {
                                        numberPlate: np,
                                    });
                                }}
                            >
                                {/* On Press, expand a more detailed view, showing all transactions */}
                                <NumberPlate
                                    numberPlate={np.value}
                                    blocked={np.blocked}
                                />
                            </Pressable>
                        ))
                    )}
                </Box>
            </ScrollView>

            {/* The block account button */}
            <BottomButton
                onPress={() => {
                    setIsModalOpen(true);
                }}
            >
                Block Your Account
            </BottomButton>

            {/* This modal shows the corresponding Yes, No button and warns user before blocking. When Yes is clicked, it blocks the account */}
            <BlockAccountModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
            />
        </>
    );
};

export default AddNumberPlate;
