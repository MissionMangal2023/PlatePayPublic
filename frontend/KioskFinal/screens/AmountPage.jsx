import { Camera, CameraType } from "expo-camera";
import {
    Box,
    Button,
    Divider,
    FormControl,
    HStack,
    Heading,
    Icon,
    Image,
    Input,
    KeyboardAvoidingView,
    Modal,
    Text,
} from "native-base";
import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, Alert } from "react-native";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/userSlice";
import {
    getTransactionById,
    makepayment,
    reportCheckNumberPlate,
    reportuser,
} from "../utils/functions";
import NumberPlate from "../components/NumberPlate";
import LastThreeTransactions from "../components/LastThreeTransactions";
import LottieView from "lottie-react-native";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";

let ctx = null;

function Gateway({ transactionData, navigation }) {
    if (!transactionData) return <></>;

    const [transaction, setTransaction] = useState(transactionData);
    const animation = useRef(null);

    const [sound, setSound] = React.useState();

    const speak = () => {
        let voiceMessage;
        if (transaction.status === 0) {
            // Failure
            voiceMessage = `Oh No! Transaction failed`;
        } else if (transaction.status === 2) {
            // Success
            voiceMessage = `Received, Plate Pay Payment of ${transaction.amount} Rupees`;
        }
        Speech.speak(voiceMessage);
    };

    async function playSound() {
        const { sound } = await Audio.Sound.createAsync(
            require("../assets/Sounds/phonepe.mp3")
        );
        setSound(sound);
        await sound.playAsync();
    }

    useEffect(() => {
        if (animation.current) {
            setTimeout(() => {
                animation.current?.reset();
                animation.current?.play();
            }, 100);
        }
    }, [animation.current]);

    useEffect(() => {
        playSound();
        if (transaction.status === 1) {
            console.log("Interval Started");
            ctx = setInterval(() => {
                getTransactionById(transaction.id, setTransaction);
            }, 4000);
        } else {
            speak();
        }

        return () => {
            clearInterval(ctx);
        };
    }, []);

    useEffect(() => {
        console.log("Listener activated", ctx, transaction.status);
        if (ctx !== null && transaction.status !== 1) {
            console.log("Status changed");
            clearInterval(ctx);
            ctx = null;
            speak();
            setTimeout(() => {
                navigation.navigate("HomePage");
            }, 7000);
        }
    }, [transaction]);

    useEffect(() => {
        return sound
            ? () => {
                  console.log("Unloading Sound");
                  sound.unloadAsync();
              }
            : undefined;
    }, [sound]);

    return (
        <>
            {transaction.status === 2 && (
                <>
                    <Image
                        source={require("../assets/lottieanimations/success.gif")}
                        alt="Success"
                        style={{
                            width: "100%",
                            height: 200,
                        }}
                    />
                </>
            )}

            {transaction.status === 1 && (
                <>
                    <Image
                        source={require("../assets/lottieanimations/pending.gif")}
                        alt="Pending"
                        size="xl"
                        style={{
                            width: "100%",
                            height: 200,
                            resizeMode: "contain",
                        }}
                    />
                </>
            )}

            {transaction.status === 0 && (
                <>
                    <Image
                        source={require("../assets/lottieanimations/failed.gif")}
                        alt="Failed"
                        style={{
                            width: "100%",
                            height: 200,
                        }}
                    />
                </>
            )}
        </>
    );
}

