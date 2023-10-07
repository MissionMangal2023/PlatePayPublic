import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Flex, Icon, Image, Progress, Text } from "native-base";
import * as ImagePicker from "expo-image-picker";
import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import DocumentUploadButton from "../../components/DocumentUploadButton";
import LottieView from "lottie-react-native";
import axios from "axios";
import { useSelector } from "react-redux";
import {
    addErrorMessage,
    addNumberPlate,
    createMessage,
    getFileTypeFromFilename,
    renderImageOverlayIcon,
    uploadDoc,
} from "../../util/function";
import stepDetails from "../../util/data/stepDetails";
import initialLPData from "../../util/data/initialLPData";
import arrayDoc from "../../util/data/docArray";
import NumberPlate from "../../components/NumberPlate";
import SecondaryButton from "../../components/Utility/SecondaryButton";
import PrimaryButton from "../../components/Utility/PrimaryButton";
import HugeText from "../../components/Typography/HugeText";
import SecondaryText from "../../components/Typography/SecondaryText";

const FormPage1 = ({ navigation }) => {
    const [errors, setErrors] = useState([]);
    const [newLPData, setNewLPData] = useState(initialLPData);
    const [currStep, setCurrStep] = useState(1);
    const animation = useRef(null);

    const user = useSelector((state) => state.user);
    const authToken = user.access_token;

    // This function opens up an image picker, and sends the picked image to the backend
    // Once it gets the number plate text, it changes the field value.
    async function selectAndDetectNumberPlate() {
        // reset errors, image, data
        setErrors([]);
        setNewLPData(initialLPData);

        let result = await ImagePicker.launchImageLibraryAsync({
            // only images are allowed
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setNewLPData((lpData) => ({
                ...lpData,
                numberPlatePic: result.assets[0].uri,
            }));

            let localUri = result.assets[0].uri;
            let filename = localUri.split("/").pop();
            // Infer the type of the image
            let type = getFileTypeFromFilename(filename, "image");

            const formData = new FormData();
            formData.append("photo", {
                uri: result.assets[0].uri,
                name: "photo.jpg",
                type,
            });

            try {
                let response = await axios.post(
                    "/predict/numberplatetext/",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                setErrors([]);

                // store the obtained lp in the state
                setNewLPData((lpData) => ({
                    ...lpData,
                    numberPlateText: response.data,
                }));
            } catch (err) {
                // console.error(err);
                addErrorMessage(
                    "Something Went Wrong with this number plate",
                    setErrors
                );
            }
        } else {
            addErrorMessage("Operation cancelled by User", setErrors);
        }
    }

    function stepForm(currStep) {
        if (currStep === 1) {
            return (
                <Box>
                    {newLPData.numberPlatePic ? (
                        <Box>
                            <Image
                                source={{ uri: newLPData.numberPlatePic }}
                                alt="User selected number plate image"
                                w="90%"
                                height="300"
                                mx="auto"
                            />

                            {/* Here 3 states are possible */}
                            {/* errors !== [], means there are some errors. Render cross */}
                            {/* errors === [] but lp="XX XX XXXXX", means it is loading. Render spinner */}
                            {/* errors === [] and lp has valid value, means there is no error. Render Check */}

                            {renderImageOverlayIcon(
                                errors,
                                newLPData.numberPlateText
                            )}
                        </Box>
                    ) : (
                        <Button
                            background="transparent"
                            onPress={selectAndDetectNumberPlate}
                        >
                            <Flex
                                bg="gray.800"
                                w="full"
                                borderWidth="6"
                                borderColor="gray.400"
                                px="4"
                                height="300"
                                rounded="lg"
                                justify="center"
                                align="center"
                            >
                                <Icon
                                    mb="6"
                                    size="6xl"
                                    as={Entypo}
                                    name="camera"
                                    color="white"
                                />
                                <Text
                                    fontSize="lg"
                                    color="white"
                                    textAlign="center"
                                    fontFamily="Poppins-Regular"
                                >
                                    Click Here to Select your number plate image
                                </Text>
                            </Flex>
                        </Button>
                    )}

                    <Flex space={4} direction="row" my="6" align="center">
                        {/* Render the detected number plate */}
                        <NumberPlate
                            numberPlate={newLPData.numberPlateText}
                            showBlockSwitch={false}
                            mr="4"
                            minW="210"
                            mb="0"
                        />

                        <Button
                            flexGrow="1"
                            bg="amber.400"
                            onPress={() => setNewLPData(initialLPData)}
                            _text={{
                                color: "black",
                                fontWeight: "bold",
                            }}
                            leftIcon={
                                <Icon
                                    as={MaterialCommunityIcons}
                                    name="camera-retake"
                                    color="black"
                                />
                            }
                        >
                            Retake
                        </Button>
                    </Flex>

                    {errors.map((error) => (
                        <Text color="red.400" mb="4" key={error}>
                            {error}
                        </Text>
                    ))}

                    {/* action buttons */}
                    <Box>
                        <PrimaryButton
                            onPress={() => {
                                if (!newLPData.numberPlatePic) {
                                    setErrors((errors) => [
                                        "Please insert the image of your vehicle licence plate",
                                        ...errors,
                                    ]);
                                    return;
                                }

                                if (
                                    errors.length === 0 &&
                                    newLPData.numberPlateText !== "XX XX XXXXX"
                                ) {
                                    setCurrStep((currStep) => currStep + 1);
                                }
                            }}
                        >
                            Next
                        </PrimaryButton>
                    </Box>
                </Box>
            );
        } else if (currStep === 2) {
            return (
                <>
                    <Box mb="6">
                        {/* 
                            array doc contains key value pairs, 
                            depicting the doc name, and the upload url eg. [insurance, api/v1/<no_plate>/uploadinsurance/]
                            The <DocumentUploadButton /> renders a document picker,
                            and also updates LPData, with the relevant urls, making it ready for upload.
                        */}
                        {arrayDoc(newLPData).map(([doc, url]) => (
                            <DocumentUploadButton
                                keyName={doc}
                                newLPData={newLPData}
                                setNewLPData={setNewLPData}
                                key={doc}
                            />
                        ))}
                    </Box>
                    <Box>
                        <SecondaryButton
                            onPress={() =>
                                setCurrStep((currStep) => currStep - 1)
                            }
                        >
                            Previous
                        </SecondaryButton>
                        <PrimaryButton
                            onPress={() => {
                                addNumberPlate(newLPData, authToken)
                                    .then((response) => {
                                        arrayDoc(newLPData).forEach(
                                            ([doc, url]) => {
                                                uploadDoc(
                                                    newLPData,
                                                    doc,
                                                    url,
                                                    authToken
                                                );
                                            }
                                        );
                                        setCurrStep((currStep) => currStep + 1);
                                        console.log(response);
                                    })
                                    .catch((err) => {
                                        if (err.response) {
                                            switch (err.response.status) {
                                                case 400:
                                                    createMessage(
                                                        "Number Plate is already registered",
                                                        "danger"
                                                    );
                                                    break;

                                                default:
                                                    break;
                                            }
                                        } else {
                                            createMessage(
                                                "Some Error Occurred while adding Number Plate",
                                                "danger"
                                            );
                                        }
                                        navigation.navigate("AddNumberPlate");
                                    });
                            }}
                        >
                            Next
                        </PrimaryButton>
                    </Box>
                </>
            );
        } else {
            return (
                <Flex mb="6" align="center" justify="center" flex="1">
                    <LottieView
                        autoPlay
                        ref={animation}
                        style={{
                            width: 200,
                            height: 200,
                        }}
                        // Find more Lottie files at https://lottiefiles.com/featured
                        source={require("../../assets/lottieanimations/1818-success-animation.json")}
                    />

                    <Text
                        fontSize="2xl"
                        textAlign="center"
                        color="green.400"
                        mt="4"
                    >
                        Success! {"\n"} Number Plated Added
                    </Text>
                </Flex>
            );
        }
    }

    useEffect(() => {
        if (currStep === 3) {
            setTimeout(
                () =>
                    navigation.replace("AddNumberPlate", {
                        refetch: true,
                    }),
                4000
            );
        }
    }, [currStep]);

    return (
        <>
            <Box px="3" py="3" flex="1">
                {currStep < 3 && (
                    <>
                        <HugeText title={`Step ${currStep}`} />
                        <Text fontSize="xl" color="white" fontWeight="semibold">
                            {stepDetails[currStep - 1].title}
                        </Text>
                        <Box my="4">
                            <Progress
                                colorScheme="primary"
                                value={(currStep * 100) / 2}
                            />
                        </Box>
                        <SecondaryText
                            title={stepDetails[currStep - 1].description}
                            fontSize="sm"
                            mb="4"
                        />
                    </>
                )}

                {stepForm(currStep)}
            </Box>
        </>
    );
};

export default FormPage1;
