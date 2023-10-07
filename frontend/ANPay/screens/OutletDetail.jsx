import {
    Box,
    Button,
    FlatList,
    HStack,
    Icon,
    Input,
    KeyboardAvoidingView,
    Pressable,
    Text,
    VStack,
} from "native-base";
import React, { useEffect, useState } from "react";
import HeaderWithMenuProfileGreeting from "../components/HeaderWithMenuProfileGreeting";
import { useSelector } from "react-redux";
import { AntDesign, FontAwesome, Octicons, Entypo } from "@expo/vector-icons";
import {
    createMessage,
    getFileTypeFromFilename,
    getOutletDetail,
    toggleMachineOnOff,
} from "../util/function";
import { Platform, TouchableOpacity, useWindowDimensions } from "react-native";
import { TabView } from "react-native-tab-view";
import LastWeekTransactionsScene from "../components/MerchantInfo/LastWeekTransactionsScene";
import AllTransactions from "../components/MerchantInfo/AllTransactions";
import * as ImagePicker from "expo-image-picker";
import { Formik } from "formik";
import PrimaryButton from "../components/Utility/PrimaryButton";
import axios from "axios";
const yup = require("yup");

const StolenVehicles = ({ outletData, navigation }) => {
    return (
        <>
            <Text fontSize="2xl" fontWeight="bold" color="gray.200">
                Stolen Vehicles Record
            </Text>

            <Text
                fontSize="lg"
                color="gray.400"
                mb="6"
                fontFamily="RobotoCondensed-Regular"
            >
                Click on the individual number plates to see the last
                transaction at your outlet
            </Text>

            <FlatList
                data={outletData.stolen_vehicles}
                keyExtractor={(item) => item.value}
                ListEmptyComponent={() => {
                    return (
                        <Text fontSize="lg" color="gray.400" px="4">
                            Hurray! No currently stolen vehicles reported at
                            your outlets
                        </Text>
                    );
                }}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() =>
                            navigation.navigate("TransactionDetail", {
                                transactionId: item.transaction.id,
                            })
                        }
                        backgroundColor="gray.800"
                        mb="2"
                        p="4"
                        borderWidth={2}
                        borderColor="red.500"
                        rounded="lg"
                    >
                        <HStack
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <Text
                                color="white"
                                fontFamily="RobotoCondensed-Bold"
                                fontSize="lg"
                                rounded="md"
                            >
                                {item?.value}
                            </Text>
                            <Box>
                                <Text fontWeight="bold">
                                    Stolen on{" "}
                                    {item?.stolen_timing.slice(0, 10) +
                                        " at " +
                                        item?.stolen_timing.slice(11, 16)}
                                </Text>
                                <Text>
                                    Last Transaction was for Rs.{" "}
                                    {item?.transaction.amount} on{" "}
                                    {item?.transaction.timing}
                                </Text>
                            </Box>
                        </HStack>
                    </Pressable>
                )}
            />
        </>
    );
};

