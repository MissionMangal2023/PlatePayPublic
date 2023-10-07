import { Box, Button, HStack, Pressable, Slider, Text } from "native-base";
import { useState } from "react";
import {
    moveMapPointer,
    removeReportOutlet,
    updatePreAuthorizedLimit,
} from "../../util/function";

export default function Outlet({
    mapRef,
    outlet,
    selectedLP,
    setPreAuthChanged,
}) {
    const [updatedOutletValue, setUpdatedOutletValue] = useState(
        outlet.preauthLimit
    );

    return (
        <Pressable
            maxW={300}
            onPress={() => {
                moveMapPointer(mapRef, outlet.coordinates);
            }}
        >
            <Box
                rounded="xl"
                bg="gray.800"
                borderWidth={1}
                borderColor="gray.600"
                px="4"
                py="2"
                mr="4"
            >
                <Text
                    fontFamily="Montserrat-Bold"
                    fontWeight="bold"
                    color="gray.100"
                    fontSize="lg"
                    mb="2"
                >
                    {outlet.name}
                </Text>
                {outlet.lastTransaction ? (
                    <Text color="gray.100" fontSize="sm" mb="2">
                        Last Transaction was on{" "}
                        {outlet.lastTransaction.date.slice(0, 10)} for Rs.{" "}
                        {outlet.lastTransaction.amount}
                    </Text>
                ) : (
                    <Text color="gray.100" fontSize="sm" mb="2">
                        No Past Preauth Transactions Found
                    </Text>
                )}
                <HStack>
                    <Text color="gray.100" mb="2" bold mr="1">
                        PreAuth Limit:
                    </Text>
                    <Text color="gray.100" mb="2">
                        Rs. {updatedOutletValue}
                    </Text>
                </HStack>
                <Slider
                    // w="3/4"
                    maxW="300"
                    // defaultValue={1000}
                    value={updatedOutletValue}
                    onChangeEnd={(changedValue) => {
                        // make an api call here to update preAuthValue
                        updatePreAuthorizedLimit(
                            selectedLP,
                            outlet.outlet_id,
                            changedValue
                        ).then((res) => {
                            console.log(res.data);
                            if (res) {
                                setUpdatedOutletValue(res.preAuthLimit);
                            }
                        });
                    }}
                    minValue={200}
                    maxValue={2000}
                    accessibilityLabel="Preauth Limit Slider"
                    step={100}
                >
                    <Slider.Track>
                        <Slider.FilledTrack />
                    </Slider.Track>
                    <Slider.Thumb />
                </Slider>
                {/* Report and Remove */}
                <Button
                    my="2"
                    colorScheme="danger"
                    onPress={() =>
                        removeReportOutlet(selectedLP, outlet.outlet_id)
                            .then((res) => {
                                setPreAuthChanged((prev) => !prev);
                            })
                            .catch((err) => console.log(err))
                    }
                >
                    Revoke PreAuth
                </Button>
            </Box>
        </Pressable>
    );
}
