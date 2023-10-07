import React from "react";
import { Icon, Input } from "native-base";
import { Ionicons } from "@expo/vector-icons";

const SearchBar = ({ ...props }) => {
    return (
        <Input
            placeholder="Search"
            variant="filled"
            width="100%"
            borderRadius="10"
            py="2"
            px="3"
            size="lg"
            mb="4"
            InputLeftElement={
                <Icon
                    ml="2"
                    size="4"
                    color="gray.400"
                    as={<Ionicons name="ios-search" />}
                />
            }
            {...props}
        />
    );
};

export default SearchBar;
