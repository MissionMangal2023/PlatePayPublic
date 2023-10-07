import { Box, Image, Pressable } from "native-base";
import { Alert, Dimensions, Linking } from "react-native";
import { openLink } from "../util/function";

const AdCard = ({ ad_image, link }) => {
    const image = ad_image;
    const CARD_WIDTH = Dimensions.get("window").width * 0.8;
    const CARD_HEIGHT = CARD_WIDTH / 2;

    return (
        <Pressable
            rounded="2xl"
            overflow="hidden"
            mx="3"
            style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
            }}
            onPress={() => openLink(link)}
        >
            <Image
                source={{
                    uri: image,
                }}
                alt="Ad"
                // size="xs"
                style={{
                    width: "100%",
                    height: "100%",
                }}
            />
        </Pressable>
    );
};

export default AdCard;
