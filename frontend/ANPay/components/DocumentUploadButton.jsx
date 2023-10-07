import { Entypo } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { Box, Icon, Input, Pressable } from "native-base";
import React from "react";

const DocumentUploadButton = ({ keyName, newLPData, setNewLPData }) => {
    return (
        <Pressable
            onPress={async () => {
                let response = await DocumentPicker.getDocumentAsync();
                if (response.type !== "cancel") {
                    setNewLPData((lpData) => ({
                        ...lpData,
                        [keyName]: {
                            fileName: response.name,
                            uri: response.uri,
                            type: response.mimeType,
                        },
                    }));
                }
            }}
        >
            <Box pointerEvents="none">
                <Input
                    mx="3"
                    mb="4"
                    value={newLPData[keyName].fileName}
                    placeholder={newLPData[keyName].verboseName}
                    color="gray.100"
                    InputRightElement={
                        <Icon
                            size="md"
                            as={Entypo}
                            name="upload"
                            color="gray.400"
                            mr="2"
                        />
                    }
                />
            </Box>
        </Pressable>
    );
};

export default DocumentUploadButton;
