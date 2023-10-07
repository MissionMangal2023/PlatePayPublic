import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Button,
    Divider,
    Flex,
    FormControl,
    Input,
    Text,
    View,
} from "native-base";
import {
    TouchableOpacity,
    StyleSheet,
    Alert,
    TextInput,
    ScrollView,
} from "react-native";
import { Camera } from "expo-camera";
// import * as FileSystem from "expo-file-system";
import store from "../store/store";
// import axios from "axios";

const SERVER_URL = "http://192.168.0.129:8000/predict/verifynumplate/";

const SERVER_TRANSACTIONS_URL =
    "http://192.168.0.129:8000/api/v1/getlastthreetransaction/";

async function checkstatus(
    message,
    navigation,
    deviceid,
    outletlocation,
    numberplatetext,
    confidence
) {
    // const [user_name, setUser_name] = useState("");
    const state = store.getState();
    const authToken = state.user.access_token;
    console.log(authToken);
    try {
        const response = await fetch(SERVER_URL, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                number_plate: numberplatetext,
            }),
        });
        const jsonData = await response.json();
        const user_name = jsonData.user_name;
        // if(jsonData.user_name != null || jsonData.user_name != undefined){
        //   setUser_name(jsonData.user_name)
        // }
        if (response.status === 404) {
            return Alert.alert("Error", "Number Plate not found in database");
        } else if (response.status === 424) {
            return navigation.navigate("SusPage", {
                numberplatetext,
                deviceid,
                outletlocation,
                confidence,
                user_name,
            });
        } else if (response.status === 400) {
            return Alert.alert("Error", "Proper Number Plate Was Not Received");
        } else if (response.status === 200) {
            navigation.navigate("AmountPage", {
                numberplatetext,
                deviceid,
                outletlocation,
                confidence,
                user_name,
            });
        }
    } catch (error) {
        console.log(error);
    }

    // if(message === "Number Plate is clean"){
    //   navigation.navigate("AmountPage", { numberplatetext, deviceid, outletlocation, confidence, user_name });
    // }else if(message === "Number Plate: "+numberplatetext+"not found in database"){
    //  return Alert.alert("Error", "Number Plate not found in database")
    // }else if(message === "Number Plate is not clean"){
    //   return navigation.navigate("SusPage", { numberplatetext, deviceid, outletlocation, confidence, user_name })
    // }
}

function receive_num_plate({ navigation }) {
    var num_plate = null;
    const url = "ws://192.168.193.68:8080/ws/process/";
    const ws = new WebSocket(url);
    ws.onopen = (e) => {
        console.log("connected");
    };
    ws.onmessage = (e) => {
        const jsonData = JSON.parse(e.data);
        num_plate = jsonData.num_plate;
        ws.close();
        if (num_plate === "Error detecting number plate") {
            return [num_plate];
        }
        confidence = jsonData.confidence;
        return [num_plate, confidence];
    };
}

