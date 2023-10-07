import React, { useEffect, useRef, useState } from "react";
import { Box, Button, FlatList, HStack, Icon, Text } from "native-base";
import HeaderWithMenuProfileGreeting from "../components/HeaderWithMenuProfileGreeting";
import { useSelector } from "react-redux";
import {
    formatLocationHistory,
    getAccessToken,
    getCoordinatesFromString,
    getNumberPlates,
    labelCoordsArray,
    moveMapPointer,
} from "../util/function";
import MapView, { Marker, Polyline } from "react-native-maps";
import axios from "axios";
import { FontAwesome5 } from "@expo/vector-icons";
import SpinnerWithText from "../components/SpinnerWithText";

function getUniqueLocations(locs) {
    res = [];
    for (let i = 0; i < locs.length; i++) {
        let nextCoord = locs[i].coordinates;
        let isExists = false;
        for (let j = 0; j < res.length; j++) {
            if (res[j].coordinates === nextCoord) {
                isExists = true;
                break;
            }
        }
        if (isExists) {
            continue;
        } else {
            res.push(locs[i]);
        }
    }
    return res;
}

const Locations = ({ navigation }) => {
    const user = useSelector((state) => state.user);
    const [loading, setLoading] = useState(true);
    const [selectedLP, setSelectedLP] = useState("default");
    const [numberPlates, setNumberPlates] = useState([]);
    const [locations, setLocations] = useState([]);
    const [mapRegion, setMapRegion] = useState({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const mapRef = useRef(null);

    useEffect(() => {
        async function preauthEffect() {
            // Fetch number plates
            if (!numberPlates.length) {
                let lp = await getNumberPlates(setNumberPlates);
            }

            // Now, fetch the locations for the lp
            try {
                let locationsResponse = await axios.get(
                    `api/v1/user/${selectedLP}/transactions/locations`,
                    {
                        headers: {
                            Authorization: `Bearer ${getAccessToken()}`,
                        },
                    }
                );
                if (locationsResponse.status === 200) {
                    if (selectedLP === "default") {
                        setSelectedLP(locationsResponse.data.number_plate);
                    }
                    console.log(locationsResponse.data);
                    setLocations(locationsResponse.data.location_info);
                    if (locationsResponse.data.location_info[0])
                        setMapRegion((mapRegion) => ({
                            ...mapRegion,
                            ...labelCoordsArray(
                                getCoordinatesFromString(
                                    locationsResponse.data.location_info[0]
                                        .coordinates
                                )
                            ),
                        }));
                }
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        }

        preauthEffect();
    }, [selectedLP]);

    return (
        <Box px="2" flex="1">
            <HeaderWithMenuProfileGreeting
                navigation={navigation}
                user={user}
            />

            {loading ? (
                <Box my="10">
                    <SpinnerWithText title="Travelling Back in Time..." />
                </Box>
            ) : (
                <Box flex={1}>
                    {numberPlates.length > 0 ? (
                        <>
                            <Box>
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
                                                setLoading(true);
                                                setSelectedLP(item.value);
                                            }}
                                        >
                                            {item.value}
                                        </Button>
                                    )}
                                />
                            </Box>

                            <Box flex={1} rounded="2xl" overflow="hidden">
                                <MapView
                                    style={{
                                        flex: 0.8,
                                    }}
                                    ref={mapRef}
                                    initialRegion={mapRegion}
                                >
                                    {getUniqueLocations(locations).map(
                                        (location, index) => {
                                            let [latitude, longitude] =
                                                getCoordinatesFromString(
                                                    location.coordinates
                                                );
                                            return (
                                                <Marker
                                                    key={location.coordinates}
                                                    pinColor={
                                                        index ? "orange" : "red"
                                                    }
                                                    coordinate={{
                                                        latitude,
                                                        longitude,
                                                    }}
                                                    title={`${
                                                        location.name
                                                    } - Last Visit on ${location.timing.slice(
                                                        0,
                                                        10
                                                    )}`}
                                                />
                                            );
                                        }
                                    )}
                                    <Polyline
                                        coordinates={formatLocationHistory(
                                            locations
                                        )}
                                        strokeColor="#000"
                                        strokeColors={["#7F0000"]}
                                        strokeWidth={6}
                                    />
                                </MapView>
                            </Box>

                            <Box
                                bg="gray.800"
                                roundedTop="3xl"
                                position="absolute"
                                bottom="0"
                                left="0"
                                right="0"
                            >
                                <Box p="6">
                                    <HStack
                                        alignItems="center"
                                        space={3}
                                        mb="4"
                                    >
                                        <Icon
                                            as={FontAwesome5}
                                            name="map-marker"
                                            size="5xl"
                                            color="red.500"
                                            onPress={() => {
                                                if (locations.length) {
                                                    moveMapPointer(
                                                        mapRef,
                                                        labelCoordsArray(
                                                            getCoordinatesFromString(
                                                                locations[0]
                                                                    .coordinates
                                                            )
                                                        )
                                                    );
                                                }
                                            }}
                                        />

                                        <Text
                                            fontSize="lg"
                                            color="gray.100"
                                            style={{
                                                fontFamily: "Montserrat-Bold",
                                                fontWeight: "500",
                                            }}
                                        >
                                            Last Seen at:{" "}
                                            {"\n" +
                                                (locations[0]
                                                    ? locations[0].name
                                                    : "No Records Found! :( \nBut we are always up 👮")}
                                        </Text>
                                    </HStack>
                                    {locations.length > 0 && (
                                        <Button
                                            colorScheme="black"
                                            bgColor="white"
                                            _text={{ color: "black" }}
                                            onPress={() => {
                                                navigation.navigate(
                                                    "TransactionDetail",
                                                    {
                                                        transactionId:
                                                            locations[0]
                                                                .transactionId,
                                                    }
                                                );
                                            }}
                                        >
                                            Go To Last Transaction
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </>
                    ) : (
                        <>
                            <Text
                                color="gray.100"
                                textAlign="center"
                                fontWeight="thin"
                                fontSize="xl"
                                px="2"
                            >
                                No Number plates linked to your account!
                            </Text>
                            <Text
                                color="gray.100"
                                textAlign="center"
                                my="4"
                                px="2"
                            >
                                To track the locations of your vehicle, add
                                number plate
                            </Text>
                        </>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default Locations;
