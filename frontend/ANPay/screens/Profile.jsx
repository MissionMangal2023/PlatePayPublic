import { StyleSheet, Image, View, Platform, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
    Box,
    HStack,
    Icon,
    Input,
    Text,
    IconButton,
    Avatar,
    Select,
    Fab,
    KeyboardAvoidingView,
    Pressable,
} from "native-base";
import { AntDesign, Entypo } from "@expo/vector-icons";
import {
    createMessage,
    generateFallback,
    getAccessToken,
} from "../util/function";
import { useRef, useState } from "react";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import axios from "axios";
import { updateProfile } from "../features/users/userSlice";

function ProfileInputLabel({ label }) {
    return (
        <Text
            color="gray.200"
            mb="2"
            // fontWeight="semibold"
            fontWeight="600"
            fontFamily="Montserrat-Bold"
        >
            {label}
        </Text>
    );
}

function LabelledInput({ label, inputValue, ...props }) {
    return (
        <>
            <ProfileInputLabel label={label} />
            <Input
                placeholder="What's your first name"
                defaultValue={inputValue}
                {...props}
                backgroundColor="anpr_muted.600"
                rounded="lg"
                fontSize="14"
            />
        </>
    );
}

function LabelledSelect({ items, value, ...props }) {
    return (
        <>
            <ProfileInputLabel label={"Gender"} />
            <Select
                placeholder="Your Gender"
                minWidth="64"
                bg="anpr_muted.600"
                {...props}
                defaultValue={value}
            >
                {items.map((item) => (
                    <Select.Item label={item} value={item} key={item} />
                ))}
            </Select>
        </>
    );
}

function hasChanged(oldProfileFormData, newProfileFormData) {
    // create a copied instance from existing form data,
    let oldProfileFormDataCopy = {};
    for (key in newProfileFormData) {
        if (key === "email")
            oldProfileFormDataCopy[key] =
                oldProfileFormData["Django_user"].email;
        else oldProfileFormDataCopy[key] = oldProfileFormData[key];
    }
    // at this point, we have an oldFormDataCopy object, and a newProfileFormData Object, both of which have same format
    // {
    //      name: "",
    //      email: ""
    //      and so on...
    // }
    // now we just need to compare the two, to see if any changes have occurred
    let res = {};

    for (key in newProfileFormData) {
        if (oldProfileFormDataCopy[key] !== newProfileFormData[key]) {
            res[key] = newProfileFormData[key];
            // return true;
        }
    }
    // return false;
    return res;
}

