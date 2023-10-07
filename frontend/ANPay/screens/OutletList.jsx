import { FlatList, Text } from "native-base";
import React, { useEffect, useRef, useState } from "react";
import HeaderWithMenuProfileGreeting from "../components/HeaderWithMenuProfileGreeting";
import { useSelector } from "react-redux";
import Outlet from "../components/OutletList/Outlet";
import SpinnerWithText from "../components/SpinnerWithText";
import { getOutletsList } from "../util/function";

const OutletList = ({ navigation }) => {
    const user = useSelector((state) => state.user);
    const [outlets, setOutlets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getOutletsList(setOutlets).then((res) => setLoading(false));
    }, []);

    return (
        <>
            <HeaderWithMenuProfileGreeting
                navigation={navigation}
                user={user}
                greeting={false}
                title="Your Outlets"
            />

            <Text
                fontSize="lg"
                color="#ccc"
                fontFamily="Poppins-Regular"
                mb="4"
                textAlign="center"
                px="3"
            >
                Click on the individual outlets device id to expand a more
                detailed view
            </Text>

            {loading ? (
                <SpinnerWithText title="Fetching your Outlets" />
            ) : (
                <FlatList
                    data={outlets}
                    renderItem={({ item }) => (
                        <Outlet outlet={item} navigation={navigation} />
                    )}
                    ListEmptyComponent={() => (
                        <Text
                            fontSize="sm"
                            color="gray.400"
                            textAlign="center"
                            my="2"
                        >
                            You currently have no outlets registered with us.{" "}
                            {"\n"}
                            Please contact us to add your first outlet!
                        </Text>
                    )}
                    keyExtractor={(item) => item.id}
                />
            )}
        </>
    );
};

export default OutletList;
