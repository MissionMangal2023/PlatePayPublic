import React from "react";
import { Button, Flex, Icon, IconButton, Text } from "native-base";
import DrawerToggleButton from "./DrawerToggleButton";
import GoToProfile from "./GoToProfile";
import { generateFallback } from "../util/function";
import { AntDesign } from "@expo/vector-icons";

const HeaderWithMenuProfileGreeting = ({
    navigation,
    user,
    greeting = true,
    title = null,
}) => {
    return (
        <Flex
            direction="row"
            justify="space-between"
            mb="4"
            mt="2"
            alignItems="center"
        >
            {navigation.openDrawer ? (
                <DrawerToggleButton onPress={() => navigation.openDrawer()} />
            ) : (
                <IconButton
                    variant="solid"
                    borderRadius="full"
                    backgroundColor="anpr_muted.600"
                    shadow="4"
                    _pressed={{ backgroundColor: "#fff" }}
                    icon={<Icon as={AntDesign} name="left" />}
                    onPress={() => navigation.goBack()}
                />
            )}

            {greeting && (
                <Text color="white" fontSize="lg" fontWeight="semibold">
                    Hello,{" "}
                    {user
                        ? user.profile.name.split(" ")[0]
                        : user.user.username}
                    !
                </Text>
            )}

            {title && (
                <Text color="white" fontSize="lg" fontWeight="semibold">
                    {title}
                </Text>
            )}

            <GoToProfile
                onPress={() =>
                    navigation.navigate("Profile", {
                        profileData: user.profile,
                    })
                }
                title={user && generateFallback(user.profile.name)}
            />
        </Flex>
    );
};

export default HeaderWithMenuProfileGreeting;
