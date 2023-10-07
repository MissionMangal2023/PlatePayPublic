import { Box, Icon, Pressable } from "native-base";
import { Entypo } from "@expo/vector-icons";
import React from "react";

const DrawerToggleButton = ({ onPress }) => {
    return (
        <Pressable onPress={onPress}>
            <Box bgColor="#343839" p="2" rounded="full">
                <Icon as={Entypo} name="menu" color="white" size="2xl" />
            </Box>
        </Pressable>
    );
};

export default DrawerToggleButton;