function UploadAdScreen({ outletData, navigation }) {
    const [requestBody, setRequestBody] = useState(null);
    const [uploadingAd, setUploadingAd] = useState(false);

    async function selectAd(setValue) {
        let result = await ImagePicker.launchImageLibraryAsync({
            // only images are allowed
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            let localUri = result.assets[0].uri;
            let filename = localUri.split("/").pop();
            let type = getFileTypeFromFilename(filename, "image");

            setValue(filename);
            setRequestBody({
                uri: result.assets[0].uri,
                name: filename,
                type,
            });

            return {
                uri: result.assets[0].uri,
                name: filename,
                type,
            };
        }
    }

    return (
        <>
            <Text fontSize="2xl" fontWeight="bold" color="gray.200">
                Upload ADs
            </Text>

            <Text
                fontSize="lg"
                color="gray.400"
                mb="6"
                fontFamily="RobotoCondensed-Regular"
            >
                Ads that you upload here will be shown to our users on the home
                page. We will deduct the charges from your wallet.
            </Text>

            <Formik
                initialValues={{
                    ad_image: "",
                    link: "",
                    outlet_id: outletData.id,
                }}
                onSubmit={async (values) => {
                    // console.log({ ...requestBody, ...values });
                    setUploadingAd(true);

                    const formData = new FormData();
                    formData.append("ad_image", requestBody);
                    formData.append("link", values.link);
                    formData.append("outlet", values.outlet_id);

                    try {
                        let response = await axios.post(
                            "api/v1/merchant/ads/",
                            formData,
                            {
                                headers: {
                                    "Content-Type": "multipart/form-data",
                                },
                                transformRequest: (data) => {
                                    // !!! override data to return formData
                                    // since axios converts that to string
                                    return data;
                                },
                                data: formData,
                            }
                        );
                        console.log(response.data);
                    } catch (err) {
                        console.error(err, err.response);
                        createMessage(
                            "Something went wrong while uploading ad",
                            "danger"
                        );
                    } finally {
                        setUploadingAd(false);
                    }
                }}
                validationSchema={yup.object().shape({
                    link: yup.string().url("Invalid Link").required(),
                })}
            >
                {({
                    values,
                    handleChange,
                    errors,
                    setFieldTouched,
                    touched,
                    handleSubmit,
                }) => (
                    <Box>
                        {/* Name Input */}
                        <Box mb="4">
                            <Pressable
                                onPress={() =>
                                    selectAd(handleChange("ad_image"))
                                }
                            >
                                <Input
                                    value={values.ad_image}
                                    pointerEvents="none"
                                    editable={false}
                                    placeholder="Pick an Image"
                                    InputLeftElement={
                                        <Icon
                                            as={<Entypo name="image" />}
                                            size={5}
                                            ml="2"
                                            color="gray.400"
                                        />
                                    }
                                    size="xl"
                                    color="gray.100"
                                    rounded="2xl"
                                    mb="1"
                                />
                            </Pressable>
                        </Box>

                        {/* Link Input */}
                        <Box mb="4">
                            <Input
                                value={values.link}
                                onChangeText={handleChange("link")}
                                placeholder="Link to Redirect to"
                                InputLeftElement={
                                    <Icon
                                        as={<AntDesign name="link" />}
                                        size={5}
                                        ml="2"
                                        color="gray.400"
                                    />
                                }
                                mb="1"
                                size="xl"
                                color="gray.100"
                                rounded="2xl"
                                onBlur={() => setFieldTouched("link")}
                            />
                            {touched.link && errors.link && (
                                <Text
                                    color="red.400"
                                    style={{
                                        fontSize: 12,
                                    }}
                                >
                                    {errors.link}
                                </Text>
                            )}
                        </Box>

                        <PrimaryButton
                            isLoading={uploadingAd}
                            isLoadingText="Uploading AD"
                            onPress={async () => {
                                handleSubmit();
                            }}
                        >
                            Upload AD
                        </PrimaryButton>
                    </Box>
                )}
            </Formik>
        </>
    );
}

const _renderTabBar = (props, setIndex) => {
    const inputRange = props.navigationState.routes.map((x, i) => i);

    return (
        <Box flexDir="row" alignItems="center" justifyContent="center">
            {props.navigationState.routes.map((route, i) => {
                let filled = false;
                const currentIndex = props.navigationState.index;
                if (i === currentIndex) {
                    filled = true;
                }

                return (
                    <TouchableOpacity
                        key={route.title}
                        style={{
                            alignItems: "center",
                        }}
                        onPress={() => setIndex(i)}
                    >
                        {filled ? (
                            <Icon
                                size="xl"
                                mt="3"
                                as={Octicons}
                                name="dot-fill"
                            />
                        ) : (
                            <Icon size="xl" mt="3" as={Octicons} name="dot" />
                        )}
                    </TouchableOpacity>
                );
            })}
        </Box>
    );
};

// https://reactnavigation.org/docs/tab-view/
// Refer this

const OutletDetail = ({ navigation, route }) => {
    const outlet = route.params.outlet;
    const user = useSelector((state) => state.user);
    const [blockedState, setBlockedState] = useState(!outlet.machine_status);
    const [outletData, setOutletData] = useState(null);

    const renderScene = ({ route }) => {
        switch (route.key) {
            case "lastweektransactions":
                return (
                    <LastWeekTransactionsScene
                        outlet={outlet}
                        outletData={outletData}
                    />
                );
            case "alltransactions":
                return (
                    <AllTransactions
                        outletData={{ ...outletData, ...outlet }}
                        navigation={navigation}
                    />
                );
            case "stolenvehicles":
                return (
                    <StolenVehicles
                        outletData={{ ...outletData, ...outlet }}
                        navigation={navigation}
                    />
                );
            case "uploadAd":
                return (
                    <UploadAdScreen
                        outletData={{ ...outletData, ...outlet }}
                        navigation={navigation}
                    />
                );
            default:
                return null;
        }
    };

    const layout = useWindowDimensions();

    const [index, setIndex] = React.useState(1);
    const [routes] = React.useState([
        { key: "alltransactions", title: "All Transactions" },
        { key: "lastweektransactions", title: "Last Week Transactions" },
        { key: "stolenvehicles", title: "Stolen Vehicles" },
        { key: "uploadAd", title: "Upload ADs" },
    ]);

    useEffect(() => {
        getOutletDetail(outlet.id, setOutletData).then(console.log);
    }, []);

    return (
        <>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <Box px="2" flex="1">
                    <HeaderWithMenuProfileGreeting
                        navigation={navigation}
                        user={user}
                        greeting={false}
                        title={outlet.outlet_name}
                    />

                    <HStack space={6} px="2" mb="8" alignItems="center">
                        <Icon
                            size="6xl"
                            color="green.400"
                            as={Entypo}
                            name="shop"
                        />

                        <VStack space={2} flex={1}>
                            <Text color="gray.400">
                                Device Id: # {outlet.device_id}
                            </Text>
                            <Text
                                fontSize="3xl"
                                fontWeight="black"
                                lineHeight="sm"
                            >
                                {outlet.outlet_name}
                            </Text>
                            <Text color="gray.100">{outlet.location}</Text>
                        </VStack>
                    </HStack>
                    {/* Graph and Transactions in a single tab */}

                    <TabView
                        navigationState={{ index, routes }}
                        renderScene={renderScene}
                        onIndexChange={setIndex}
                        initialLayout={{ width: layout.width }}
                        renderTabBar={(props) => _renderTabBar(props, setIndex)}
                        tabBarPosition="bottom"
                    />
                </Box>

                {/* Turn machine off button */}
                <Box p="3">
                    <Button
                        colorScheme={!blockedState ? "success" : "danger"}
                        size="lg"
                        py="4"
                        rounded="full"
                        onPress={() => {
                            toggleMachineOnOff(outlet.id).then((status) => {
                                if (status === "success") {
                                    setBlockedState(
                                        (blockedState) => !blockedState
                                    );
                                }
                            });
                        }}
                        leftIcon={
                            !blockedState ? (
                                <Icon
                                    as={FontAwesome}
                                    name="check-circle-o"
                                    color="#eee"
                                    mr="2"
                                />
                            ) : (
                                <Icon
                                    as={AntDesign}
                                    name="minuscircle"
                                    color="#eee"
                                    mr="2"
                                />
                            )
                        }
                    >
                        {!blockedState ? "Machine On" : "Machine Off"}
                    </Button>
                </Box>
            </KeyboardAvoidingView>
        </>
    );
};

export default OutletDetail;
