import { HStack, Text, VStack } from "native-base";
import { textColorByStatus } from "../utils/functions";

function SingleSale({ sale }) {
    return (
        <HStack
            space={4}
            alignItems="center"
            justifyContent="space-between"
            mb="3"
            rounded="xl"
            backgroundColor="blueGray.200"
            py="2"
            px="4"
        >
            <VStack>
                <Text
                    fontFamily="RobotoCondensed-Bold"
                    fontSize="lg"
                    fontWeight="bold"
                >
                    {sale?.number_plate}
                </Text>
                <Text>
                    {sale?.timing.slice(0, 10) +
                        " :: " +
                        sale?.timing.slice(11, 19)}
                </Text>
            </VStack>
            <Text bold color={textColorByStatus(sale?.status)}>
                Rs. {sale?.amount}
            </Text>
        </HStack>
    );
}

export default SingleSale;