const HomePage = ({ navigation }) => {
    const [hasPermission, setHasPermission] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const cameraRef = useRef(null);
    const [logdata, setLogdata] = useState("");
    const [numberplatetext, setNumberplatetext] = useState("GA08L7901");
    const [confidence, setConfidence] = useState(90);
    const [message, setMessage] = useState("");
    const [outletlocation, setOutletlocation] = useState("Tambdi Mati, Goa");
    const [deviceid, setDeviceid] = useState("2145987");
    const state = store.getState();
    const [currentDate, setCurrentDate] = useState("");

    useEffect(() => {
        var date = new Date().getDate(); //Current Date
        var month = new Date().getMonth() + 1; //Current Month
        var year = new Date().getFullYear(); //Current Year
        var hours = new Date().getHours(); //Current Hours
        var min = new Date().getMinutes(); //Current Minutes
        var sec = new Date().getSeconds(); //Current Seconds
        setCurrentDate(
            hours +
                ":" +
                min +
                ":" +
                sec +
                "\n" +
                date +
                "/" +
                month +
                "/" +
                year +
                " "
        );
        const DEVICE_URL = "http://192.168.0.129:8000/api/v1/getdeviceid/";
        const authToken = state.user.access_token;
        try {
            const response = fetch(DEVICE_URL, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            })
                .then((response) => response.json())
                .then((json) => {
                    console.log(json);
                    setDeviceid(json.device_id);
                    setOutletlocation(json.device_location);
                });
        } catch (error) {
            console.log(error);
            return Alert.alert("Error in fetching device id");
        }
    }, []);

    useEffect(() => {
        var num_plate = null;
        const url = "ws://192.168.193.68:8080/ws/process/";
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
            setNumberplatetext(num_plate);
            setConfidence(jsonData.confidence);
        };
    }, []);

    return (
        <Box py="6" px="2" flex="1">
            <Flex
                bg="gray.800"
                direction="row"
                paddingLeft={6}
                justify={"space-between"}
                align="center"
                h="20"
                rounded={"3xl"}
            >
                <Box>
                    <Text
                        fontSize="xl"
                        textAlign={"center"}
                        width={"full"}
                        color="gray.100"
                    >
                        {outletlocation}
                    </Text>
                    <Text color="gray.100">{deviceid}</Text>
                </Box>
                <Box>
                    <Text
                        color="gray.100"
                        fontSize={"4xl"}
                        // fontFamily={"serif"}
                    >
                        {numberplatetext}
                    </Text>
                </Box>
                <Box>
                    <Flex
                        bg="gray.800"
                        px="6"
                        direction="row"
                        justify={"space-between"}
                        align="center"
                        h="20"
                        rounded={"3xl"}
                    >
                        <Box>
                            <Text
                                color="gray.100"
                                rounded={"full"}
                                borderWidth="2"
                                borderColor={"gray.100"}
                                padding="2"
                                display={"flex"}
                                alignItems="center"
                                justifyContent={"center"}
                            >
                                {confidence}
                            </Text>
                        </Box>
                        <Divider mx="3" orientation="vertical" />
                        <Box>
                            <Text
                                marginTop={4}
                                fontSize="xl"
                                textAlign={"center"}
                                width={"full"}
                                color="gray.100"
                            >
                                {currentDate}
                            </Text>
                            <Text color="gray.100"></Text>
                        </Box>
                    </Flex>
                </Box>
            </Flex>
            <View style={{ flex: 1 }}>
                <Camera
                    style={{
                        paddingVertical: 100,
                        marginVertical: 10,
                        marginHorizontal: 100,
                        width: 150,
                        height: 40,
                        overflow: "hidden",
                        borderRadius: 20,
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
            </View>
            <View>
                <ScrollView scrollEnabled={false}>
                    <TextInput style={styles.input} keyboardType="numeric" />
                </ScrollView>
            </View>
            <Box flex="1" pt="8">
                <Flex
                    direction="row"
                    alignItems={"center"}
                    justify="space-between"
                >
                    <Box>
                        {/* <Camera
              style={{
                paddingVertical: 100,
                marginVertical: 10,
                marginHorizontal: 30,
                width: 400,
                height: 300,
                overflow: "hidden",
                borderRadius: 20,
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
            </Camera> */}
                    </Box>
                    <Box
                        p="10"
                        rounded="lg"
                        marginRight={5}
                        style={{
                            elevation: 4,
                        }}
                        flexBasis="40%"
                    >
                        <FormControl>
                            <FormControl.Label>
                                Enter Number Plate
                            </FormControl.Label>
                            <Input placeholder="Enter your number plate" />
                        </FormControl>
                    </Box>
                </Flex>
            </Box>
            <Flex mt="4" direction="row" justify={"space-between"}>
                <Button
                    variant={"outline"}
                    // onPress={() => navigation.navigate("TransactionsPage", { outletlocation, deviceid})}
                    onPress={() =>
                        navigation.navigate("ReportPage", {
                            numberplatetext,
                            deviceid,
                            outletlocation,
                            confidence,
                        })
                    }
                >
                    Report user
                </Button>

                <Button
                    variant={"outline"}
                    // onPress={() => navigation.navigate("TransactionsPage", { outletlocation, deviceid})}
                    onPress={() =>
                        navigation.navigate("TransactionsPage", {
                            outletlocation,
                            deviceid,
                        })
                    }
                >
                    Last Transaction
                </Button>

                <Button
                    variant={"outline"}
                    // onPress={() => navigation.navigate("TransactionsPage", { outletlocation, deviceid})}
                    onPress={() => navigation.navigate("HomePage")}

                    // onPress={() => receive_num_plate()}
                >
                    Num Plate Detection
                </Button>

                <Button
                    variant={"solid"}
                    onPress={() =>
                        checkstatus(
                            message,
                            navigation,
                            deviceid,
                            outletlocation,
                            numberplatetext,
                            confidence
                        )
                    }
                    bgColor="blue.800"
                >
                    Next
                </Button>
            </Flex>
            {/* </View> */}
        </Box>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: "cover", // Choose between 'cover', 'contain', 'stretch', 'repeat', 'center'
    },
    maintext: {
        fontSize: 16,
        margin: 10,
    },
    fixToText: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    separator: {
        marginVertical: 8,
        borderColor: "black",
        borderWidth: 5,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    heading: {
        fontSize: 26,
        fontWeight: "500",
    },
    locations: {
        fontSize: 10,
        fontWeight: "600",
        marginBottom: -8,
        color: "white",
    },
    location: {
        fontSize: 20,
        fontWeight: "600",
        color: "white",
    },
    img: {
        width: 50,
        height: 50,
    },
    card: {
        marginHorizontal: 95,
        marginVertical: 10,
        borderRadius: 3,
        justifyContent: "center",
        width: "90%",
        height: "15%",
    },

    input: {
        marginHorizontal: 880,
        marginVertical: 220,
        width: "50%",
        height: "10%",
    },
    shadowProp: {
        shadowColor: "#171717",
        shadowOffset: { width: -2, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    camera: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        borderWidth: 5,
        borderColor: "black",
    },
    button: {
        flex: 0.3,
        alignSelf: "flex-end",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 10,
        margin: 20,
        borderWidth: 5,
        borderColor: "black",
    },
    text: {
        fontSize: 18,
        color: "white",
    },
});

export default HomePage;
