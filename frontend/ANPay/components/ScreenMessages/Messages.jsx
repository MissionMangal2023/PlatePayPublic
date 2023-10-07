import React, { useEffect } from "react";
import { Box, HStack, Slide, Text } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { clearMessages } from "../../features/appState/appStateSlice";
import { Alert as NBAlert } from "native-base";

function Message({ message }) {
    const dispatch = useDispatch();

    useEffect(() => {
        let ctx = setTimeout(() => {
            dispatch(clearMessages());
        }, 4000);

        // return () => {
        //     clearTimeout(ctx);
        // };
    }, []);

    return (
        <NBAlert status={message.status} mb="1">
            <HStack space={2} alignItems={"center"}>
                <NBAlert.Icon />
                <Text fontWeight="bold" color="black">
                    {message.title}
                </Text>
            </HStack>
        </NBAlert>
    );
}

const Messages = () => {
    const messages = useSelector((state) => state.appState.messages);

    return (
        <Slide in={messages.length} placement="bottom" duration="800">
            <Box position="absolute" bottom="0" left="0" right="0">
                {messages.map((message) => (
                    <Message message={message} key={message.title} />
                ))}
            </Box>
        </Slide>
    );
};

export default Messages;
