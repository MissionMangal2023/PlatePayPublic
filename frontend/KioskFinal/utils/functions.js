import { Alert } from "react-native";
import store from "../store/store";
import axiosInstance from "./axiosInstance";

export function textColorByStatus(status) {
    console.log(status);
    switch (status) {
        case 1:
            return "blue.600";
        case 2:
            return "green.600";
        default:
            return "red.600";
    }
}

export async function reportCheckNumberPlate(
    number_plate,
    device_id,
    navigation
) {
    const state = store.getState();
    const authToken = state.user.access_token;
    let user_name = null;
    const SERVER_URL = "predict/verifynumplate/";

    try {
        const response = await axiosInstance.post(
            SERVER_URL,
            {
                number_plate: number_plate,
            },
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const jsonData = response.data;
        user_name = jsonData.user_name;
        return user_name;
    } catch (error) {
        if (error.response) {
            switch (error.response.status) {
                case 404:
                    return Alert.alert(
                        "Error",
                        "Number Plate not found in database"
                    );
                case 400:
                    return Alert.alert(
                        "Error",
                        "Proper Number Plate Was Not Received"
                    );
                default:
                    console.log(error.response);
                    break;
            }
        } else {
            console.log(error);
        }
    }
}

export async function verifyNumberPlate(number_plate, device_id, navigation) {
    const state = store.getState();
    const authToken = state.user.access_token;
    let user_name = null;
    const SERVER_URL = "predict/verifynumplate/";

    try {
        const response = await axiosInstance.post(
            SERVER_URL,
            {
                number_plate: number_plate,
            },
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const jsonData = response.data;
        user_name = jsonData.user_name;

        if (response.status === 200)
            navigation.navigate("AmountPage", {
                number_plate,
                device_id,
                user_name,
            });
    } catch (error) {
        if (error.response) {
            switch (error.response.status) {
                case 424:
                    return Alert.alert(
                        "Danger, Be Alert",
                        `The number plate associated with ${error.response.data.user_name}'s account, is reported suspicious! \nKindly initiate the action.`
                    );
                case 404:
                    return Alert.alert(
                        "Error",
                        "Number Plate not found in database"
                    );
                case 400:
                    return Alert.alert(
                        "Error",
                        "Proper Number Plate Was Not Received"
                    );
                default:
                    console.log(error.response);
                    break;
            }
        } else {
            console.log(error);
        }
    }
}

export async function reportuser(
    navigation,
    deviceid,
    report_reason,
    numberplatetext
) {
    const device_id_text = deviceid;
    const number_plate_text = numberplatetext;
    var goahead = true;
    const REPORT_URL =
        "api/v1/" +
        number_plate_text +
        "/" +
        device_id_text +
        "/addsusactivityoutlet/";
    const state = store.getState();
    const authToken = state.user.access_token;

    if (!report_reason) {
        goahead = false;
        return Alert.alert("Error Occurred", "Reason is a required field");
    }
    if (goahead === true) {
        try {
            const response = await axiosInstance.post(
                REPORT_URL,
                {
                    reason: report_reason,
                },
                {
                    headers: {
                        Authorization: `Bearer ${
                            store.getState().user.access_token
                        }`,
                    },
                }
            );
            const jsonData = response.data;
            if (response.status === 404) {
                return Alert.alert("Error", jsonData.error);
            } else {
                const date = jsonData.timing.split("T")[0];
                const time = jsonData.timing.split("T")[1].split(".")[0];
                const sus_activity_text =
                    "Your Suspicious Activity is reported under ID: " +
                    jsonData.id +
                    "\n\n Number Plate: " +
                    number_plate_text +
                    "\n\n Date: " +
                    date +
                    "\n\n Timing: " +
                    time +
                    "\n\n Reason received: " +
                    jsonData.reason;
                return Alert.alert(
                    "Suspicious Activity Reported",
                    sus_activity_text,
                    [
                        {
                            text: "Ok & Redirect To Home",
                            onPress: () => navigation.navigate("HomePage"),
                        },
                    ]
                );
            }
        } catch (error) {
            console.log(error);
        }
    }
}

export async function makepayment(
    amount,
    selected,
    numberplatetext,
    device_id,
    navigation
) {
    const state = store.getState();
    const authToken = state.user.access_token;
    console.log(amount, selected, numberplatetext, device_id);
    const SERVER_URL = "api/v1/newtransaction/";
    try {
        const response = await axiosInstance.post(
            SERVER_URL,
            {
                amount: amount,
                mode_of_payment: selected,
                number_plate: numberplatetext,
                device_id: device_id,
            },
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );
        const jsonData = response.data;
        return jsonData;

        // switch (jsonData.status) {
        //     case 0:
        //         // Transaction Failed
        //         return Alert.alert(
        //             "Transaction Failed",
        //             jsonData.error_message
        //         );

        //     case 2:
        //         // Transaction Successful
        //         return Alert.alert(
        //             "Hurray!",
        //             `Received ANPR payment for Rs. ${jsonData.amount}`
        //         );

        //     default:
        //         // Open a popup, with the data
        //         return jsonData
        // }
        // if(response.status === 400){
        //     return Alert.alert('Payment Failed: ' + jsonData.error);
        // }else if(response.status === 201){
        //     navigation.navigate('SuccessPage');
        // }else{
        //     navigation.navigate('FailPage');
        // }
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function getTransactionById(transactionId, setTransaction) {
    try {
        let response = await axiosInstance.get(
            `api/v1/user/transaction/${transactionId}/`,
            {
                headers: {
                    Authorization: `Bearer ${
                        store.getState().user.access_token
                    }`,
                },
            }
        );
        if (response.status === 200) {
            setTransaction(response.data);
            console.log(response.data);
        }
    } catch (error) {
        console.error(error);
    }
}
