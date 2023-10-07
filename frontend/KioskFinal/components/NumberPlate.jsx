import { Box, Flex, Image, Pressable, Text } from "native-base";

const NumberPlate = ({ numberPlate, onPress, ...props }) => {
    return (
        <>
            <Pressable onPress={onPress}>
                <Flex
                    bgColor="#eee"
                    py="2"
                    px="4"
                    direction="row"
                    align="center"
                    justify="space-between"
                    mb="4"
                    rounded="2xl"
                    borderColor="gray.500"
                    borderWidth="4"
                    {...props}
                    // mx="auto"
                >
                    <Image
                        source={{
                            uri: "https://cdn.pixabay.com/photo/2016/08/24/17/07/india-1617463_960_720.png",
                        }}
                        alt="Indian Flag Pic"
                        size="xl"
                        width="12"
                        height="8"
                        mr="6"
                    />
                    <Text
                        color="#363636"
                        bold
                        textAlign="center"
                        fontSize="3xl"
                        style={{
                            fontFamily: "RobotoCondensed-Bold",
                            fontWeight: "600",
                        }}
                    >
                        {numberPlate}
                    </Text>
                    <Box></Box>
                </Flex>
            </Pressable>
        </>
    );
};

export default NumberPlate;
