import React, { useState } from "react";
import CustomInput from "./CustomInput";
import { Icon } from "@rneui/themed";

const PasswordInput = ({ title = null, ...props }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);

    return (
        <CustomInput
            title={title}
            {...props}
            inputStyle={{ paddingRight: 10 }}
            secureTextEntry={!passwordVisible}
            autoCorrect={false}
            keyboardType={passwordVisible ? "visible-password" : "default"}
            // autoComplete={"current-password"}
            spellCheck={false}
            rightIcon={
                <Icon
                    type="material"
                    name={passwordVisible ? "visibility" : "visibility-off"}
                    color="white"
                    onPress={() => {
                        setPasswordVisible(
                            (passwordVisible) => !passwordVisible
                        );
                    }}
                />
            }
        />
    );
};

export default PasswordInput;
