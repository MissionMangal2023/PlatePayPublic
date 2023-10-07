import {
    AspectRatio,
    Box,
    HStack,
    Heading,
    Pressable,
    Stack,
    Switch,
    Text,
} from "native-base";
import React, { useRef, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import customMapStyle from "../../util/data/customMapStyle.json";
import { toggleMachineOnOff } from "../../util/function";

const Outlet = ({ outlet, navigation }) => {
    const [blockedState, setBlockedState] = useState(!outlet.machine_status);
    const [mapRegion, setMapRegion] = useState({
        latitude: 15.2768655,
        longitude: 73.9712484,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const mapRef = useRef(null);

    return (
        <Box alignItems="center" my="4">
            <Box
                maxW="80"
                rounded="lg"
                overflow="hidden"
                borderWidth="1"
                borderColor="coolGray.700"
                backgroundColor="gray.800"
            >
                <Pressable
                    onPress={() =>
                        navigation.navigate("OutletDetail", { outlet })
                    }
                >
                    <Text p="3" color="gray.100" bg="#ffa50068">
                        Device Id: <Text>{outlet.device_id}</Text>
                    </Text>
                </Pressable>
                <Box>
                    <AspectRatio w="100%" ratio={16 / 9}>
                        <MapView
                            ref={mapRef}
                            style={{
                                width: "100%",
                            }}
                            region={mapRegion}
                            customMapStyle={customMapStyle}
                        >
                            <Marker
                                coordinate={{
                                    latitude: parseFloat(
                                        outlet.coordinates.split(",")[0]
                                    ),
                                    longitude: parseFloat(
                                        outlet.coordinates.split(",")[1]
                                    ),
                                }}
                                title={outlet.outlet_name}
                            />
                        </MapView>
                    </AspectRatio>
                </Box>

                <Stack p="4" space={3}>
                    <Stack space={2}>
                        <Heading size="md" ml="-1">
                            {outlet.outlet_name}
                        </Heading>
                        <Text
                            fontSize="xs"
                            _light={{
                                color: "violet.500",
                            }}
                            _dark={{
                                color: "violet.400",
                            }}
                            fontWeight="500"
                            ml="-0.5"
                            mt="-1"
                        >
                            {outlet.location}
                        </Text>
                    </Stack>
                    <Text fontWeight="400">
                        {outlet.transactions_today} transactions today
                    </Text>
                    <Text color="gray.400">
                        <Text
                            fontSize={"xl"}
                            color="gray.100"
                            fontWeight="bold"
                            fontFamily="NotoSerif-Black"
                            mx="2"
                        >
                            ₹ {outlet.sales_today}
                        </Text>
                        {"   "}
                        (Sale Today)
                    </Text>

                    <Text color="gray.400">
                        <Text
                            fontSize={"xl"}
                            color="gray.100"
                            fontWeight="bold"
                            fontFamily="NotoSerif-Black"
                            mx="2"
                        >
                            ₹ {outlet.total_sales}
                        </Text>
                        {"   "}
                        (Total Sales)
                    </Text>
                </Stack>
                <HStack
                    py="2"
                    space={2}
                    justifyContent="center"
                    alignItems="center"
                    borderTopWidth={2}
                    bg="#FFFF004e"
                >
                    <Text fontWeight="bold">
                        Turn {!outlet.machine_status ? "On" : "Off"} Machine
                    </Text>
                    <Switch
                        isChecked={!blockedState}
                        colorScheme="success"
                        onToggle={() =>
                            toggleMachineOnOff(outlet.id).then((status) => {
                                if (status === "success") {
                                    setBlockedState(
                                        (blockedState) => !blockedState
                                    );
                                }
                            })
                        }
                    />
                </HStack>
            </Box>
        </Box>
    );
};

export default Outlet;
