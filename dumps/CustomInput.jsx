import { StyleSheet, View } from "react-native";
import React, { useState } from "react";
import { Input, Text } from "@rneui/themed";

const CustomInput = ({ containerStyles = {}, ...props }) => {
    return (
        <View style={[styles.container, containerStyles]}>
            {props.title && (
                <Text style={{ color: "#eee", fontFamily: "Poppins-Semibold" }}>
                    {props.title}
                </Text>
            )}

            <Input
                {...props}
                inputStyle={[styles.inputStyle, props.inputStyle || {}]}
                inputContainerStyle={[
                    styles.inputContainerStyle,
                    props.inputContainerStyle || {},
                ]}
                placeholder={props.placeholder}
                rightIcon={props.rightIcon}
            />
        </View>
    );
};

export default CustomInput;

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
    },
    inputStyle: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        fontSize: 14,
        color: "#ccc",
    },
    inputContainerStyle: {
        marginTop: 10,
        paddingRight: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
    },
});