const Profile = ({ navigation, route }) => {
    const [editable, setEditable] = useState(false);
    const user = useSelector((state) => state.user);
    const { profileData } = route.params;
    const dispatch = useDispatch();
    const [profile, setProfile] = useState({
        name: profileData.name,
        email: profileData["Django_user"].email,
        address: profileData.address,
        phone_number: profileData.phone_number,
        gender: profileData.gender,
        date_of_birth: profileData.date_of_birth,
    });
    const [date, setDate] = useState(
        new Date(new Date(Date.now()).toISOString().slice(0, 10))
    );

    const showMode = (currentMode, dobHandler) => {
        DateTimePickerAndroid.open({
            value: date,
            onChange: (event, selectedDate) => {
                const currentDate = selectedDate;
                let res = currentDate.toISOString().slice(0, 10);
                dobHandler(res);
            },
            mode: currentMode,
            is24Hour: true,
        });
    };

    const showDatepicker = (dobHandler) => {
        showMode("date", dobHandler);
    };

    // useEffect(() => {
    //     getProfile(authToken, setProfileData);
    // }, []);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{
                flex: 1,
            }}
        >
            <Box
                style={{
                    flex: 1,
                }}
            >
                {/* Header */}
                <HStack
                    spacing="space-between"
                    space="4"
                    alignItems="center"
                    style={{ marginBottom: 10 }}
                    m="1"
                >
                    <IconButton
                        variant="solid"
                        borderRadius="full"
                        backgroundColor="anpr_muted.600"
                        shadow="4"
                        _pressed={{ backgroundColor: "#fff" }}
                        icon={<Icon as={AntDesign} name="left" />}
                        onPress={() => navigation.goBack()}
                    />

                    <Text fontWeight="bold" fontSize="lg">
                        Profile
                    </Text>
                </HStack>

                {/* Icon Avatar */}
                <Box my="8" mx="auto" minW="1/2">
                    <Avatar
                        bg="amber.400"
                        _text={{ color: "black" }}
                        size="xl"
                        mx="auto"
                    >
                        {user && generateFallback(user.profile.name)}
                    </Avatar>
                    <Input
                        fontSize="2xl"
                        w="3/4"
                        fontWeight="semibold"
                        textAlign="center"
                        value={profile.name}
                        onChangeText={(changedText) =>
                            setProfile((profile) => ({
                                ...profile,
                                name: changedText,
                            }))
                        }
                        p="0"
                        my="2"
                        borderColor={"transparent"}
                    />
                </Box>

                {/* Data display begins */}
                <Box mx="3">
                    <LabelledInput
                        label="Username"
                        value={profileData["Django_user"].username}
                        editable={false}
                        isDisabled={true}
                        mb="4"
                    />

                    <LabelledInput
                        label="Email"
                        value={profile.email}
                        onChangeText={(changedText) =>
                            setProfile((profile) => ({
                                ...profile,
                                email: changedText,
                            }))
                        }
                        placeholder="Your Email"
                        mb="4"
                        editable={editable}
                    />

                    <LabelledInput
                        label="Phone Number"
                        value={profile.phone_number.toString()}
                        onChangeText={(changedText) =>
                            setProfile((profile) => ({
                                ...profile,
                                phone_number: parseInt(changedText),
                            }))
                        }
                        editable={false}
                        isDisabled={true}
                        keyboardType="number-pad"
                        placeholder="Phone number"
                        mb="4"
                    />

                    <Pressable
                        onPress={() => {
                            if (editable) {
                                showDatepicker((newDate) =>
                                    setProfile((profile) => ({
                                        ...profile,
                                        date_of_birth: newDate,
                                    }))
                                );
                            }
                        }}
                    >
                        <LabelledInput
                            label="Date of Birth"
                            value={profile.date_of_birth}
                            placeholder="Date of birth?"
                            editable={false}
                            mb="4"
                        />
                    </Pressable>

                    <LabelledSelect
                        value={profileData && profileData.gender}
                        items={["Male", "Female"]}
                        mb="4"
                        isDisabled={!editable}
                        onValueChange={(selectedValue) =>
                            setProfile((profile) => ({
                                ...profile,
                                gender: selectedValue,
                            }))
                        }
                    />

                    <LabelledInput
                        label="Address"
                        value={profile.address}
                        placeholder="Address"
                        editable={editable}
                        mb="4"
                        onChangeText={(changedText) =>
                            setProfile((profile) => ({
                                ...profile,
                                address: changedText,
                            }))
                        }
                    />
                </Box>

                {/* Floating edit button */}
                <Fab
                    size="lg"
                    icon={
                        Object.keys(hasChanged(profileData, profile)).length ? (
                            <Icon as={AntDesign} name="check" />
                        ) : (
                            <Icon as={Entypo} name="edit" />
                        )
                    }
                    backgroundColor={
                        !Object.keys(hasChanged(profileData, profile)).length
                            ? "purple.600"
                            : "green.600"
                    }
                    onPress={async () => {
                        if (
                            Object.keys(hasChanged(profileData, profile)).length
                        ) {
                            // action to save runs here
                            setEditable(false);
                            try {
                                let response = await axios.put(
                                    "api/v1/update/profile/",
                                    hasChanged(profileData, profile),
                                    {
                                        headers: {
                                            Authorization: `Bearer ${getAccessToken()}`,
                                        },
                                    }
                                );
                                if (response.status === 200) {
                                    console.log(response.data);
                                    dispatch(
                                        updateProfile({
                                            profile: response.data,
                                        })
                                    );
                                    createMessage(
                                        "Profile Updated Succesfully"
                                    );
                                }
                            } catch (err) {
                                // console.log("Some Error Occurred", err);
                                createMessage(
                                    "Failed to Update Profile",
                                    "danger"
                                );
                            }
                        } else {
                            // action to make the field editable runs here
                            setEditable((editable) => !editable);
                        }
                    }}
                />
            </Box>
        </KeyboardAvoidingView>
    );
};

export default Profile;

const styles = StyleSheet.create({});
