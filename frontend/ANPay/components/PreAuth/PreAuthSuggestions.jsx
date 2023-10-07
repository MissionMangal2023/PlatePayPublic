import { useState } from "react";
import { addOutletToPreauth } from "../../util/function";
import { Box, Button, HStack, Icon, Slider, Text } from "native-base";
import { Dimensions } from "react-native";
import { AntDesign } from "@expo/vector-icons";

function PreAuthSuggestionCard({ outlet, selectedLP, setPreAuthChanged }) {
    const [sliderValue, setSliderValue] = useState(200);
    const [loading, setIsLoading] = useState(false);

    async function addPreAuthHandler(e) {
        setIsLoading(true);
        try {
            let res = await addOutletToPreauth(
                outlet.id,
                sliderValue,
                selectedLP
            );
            setPreAuthChanged((prev) => !prev);
            // This change triggers a rerender
        } catch (err) {
            if (err.response) {
                console.log(err.response);
            } else {
                console.log(err);
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Box
            rounded="xl"
            bg="gray.800"
            borderWidth={1}
            borderColor="gray.600"
            px="4"
            py="2"
            mr="4"
            w={(Dimensions.get("window").width * 3) / 4}
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
            <Text color="gray.100" fontSize="sm" mb="2">
                Last Transaction was on {outlet.lastTransaction.date} for Rs.{" "}
                {outlet.lastTransaction.amount}
            </Text>

            <HStack>
                <Text color="gray.100" mb="2" bold mr="1">
                    PreAuth Limit:
                </Text>
                <Text color="gray.100" mb="2">
                    Rs. {sliderValue}
                </Text>
            </HStack>
            <Box mx="2">
                <Slider
                    // w="3/4"
                    maxW="300"
                    w="full"
                    value={sliderValue}
                    onChange={setSliderValue}
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
            </Box>
            <Button
                onPress={addPreAuthHandler}
                variant="solid"
                colorScheme="success"
                my="2"
                isLoading={loading}
                isLoadingText="Authorizing"
                // disabled={loading}
                leftIcon={
                    <Icon
                        size="md"
                        as={AntDesign}
                        name="pluscircle"
                        color="white"
                    />
                }
            >
                PreAuthorize Outlet
            </Button>
        </Box>
    );
}

export default PreAuthSuggestionCard;