const AmountPage = ({ navigation, route }) => {
    const [numberPlate, setNumberPlate] = useState(route.params.number_plate);
    const cameraRef = useRef(null);
    const [type, setType] = useState(CameraType.back);
    const [hasPermission, setHasPermission] = useState(null);
    const user = useSelector((state) => state.user);
    const [showModal, setShowModal] = useState(false);
    const [report_reason, setReason] = useState("");
    const [trigger, setTrigger] = useState("report");
    const dispatch = useDispatch();
    const [transaction, setTransaction] = useState(null);

    const [amount, setAmount] = useState(500);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
        })();
    }, []);

    return (
        <>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{
                    flex: 1,
                }}
            >
                <HStack flex="1">
                    {/* Modal to report user */}
                    <Modal
                        isOpen={showModal}
                        onClose={() => setShowModal(false)}
                    >
                        <Modal.Content maxWidth="400px">
                            <Modal.CloseButton />
                            {trigger === "report" ? (
                                <>
                                    <Modal.Header>Report User</Modal.Header>
                                    <Modal.Body>
                                        <FormControl>
                                            <FormControl.Label>
                                                Enter Message:{" "}
                                            </FormControl.Label>
                                            <Input
                                                value={report_reason}
                                                pb="10"
                                                onChangeText={(text) =>
                                                    setReason(text)
                                                }
                                            />
                                        </FormControl>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button.Group space={2}>
                                            <Button
                                                variant="ghost"
                                                colorScheme="blueGray"
                                                onPress={() => {
                                                    setShowModal(false);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onPress={() => {
                                                    reportuser(
                                                        navigation,
                                                        user.device_id,
                                                        report_reason,
                                                        numberPlate
                                                    );
                                                    setShowModal(false);
                                                }}
                                                colorScheme="danger"
                                            >
                                                Report
                                            </Button>
                                        </Button.Group>
                                    </Modal.Footer>
                                </>
                            ) : trigger === "last3transactions" ? (
                                <>
                                    <Modal.Header>
                                        Last 3 Transactions
                                    </Modal.Header>
                                    <Modal.Body>
                                        <LastThreeTransactions />
                                    </Modal.Body>
                                </>
                            ) : (
                                <>
                                    <Modal.Header>Gateway Page</Modal.Header>
                                    <Modal.Body>
                                        <Gateway
                                            transactionData={transaction}
                                            navigation={navigation}
                                        />
                                    </Modal.Body>
                                </>
                            )}
                        </Modal.Content>
                    </Modal>

                    <Box
                        bg="black"
                        alignItems="center"
                        py="8"
                        width="16"
                        position="relative"
                    >
                        <Icon
                            size="2xl"
                            color="red.600"
                            as={MaterialIcons}
                            mb="6"
                            name="taxi-alert"
                            onPress={() => {
                                if (
                                    reportCheckNumberPlate(
                                        numberPlate,
                                        user.device_id,
                                        navigation
                                    )
                                ) {
                                    // Allow user to report
                                    setTrigger("report");
                                    setShowModal((showModal) => !showModal);
                                } else {
                                    Alert.alert(
                                        "A number plate needs to be detected/entered to report"
                                    );
                                }
                            }}
                        />
                        <Icon
                            size="2xl"
                            color="green.500"
                            as={MaterialIcons}
                            name="payments"
                            onPress={() => {
                                setTrigger("last3transactions");
                                setShowModal(true);
                            }}
                        />

                        <Text
                            style={{ transform: [{ rotate: "-90deg" }] }}
                            color="green.400"
                            position="absolute"
                            top="1/2"
                            fontSize="lg"
                            fontWeight="bold"
                            fontFamily="Poppins-Bold"
                        >
                            Online
                        </Text>
                        <Icon
                            size="2xl"
                            color="red.400"
                            as={AntDesign}
                            mt="auto"
                            name="logout"
                            onPress={() => {
                                dispatch(logout());
                                navigation.navigate("Login");
                            }}
                        />
                    </Box>
                    <Box flex={3 / 5}>
                        <Camera
                            style={{
                                width: "100%",
                                flex: 1,
                            }}
                            ref={cameraRef}
                            type={type}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    setType(
                                        type === Camera.Constants.Type.back
                                            ? Camera.Constants.Type.front
                                            : Camera.Constants.Type.back
                                    );
                                }}
                            ></TouchableOpacity>
                        </Camera>
                    </Box>

                    {/* Numberplate enter + read + next */}
                    <Box
                        flex={2 / 5}
                        pr="10"
                        pl="6"
                        py="4"
                        flexDir="row"
                        alignItems="center"
                        position="relative"
                        // justifyContent="center"
                    >
                        <Box ml="auto" position="absolute" top="8" right="8">
                            {/* Device Id and other details */}
                            <HStack space="2" alignItems="center" mb="5">
                                <Text fontSize="xl" fontWeight="bold">
                                    Device ID:{" "}
                                </Text>
                                <Text fontSize="lg">{user.device_id}</Text>
                            </HStack>
                        </Box>
                        <Box flex={1}>
                            <HStack
                                mb="8"
                                alignItems="center"
                                space={4}
                                mx="auto"
                            >
                                <Image
                                    source={require("../assets/icon.png")}
                                    alt="Plate Pay Icon"
                                    width={60}
                                    height={60}
                                />
                                <Heading size={"xl"}>Plate Pay</Heading>
                            </HStack>

                            <NumberPlate numberPlate={numberPlate} />
                            <Divider
                                bg="gray.400"
                                w="75%"
                                mx="auto"
                                my="4"
                                mb="8"
                            />
                            <FormControl isInvalid={false}>
                                <FormControl.Label>
                                    Enter Amount
                                </FormControl.Label>
                                <Input
                                    size="2xl"
                                    value={amount.toString()}
                                    placeholder="500"
                                    onChangeText={(text) => {
                                        if (isNaN(text)) {
                                            text = "0";
                                        }
                                        setAmount(parseFloat(text));
                                    }}
                                    keyboardType="numeric"
                                    mb="6"
                                />
                                <Button
                                    colorScheme="primary"
                                    onPress={async () => {
                                        setTrigger("transaction");
                                        let transactionData = await makepayment(
                                            amount,
                                            1,
                                            numberPlate,
                                            user.device_id,
                                            navigation
                                        );
                                        if (transactionData) {
                                            setTransaction(transactionData);
                                            setShowModal(true);
                                            // console.log(transactionData);
                                        } else {
                                            Alert.alert(
                                                "Error",
                                                "Some error occured!"
                                            );
                                        }
                                    }}
                                >
                                    Proceed to Payment
                                </Button>
                            </FormControl>
                        </Box>
                    </Box>
                </HStack>
            </KeyboardAvoidingView>
        </>
    );
};

export default AmountPage;
