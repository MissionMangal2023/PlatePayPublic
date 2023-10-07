import { Avatar, Pressable } from "native-base";
import React from "react";

const GoToProfile = ({ onPress, title }) => {
    return (
        <Pressable onPress={onPress}>
            <Avatar bg="amber.400" mr="1" _text={{ color: "black" }}>
                {title}
            </Avatar>
        </Pressable>
    );
};

export default GoToProfile;
