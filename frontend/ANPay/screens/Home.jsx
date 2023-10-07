import { Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { BarChart } from "react-native-chart-kit";
import { useDispatch, useSelector } from "react-redux";
import { Entypo } from "@expo/vector-icons";
import {
    addAmountToBalance,
    createMessage,
    fetchAds,
    getLastWeekTransactions,
    initializePaymentSheet,
    openPaymentSheet,
    useKeyboardBottomInset,
} from "../util/function";
import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    Text,
    ScrollView,
    Actionsheet,
    Input,
    useDisclose,
} from "native-base";
import AdCard from "../components/AdCard";
import { useStripe } from "@stripe/stripe-react-native";
import BlockAccountModal from "../components/BlockAccount/BlockAccountModal";
import HugeText from "../components/Typography/HugeText";
import { updateProfile } from "../features/users/userSlice";
import HeaderWithMenuProfileGreeting from "../components/HeaderWithMenuProfileGreeting";
import SpinnerWithText from "../components/SpinnerWithText";
import BottomButton from "../components/BlockAccount/BottomButton";

const Home = ({ navigation }) => {
    const bottomInset = useKeyboardBottomInset();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);
    const amountForm = useDisclose();
    const authToken = user.access_token;
    const [lastweektransactions, setLastweektransactions] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addAmount, setAddAmount] = useState("500");
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(false);
    const [ads, setAds] = useState([]);

    useEffect(() => {
        getLastWeekTransactions(authToken, setLastweektransactions);
        fetchAds(setAds);
    }, []);

    return (
        <>
            <ScrollView flex={1} mx="4">
                <Box>
                    <HeaderWithMenuProfileGreeting
                        navigation={navigation}
                        user={user}
                        greeting={false}
                    />

                    <HugeText
                        title={`Hello, ${
                            user
                                ? user.profile.name.split(" ")[0]
                                : user.user.username
                        }`}
                        mb="5"
                    />

                    {/* Box that displays current balance, and an add money button */}
                    <LinearGradient
                        colors={["#242424", "#333"]}
                        start={{ x: 0.5, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={{
                            elevation: 4,
                            borderRadius: 28,
                            marginBottom: 10,
                        }}
                    >
                        <Box py="6" px="4">
                            <HStack
                                space="3"
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <Text
                                    fontSize="2xl"
                                    color="green.400"
                                    fontFamily="Montserrat-Regular"
                                >
                                    ₹ {user && user.profile.balance}
                                </Text>

                                <Button
                                    onPress={() => {
                                        // Open the bottom amount entering drawer
                                        amountForm.onOpen();
                                    }}
                                    leftIcon={
                                        <Icon
                                            color="teal.400"
                                            as={Entypo}
                                            name="plus"
                                        />
                                    }
                                    variant="ghost"
                                    _text={{
                                        color: "teal.400",
                                    }}
                                >
                                    Add Money
                                </Button>
                            </HStack>
                        </Box>
                    </LinearGradient>
                </Box>

                {/* Show the graph displaying last week transactions */}
                <Box mt="4">
                    {lastweektransactions ? (
                        <BarChart
                            data={lastweektransactions}
                            width={Dimensions.get("window").width - 50}
                            height={220}
                            yAxisLabel="₹"
                            yAxisInterval={1}
                            chartConfig={{
                                backgroundGradientFromOpacity: 0,
                                backgroundGradientToOpacity: 0,
                                color: (opacity = 1) =>
                                    `rgba(255, 254, 79, ${opacity})`,
                                strokeWidth: 2,
                                barPercentage: 0.5,
                                useShadowColorFromDataset: false,
                            }}
                        />
                    ) : (
                        <Flex align="center" justify="center" height="220">
                            <SpinnerWithText title="Visualizing Data..." />
                        </Flex>
                    )}
                </Box>

                {/* Show a list of ads fetched from the db */}
                <ScrollView horizontal={true} m="3" my="8">
                    {ads.map((ad) => (
                        <AdCard {...ad} key={ad.id} />
                    ))}
                </ScrollView>
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

            <Actionsheet
                isOpen={amountForm.isOpen}
                onClose={amountForm.onClose}
            >
                <Actionsheet.Content bgColor="#222" bottom={bottomInset}>
                    <Actionsheet.Item bgColor="transparent" alignItems="center">
                        <Box
                            fontSize="2xl"
                            w={Dimensions.get("window").width * 0.8}
                        >
                            <Text mb="2" fontSize="lg">
                                Enter an amount:{" "}
                            </Text>
                            <Input
                                placeholder="Enter the amount"
                                color="#fff"
                                defaultValue="100"
                                fontSize="xl"
                                keyboardType="number-pad"
                                value={addAmount}
                                onChangeText={(value) => {
                                    setAddAmount(value);
                                }}
                            />
                            <HStack space="3" alignItems="center" my="4">
                                {["500", "1000", "2000"].map(
                                    (amountSuggestion) => (
                                        <Button
                                            variant="outline"
                                            borderColor={"blue.500"}
                                            px="4"
                                            size="sm"
                                            onPress={() => {
                                                setAddAmount(amountSuggestion);
                                            }}
                                            key={amountSuggestion}
                                            _text={{ color: "#ccc" }}
                                        >
                                            {"₹ " + amountSuggestion}
                                        </Button>
                                    )
                                )}
                            </HStack>

                            <Button
                                w="full"
                                variant="solid"
                                bgColor="green.500"
                                size="lg"
                                isDisabled={
                                    parseInt(addAmount) <= 10 ||
                                    parseInt(addAmount) > 5000
                                }
                                onPress={() => {
                                    try {
                                        setLoading(true);

                                        initializePaymentSheet(
                                            parseInt(addAmount) * 100,
                                            initPaymentSheet
                                        ).then((res) => {
                                            amountForm.onClose();

                                            openPaymentSheet(
                                                presentPaymentSheet
                                            ).then((res) => {
                                                // payment has been succesful
                                                addAmountToBalance(
                                                    parseInt(addAmount) * 100
                                                ).then((newBalance) => {
                                                    // dispatch a message saying amount added
                                                    createMessage(
                                                        "Hurray! Amount Added Succesfully"
                                                    );
                                                    dispatch(
                                                        updateProfile({
                                                            profile: {
                                                                balance:
                                                                    newBalance,
                                                            },
                                                        })
                                                    );
                                                    setLoading(false);
                                                });
                                            });
                                        });
                                    } catch (err) {
                                        console.log(err);
                                    }
                                }}
                            >
                                {parseInt(addAmount) <= 10
                                    ? "Amount cannot be less than Rs. 10"
                                    : parseInt(addAmount) > 5000
                                    ? "Amount cannot be greater than Rs. 5000"
                                    : "Add  ₹ " + addAmount}
                            </Button>
                        </Box>
                    </Actionsheet.Item>
                </Actionsheet.Content>
            </Actionsheet>
        </>
    );
};

export default Home;
