import {
    Box,
    Button,
    FlatList,
    HStack,
    ScrollView,
    Skeleton,
    Text,
} from "native-base";
import React, { useEffect, useRef, useState } from "react";
import DrawerToggleButton from "../components/DrawerToggleButton";
import MapView, { Marker } from "react-native-maps";
import customMapStyle from "../util/data/customMapStyle.json";
import {
    getNumberPlates,
    getPreAuthorizedLocations,
    getPreauthSuggestions,
} from "../util/function";
import { useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import PreAuthSuggestionCard from "../components/PreAuth/PreAuthSuggestions";
import Outlet from "../components/PreAuth/Outlet";
import SecondaryText from "../components/Typography/SecondaryText";

const PreAuthSettings = ({ navigation, route }) => {
    const user = useSelector((state) => state.user);
    const authToken = user.access_token;
    const isFocussed = useIsFocused();

    const flatList = useRef(null);

    const [loading, setLoading] = useState({
        numberPlates: true,
        suggestionsLoading: true,
        currentPreauthedLocationsLoading: true,
    });

    const [selectedLP, setSelectedLP] = useState(null);

    const mapRef = useRef(null);
    const [suggestions, setSuggestions] = useState([]);
    const [numberPlates, setNumberPlates] = useState([]);

    // const [marker, setMarker] = useState(null);
    const [preAuthOutlets, setPreAuthOutlets] = useState([]);

    const [preAuthChanged, setPreAuthChanged] = useState(false);

    const [mapRegion, setMapRegion] = useState({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    useEffect(() => {
        // On first load, fetch number plates, and select first number plate
        async function preauthEffect() {
            if (isFocussed) {
                // Fetch number plates
                let res = await getNumberPlates(setNumberPlates);

                // set default selected number plate
                setLoading((loading) => ({ ...loading, numberPlates: false }));
                if (!selectedLP && res.length) {
                    setSelectedLP(res[0].value);
                }
            }
        }

        preauthEffect();
    }, [isFocussed]);

    useEffect(() => {
        // Whenever a user selects a different license plate from the list,
        // refetch the preauth suggestions, currently preauthed outlets

        if (selectedLP) {
            getPreauthSuggestions(selectedLP, setSuggestions, setLoading);

            setLoading((loading) => ({
                ...loading,
                currentPreauthedLocationsLoading: true,
            }));

            // get the preauthorized locations by number plate
            getPreAuthorizedLocations(selectedLP, setPreAuthOutlets).then(
                (response) => {
                    if (response.length) {
                        setMapRegion((mapRegion) => ({
                            ...mapRegion,
                            latitude: response[0].coordinate.latitude,
                            longitude: response[0].coordinate.longitude,
                        }));
                    }
                    setLoading((loading) => ({
                        ...loading,
                        currentPreauthedLocationsLoading: false,
                    }));
                }
            );
        }
    }, [selectedLP, preAuthChanged]);

    return (
        <Box px="3" flex="1">
            <HStack space={4} mb="2">
                <DrawerToggleButton onPress={() => navigation.openDrawer()} />
                <Text color="gray.200" fontSize="3xl" fontWeight="black">
                    Preauthorization
                </Text>
            </HStack>

            <ScrollView style={{ flex: 1 }}>
                <SecondaryText
                    title="Want to skip authentication for places you frequently visit?
                    Pick your number plate to get started."
                    fontSize="lg"
                    mb="3"
                />

                {/* Number Plate Listing */}
                {loading.numberPlates ? (
                    <HStack space="4">
                        {Array(4)
                            .fill(0)
                            .map((elem, index) => (
                                <Skeleton
                                    rounded="sm"
                                    h="12"
                                    w="32"
                                    my="4"
                                    key={index}
                                />
                            ))}
                    </HStack>
                ) : (
                    <FlatList
                        my="3"
                        mb="6"
                        data={numberPlates}
                        showsHorizontalScrollIndicator={false}
                        horizontal={true}
                        renderItem={({ item }) => (
                            <Button
                                variant="outline"
                                bgColor={
                                    item.value == selectedLP
                                        ? "gray.100"
                                        : "transparent"
                                }
                                mr="2"
                                _text={{
                                    color:
                                        item.value == selectedLP
                                            ? "black"
                                            : "gray.100",
                                    fontWeight: "600",
                                    fontFamily: "Montserrat-Bold",
                                }}
                                onPress={() => {
                                    setLoading({
                                        numberPlates: false,
                                        suggestionsLoading: true,
                                        currentPreauthedLocationsLoading: true,
                                    });
                                    setSelectedLP(item.value);
                                }}
                            >
                                {item.value}
                            </Button>
                        )}
                    />
                )}

                {/* Map View */}
                <Box mb="2">
                    <Text
                        fontSize="xl"
                        color="white"
                        fontFamily="Montserrat-Bold"
                        mb="2"
                    >
                        Your Preauthorized Locations
                    </Text>

                    {preAuthOutlets.length != 0 ? (
                        <>
                            <Text
                                color="#ccc"
                                mb="3"
                                // fontSize="md"
                                fontFamily="Poppins-Regular"
                            >
                                Click on the outlet cards down, to view them on
                                map
                            </Text>
                            <Box
                                rounded="2xl"
                                overflow="hidden"
                                borderColor="gray.500"
                                borderWidth="1"
                            >
                                <MapView
                                    ref={mapRef}
                                    style={{
                                        // flex: 0.8,
                                        width: "100%",
                                        height: 200,
                                    }}
                                    region={mapRegion}
                                    customMapStyle={customMapStyle}
                                >
                                    {preAuthOutlets.map((outlet) => {
                                        return (
                                            <Marker
                                                key={outlet.title}
                                                coordinate={outlet.coordinate}
                                                title={outlet.title}
                                            />
                                        );
                                    })}
                                </MapView>
                            </Box>
                        </>
                    ) : (
                        <Box my="8">
                            <Text
                                color="#ccc"
                                mb="3"
                                fontFamily="Poppins-Regular"
                            >
                                You haven't Preauthorized any location
                            </Text>
                        </Box>
                    )}
                </Box>

                {/* Your PreAuthorized Locations */}
                <Box>
                    {/* Map here with overlay cards */}
                    {loading.currentPreauthedLocationsLoading ? (
                        <HStack space="4" my="6">
                            {Array(4)
                                .fill(0)
                                .map((elem, index) => (
                                    <Skeleton h="48" w="64" key={index + 20} />
                                ))}
                        </HStack>
                    ) : (
                        <FlatList
                            ref={flatList}
                            my="4"
                            data={preAuthOutlets}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            bounces={false}
                            decelerationRate="fast"
                            renderItem={({ item }) => (
                                <Outlet
                                    selectedLP={selectedLP}
                                    setPreAuthChanged={setPreAuthChanged}
                                    outlet={{
                                        id: item.id,
                                        outlet_id: item.outlet_id,
                                        name: item.title,
                                        preauthLimit: item.preAuthLimit,
                                        coordinates: item.coordinate,
                                        lastTransaction: item.last_transaction,
                                    }}
                                    mapRef={mapRef}
                                />
                            )}
                            keyExtractor={(item, index) => index}
                        />
                    )}
                </Box>

                <Box my="4">
                    <Text
                        fontSize="xl"
                        color="white"
                        fontFamily="Montserrat-Bold"
                        mb="2"
                    >
                        Our Suggestions
                    </Text>
                    <Text color="#ccc" mb="3" fontFamily="Poppins-Regular">
                        We suggest you preauthorize these places based on your
                        frequency of visits here
                    </Text>

                    {/* Suggestions */}
                    {loading.suggestionsLoading ? (
                        <HStack space="4" my="6">
                            {Array(4)
                                .fill(0)
                                .map((elem, index) => (
                                    <Skeleton h="48" w="64" key={index} />
                                ))}
                        </HStack>
                    ) : (
                        <FlatList
                            my="4"
                            horizontal={true}
                            data={suggestions}
                            ListEmptyComponent={() => (
                                <Text
                                    maxW="90%"
                                    // mx="auto"
                                    p="4"
                                    bg="gray.600"
                                >
                                    Hurray! All your frequent outlets are
                                    preauthorized! Enjoy the speed of payment
                                </Text>
                            )}
                            renderItem={({ item }) => (
                                <PreAuthSuggestionCard
                                    selectedLP={selectedLP}
                                    setPreAuthChanged={setPreAuthChanged}
                                    outlet={{
                                        id: item.outlet.id,
                                        name: item.outlet.outlet_name,
                                        coordinates: item.outlet.coordinates,
                                        lastTransaction: {
                                            date: item.date,
                                            amount: item.amount,
                                        },
                                    }}
                                />
                            )}
                            keyExtractor={(item, index) => index}
                        />
                    )}
                </Box>
            </ScrollView>
        </Box>
    );
};

export default PreAuthSettings;
