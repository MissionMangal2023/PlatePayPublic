import { StyleSheet, View } from "react-native";
import React from "react";
import { Text } from "@rneui/themed";

const Title = ({ title, containerStyles, textStyles }) => {
    return (
        <View style={[styles.container, containerStyles]}>
            <Text h1Style style={[styles.textStyle, textStyles]}>
                {title}
            </Text>
        </View>
    );
};

export default Title;

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    textStyle: {
        fontSize: 22,
        color: "#D89CE8",
        fontFamily: "NotoSerif-Black",
    },
});
