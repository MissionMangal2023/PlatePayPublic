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
    reportCheckNumberPlate,
    reportuser,
    verifyNumberPlate,
} from "../utils/functions";
import NumberPlate from "../components/NumberPlate";
import LastThreeTransactions from "../components/LastThreeTransactions";
import store from "../store/store";
import axiosInstance from "../utils/axiosInstance";

const takePicture = async (setNumberPlate, cameraRef) => {
    const state = store.getState();
    const authToken = state.user.access_token;
    const SERVER_URL = "predict/numberplatetext/";
    if (cameraRef.current) {
        const options = { quality: 0.5, base64: true };
        const photo = await cameraRef.current.takePictureAsync(options);
        const uri = photo.uri;
        const base64 = photo.base64;

        const formData = new FormData();
        formData.append("photo", {
            uri: uri,
            name: "photo.jpg",
            type: "image/jpeg",
        });
        console.log("Inside Function");
        try {
            const response = await axiosInstance.post(SERVER_URL, formData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            const server_response_data = response.data;

            console.log("Server response:", server_response_data);
            // Check is server sent an error message
            if (server_response_data.error) {
                // return Alert.alert('Error', server_response_data.error);
                console.log("Error Server:", server_response_data.error);
            }
            if (server_response_data) {
                setNumberPlate(server_response_data);
                // Add code to stop the recursion
            }
        } catch (error) {
            return Alert.alert("Error", error.message);
        }
    }
};

const TakePicture = ({ navigation }) => {
    const [numberPlate, setNumberPlate] = useState("GA07L7901");
    const cameraRef = useRef(null);
    const [type, setType] = useState(CameraType.back);
    const [hasPermission, setHasPermission] = useState(null);
    const user = useSelector((state) => state.user);
    const [showModal, setShowModal] = useState(false);
    const [report_reason, setReason] = useState("");
    const [trigger, setTrigger] = useState("report");
    const dispatch = useDispatch();

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
        })();

        var num_plate = null;
        const url = "ws://192.168.8.68:8001/ws/process/";
        const ws = new WebSocket(url);
        ws.onopen = (e) => {
            console.log("connected");
        };
        ws.onmessage = (e) => {
            const jsonData = JSON.parse(e.data);
            num_plate = jsonData.num_plate;
            ws.close();
            if (num_plate === "Error detecting number plate") {
                return Alert.alert("Error", "Error detecting number plate"); // Check this part later
            }
            setNumberPlate(num_plate);
        };
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
                            ) : (
                                <>
                                    <Modal.Header>
                                        Last 3 Transactions
                                    </Modal.Header>
                                    <Modal.Body>
                                        <LastThreeTransactions />
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
                            mb="6"
                            as={MaterialIcons}
                            name="payments"
                            onPress={() => {
                                setTrigger("last3transactions");
                                setShowModal(true);
                            }}
                        />

                        <Icon
                            size="2xl"
                            color="white"
                            as={MaterialIcons}
                            name="photo-camera"
                            onPress={() => {
                                takePicture(setNumberPlate, cameraRef);
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

                            <NumberPlate
                                onPress={() =>
                                    verifyNumberPlate(
                                        numberPlate,
                                        user.device_id,
                                        navigation
                                    )
                                }
                                numberPlate={numberPlate}
                            />
                            <Divider
                                bg="gray.400"
                                w="75%"
                                mx="auto"
                                my="4"
                                mb="8"
                            />
                            <FormControl isInvalid={false}>
                                <FormControl.Label>
                                    Enter your Number Plate
                                </FormControl.Label>
                                <Input
                                    size="2xl"
                                    value={numberPlate}
                                    placeholder="GA08B0131"
                                    onChangeText={setNumberPlate}
                                />
                            </FormControl>
                        </Box>
                    </Box>
                </HStack>
            </KeyboardAvoidingView>
        </>
    );
};

export default TakePicture;
