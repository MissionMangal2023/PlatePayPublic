import { Icon as NBIcon } from "native-base";
import axios from "axios";
import { Spinner } from "native-base";
import { Alert, Keyboard, Linking, Platform } from "react-native";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { login, logout } from "../features/users/userSlice";
import store from "../store/store";
import { addMessage } from "../features/appState/appStateSlice";
import * as Location from "expo-location";

//--------------------------------------------------------------------------------------------------------
// Home.jsx

export async function addAmountToBalance(amount) {
    const authToken = store.getState().user.access_token;
    const email = store.getState().user.user.email;
    const currentBalance = store.getState().user.profile.balance;
    try {
        let response = await axios.put(
            "/api/v1/update/profile/",
            {
                email: email,
                balance: currentBalance + amount / 100,
            },
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );
        return response.data.balance;
    } catch (err) {
        return err;
    }
}

export async function fetchAds(setAds) {
    // This function is used to fetch ads when home screen renders
    try {
        let adsResponse = await axios.get("api/v1/merchant/ads");
        if (adsResponse.status === 200) {
            console.log(adsResponse);
            setAds(adsResponse.data);
        }
    } catch (err) {
        console.log(err);
    }
}

export async function getProfile(authToken, setProfileData) {
    // This was used previously, to fetch profile every time profile page is opened.
    // Now we fetch profile data from redux store
    try {
        let response = await axios.get("/api/v1/profile", {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        setProfileData(response.data);
    } catch (error) {
        console.error(error);
    }
}

export async function getLastWeekTransactions(
    authToken,
    setLastweektransaction
) {
    try {
        let response = await axios.post(
            `/api/v1/lastweektransactions/`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );
        if (response.status === 200) {
            setLastweektransaction({
                labels: response.data.days,
                datasets: [
                    {
                        data: response.data.amounts,
                    },
                ],
            });
        }
    } catch (error) {
        console.error(error);
    }
}

export async function getLastWeekBalance(authToken, setLastweekbalance) {
    try {
        let response = await axios.get(
            `/predict/transaction/lastweekbalance/`,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );
        if (response.status === 200) {
            setLastweekbalance({
                labels: response.data.days,
                datasets: [
                    {
                        data: response.data.amounts,
                    },
                ],
            });
        }
    } catch (error) {
        console.error(error);
    }
}

export async function getTransactionPieChart(
    authToken,
    setTransactionpiechart
) {
    try {
        let response = await axios.get(`/predict/transaction/piechart/`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status === 200) {
            setTransactionpiechart(response.data);
        }
    } catch (error) {
        // was console error
        console.log(error);
        if (error.response.status === 404) {
            // console.log(error.response.data.error);
            setTransactionpiechart(
                "NO_TRANSACTIONS-" + error.response.data.error
            );
            return null;
        }
    }
}

export async function getTransactionStatistics(
    authToken,
    setTransactionStatistics
) {
    try {
        let response = await axios.get(
            `/predict/transaction/lastweekstatistics/`,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );
        if (response.status === 200) {
            setTransactionStatistics(response.data);
        }
    } catch (error) {
        console.log(error);
        if (error.response.status === 404) {
            setTransactionStatistics("NO_TRANSACTIONS");
            return null;
        }
    }
}

//--------------------------------------------------------------------------------------------------------
// Stripe
export const useKeyboardBottomInset = () => {
    const [bottom, setBottom] = useState(0);
    const subscriptions = useRef([]);

    useEffect(() => {
        subscriptions.current = [
            Keyboard.addListener("keyboardDidHide", (e) => setBottom(0)),
            Keyboard.addListener("keyboardDidShow", (e) => {
                if (Platform.OS === "android") {
                    setBottom(e.endCoordinates.height);
                } else {
                    setBottom(
                        Math.max(
                            e.startCoordinates.height,
                            e.endCoordinates.height
                        )
                    );
                }
            }),
        ];

        return () => {
            subscriptions.current.forEach((subscription) => {
                subscription.remove();
            });
        };
    }, [setBottom, subscriptions]);

    return bottom;
};

export async function fetchPaymentSheetParams(amount) {
    const response = await axios.post("/api/v1/payment-sheet/", {
        amount: amount,
    });
    const { paymentIntent, ephemeralKey, customer } = await response.data;

    return {
        paymentIntent,
        ephemeralKey,
        customer,
    };
}

export async function initializePaymentSheet(amount, initPaymentSheet) {
    const { paymentIntent, ephemeralKey, customer, publishableKey } =
        await fetchPaymentSheetParams(amount);

    const { error } = await initPaymentSheet({
        merchantDisplayName: "ANPRPay Solutions Pvt Ltd.",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        // defaultBillingDetails: {
        //     name: "Jane Doe",
        // },
    });

    if (error) {
        console.error(error);
    }
}

export const openPaymentSheet = async (presentPaymentSheet) => {
    const { error } = await presentPaymentSheet();

    if (error) {
        Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
        Alert.alert("Success", "Your order is confirmed!");
    }
};

//--------------------------------------------------------------------------------------------------------
// Add Number Plate.jsx
export async function getNumberPlates(setNumberPlates) {
    try {
        let response = await axios.get("/api/v1/getnumberplates/", {
            headers: {
                Authorization: `Bearer ${getAccessToken()}`,
            },
        });
        setNumberPlates(
            response.data.map((np) => ({
                blocked: np.blocked,
                value: np.value,
            }))
        );
        return response.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function toggleNumberPlateBlock(authToken, numberPlate) {
    try {
        let response = await axios.put(
            `/api/v1/numberplate/${numberPlate}/block/`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );
        // console.log(response.data.map((np) => np.value));
        // setNumberPlates(response.data.map((np) => np.value));
        if (response.status === 200) {
            console.log(response.data);
            return "success";
            // setBlocked((blocked) => !blocked);
        }
    } catch (error) {
        console.error(error);
    }
}

export async function addNumberPlate(newLPData, authToken) {
    let response = await axios.post(
        "/api/v1/add_number_plate/",
        {
            value: newLPData.numberPlateText,
            blocked: false,
            timing: null,
            location: null,
        },
        {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        }
    );
    return response.data;
}

export async function uploadDoc(newLPData, doc, url, authToken) {
    if (newLPData[doc].uri === "") return;

    const formData = new FormData();
    formData.append("file", {
        uri: newLPData[doc].uri,
        name: newLPData[doc].fileName,
        type: newLPData[doc].type,
    });

    try {
        let response = await axios.post(url, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${authToken}`,
            },
        });
        console.log(response.data);
    } catch (err) {
        console.error(err);
    }
}

export function getFileTypeFromFilename(filename, mimeClass = "image") {
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `${mimeClass}/${match[1]}` : `${mimeClass}`;
    return type;
}

export function renderImageOverlayIcon(errors, numberPlateText) {
    if (errors.length > 0) {
        return (
            <NBIcon
                size="6xl"
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: [{ translate: [-16, -16] }],
                }}
                as={Entypo}
                name="cross"
                color="red.600"
            />
        );
    } else if (numberPlateText === "XX XX XXXXX") {
        return (
            <Spinner
                color="emerald.500"
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: [{ translate: [-16, -16] }],
                }}
                bgColor="rgba(25, 25, 25, 0.5)"
                size="lg"
                p="2"
            />
        );
    } else {
        return (
            <NBIcon
                size="6xl"
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: [{ translate: [-16, -16] }],
                }}
                as={FontAwesome}
                name="check"
                color="green.600"
            />
        );
    }
}

export function addErrorMessage(errorMessage, setErrors) {
    setErrors((errors) => [errorMessage, ...errors]);
}

//--------------------------------------------------------------------------------------------------------
// AdCard.jsx
export const openLink = async (link) => {
    const supported = await Linking.canOpenURL(link);

    if (supported) {
        await Linking.openURL(link);
    } else {
        Alert.alert("Can't open the url!");
    }
};

//--------------------------------------------------------------------------------------------------------
// NumberPlateDetail.jsx
export async function getTransactionsByNumberPlate(
    numberPlate,
    setTransactions
) {
    try {
        let response = await axios.get(
            `/api/v1/user/${numberPlate}/transactions/`,
            {
                headers: {
                    Authorization: `Bearer ${getAccessToken()}`,
                },
            }
        );
        if (response.status === 200) {
            setTransactions(response.data);
        }
    } catch (error) {
        console.error(error);
    }
}

export function generateFallback(name) {
    let words = name.split(" ");
    return words
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join("");
}

export function bgColorByStatus(status) {
    switch (status) {
        case 1:
            return "blue.600";
        case 2:
            return "green.700";
        default:
            return "red.600";
    }
}

export function borderColorByStatus(status) {
    switch (status) {
        case 1:
            return "blue.300";
        case 2:
            return "green.300";
        default:
            return "red.300";
    }
}

export function textColorByStatus(status) {
    switch (status) {
        case 1:
            return "blue.200";
        case 2:
            return "green.200";
        default:
            return "red.200";
    }
}

export function generateRandomColor() {
    return (
        "#" +
        Math.floor(Math.random() * 16777215)
            .toString(16)
            .toString()
    );
}

export async function getTransactionById(transactionId, setTransaction) {
    try {
        let response = await axios.get(
            `/api/v1/user/transaction/${transactionId}/`,
            {
                headers: {
                    Authorization: `Bearer ${getAccessToken()}`,
                },
            }
        );
        if (response.status === 200) {
            setTransaction(response.data);
        }
    } catch (error) {
        console.error(error);
    }
}

export async function blockAccountHandler() {
    try {
        let response = await axios.post(
            "account/block-account/",
            {},
            {
                headers: {
                    Authorization: `Bearer ${getAccessToken()}`,
                },
            }
        );
        if (response.status === 200) {
            createMessage(
                "Account Blocked Succesfully! Contact Plate Pay to restore it back."
            );
            setTimeout(() => store.dispatch(logout()), 5000);
        }
    } catch (err) {}
}

// ---------------- Push notifications ----------------------------------------------------------------

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== "granted") {
            alert("Failed to get push token for push notification!");
            return;
        }
        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log(token);
    } else {
        alert("Must use physical device for Push Notifications");
    }

    return token;
}

//--------------------------------------------------------------------------------------------------------
// Registeration.jsx

export async function sendOTPHandler(phoneNumber, isValid, setOtpSent) {
    // This function handles sending a request to request for an otp.
    // The backend takes the name, and phone number entered by the person
    // and sends an OTP
    try {
        let response = await axios.post("/account/otp/", {
            phone_number: phoneNumber,
        });
        setOtpSent((otpSent) => !otpSent);
        return response.data;
    } catch (err) {
        if (err.response) {
            switch (err.response.status) {
                case 409:
                    // conflict
                    Alert.alert(
                        "Phone number already exists. Try logging in instead!"
                    );
                    return "Phone number already exists. Try logging in instead!";

                case 503:
                    Alert.alert(err.response.data.detail);
                    return "Service Unavailable";

                default:
                    break;
            }
        } else {
            Alert.alert("Something went wrong!");
            return "Something went wrong!";
        }
    }
}

export async function getLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
        console.error("Permission to access location was denied");
        return "An Error Occurred";
    }

    let location = await Location.getCurrentPositionAsync({});
    let latlong =
        location.coords.latitude.toString() +
        "," +
        location.coords.longitude.toString();

    return latlong;
}

export async function verifyOTPHandler(phoneNumber, otp, scrollTo) {
    try {
        let response = await axios.post("/account/otp/verify", {
            phone_number: phoneNumber,
            otp: otp,
        });
        scrollTo();
        // setOtpSent((otpSent) => !otpSent);
        console.log(response.data);
        return response.data;
    } catch (err) {
        Alert.alert("Invalid OTP! Please try again");
    }
}

export async function registerHandler(setIsLoading, payLoad) {
    /*
        payLoad...

        {
            "username": "sailolla1",
            "password": "aparant01",
            "name": "Sai Lolla",
            "address": "15.2563346,73.973431",
            "phone_number": "9404181639",
            "date_of_birth": "2001-09-06",
            "gender": "Male",
            "email": "saisameer.lolla@gmail.com"
        }
    */

    setIsLoading(true);

    try {
        let response = await axios.post("account/register/", payLoad);
        setIsLoading(false);
        console.log(response.data);
        return response;
    } catch (err) {
        setIsLoading(false);
        console.log(err);
        if (err.response) return err.response;
        else return false;
    }
}

export async function checkUserNameExists(value, lastTestedUsername = null) {
    if (typeof cancelToken != typeof undefined) {
        cancelToken.cancel("New Key Press Found, so cancelling old request");
    }
    cancelToken = axios.CancelToken.source();

    try {
        let response = await axios.get(`api/v1/${value}/exist/`, {
            cancelToken: cancelToken.token,
        });
        if (response.data.exists) {
            // "User with that Username already exists!"
            return false;
        }
    } catch (err) {
        console.log(
            "Error in Registeration Page, Verify duplicate Username: ",
            err
        );
    }

    return true;
}

//--------------------------------------------------------------------------------------------------------
// TransactionsApproval.jsx
export async function approveTransaction(transactionId, setIsLoading) {
    setIsLoading(true);
    try {
        let response = await axios.post(
            `/api/v1/user/transaction/${transactionId}/confirm/`,
            {
                approve: true,
            },
            {
                headers: {
                    Authorization: `Bearer ${getAccessToken()}`,
                },
            }
        );
        if (response.status === 200) {
            setIsLoading(false);
            return response.data.message;
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function rejectTransaction(transactionId, setIsLoading) {
    try {
        let response = await axios.post(
            `/api/v1/user/transaction/${transactionId}/confirm/`,
            {
                approve: false,
            },
            {
                headers: {
                    Authorization: `Bearer ${getAccessToken()}`,
                },
            }
        );
        if (response.status === 200) {
            console.log(response.data);
            setIsLoading(false);
            return true;
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}

//--------------------------------------------------------------------------------------------------------
// Preauth
export async function getPreauthSuggestions(
    selectedLP,
    setSuggestions,
    setLoading
) {
    try {
        let response = await axios.get(
            `/api/v1/preauth/suggestions/${selectedLP}`,
            {
                headers: {
                    Authorization: `Bearer ${getAccessToken()}`,
                },
            }
        );
        if (response.status === 200) {
            setSuggestions(response.data);
            setLoading((loading) => ({
                ...loading,
                suggestionsLoading: false,
            }));
        }
    } catch (error) {
        console.error(error);
    }
}

export async function getPreAuthorizedLocations(selectedLP, setPreAuthOutlets) {
    try {
        let response = await axios.get(`/api/v1/preauth/${selectedLP}`, {
            headers: {
                Authorization: `Bearer ${getAccessToken()}`,
            },
        });
        if (response.status === 200) {
            setPreAuthOutlets(response.data);
            return response.data;
        }
    } catch (err) {
        console.error(err);
        if (err.response) {
            return err.response;
        }
        return false;
    }
}

export async function updatePreAuthorizedLimit(
    selectedLP,
    outlet_id,
    updatedPreAuthLimit
) {
    if (typeof cancelToken != typeof undefined) {
        cancelToken.cancel("Cancelling old request");
    }
    cancelToken = axios.CancelToken.source();
    try {
        let response = await axios.put(
            `/api/v1/preauth/${selectedLP}/${outlet_id}`,
            {
                preAuthLimit: updatedPreAuthLimit,
            },
            {
                cancelToken: cancelToken.token,
                headers: {
                    Authorization: `Bearer ${getAccessToken()}`,
                },
            }
        );
        if (response.status === 200) {
            // setPreAuthOutlets(response.data);
            return response.data;
        }
    } catch (err) {
        if (err.response) {
            return err.response;
        } else {
            console.error(err);
        }
        return false;
    }
}

export async function removeReportOutlet(selectedLP, outlet_id) {
    let response = await axios.delete(
        `/api/v1/preauth/${selectedLP}/${outlet_id}`,
        {
            headers: {
                Authorization: `Bearer ${getAccessToken()}`,
            },
        }
    );
    return response.status == 204;
}

export async function addOutletToPreauth(outlet_id, preAuthLimit, selectedLP) {
    let response = await axios.post(
        `/api/v1/preauth/${selectedLP}/add`,
        {
            merchant_obj: outlet_id,
            amount: preAuthLimit,
            numberplate_obj: selectedLP,
            // reason we are having to send it again
        },
        {
            headers: {
                Authorization: `Bearer ${getAccessToken()}`,
            },
        }
    );

    if (response.status === 201) {
        // if preauth object was added
        return response.data;
    }
    return false;
}

//--------------------------------------------------------------------------------------------------------
// Login.jsx
export async function loginHandler(
    loginFormData,
    pushToken,
    setIsLoading,
    dispatch
) {
    setIsLoading(true);
    try {
        let loginResponse = await axios.post(
            "/account/api/token/",
            loginFormData
        );
        const authToken = loginResponse.data.access;
        dispatch(
            login({
                access_token: loginResponse.data.access,
                refresh_token: loginResponse.data.refresh,
                user: {
                    username: loginResponse.data.profile.Django_user.username,
                    email: loginResponse.data.profile.Django_user.email,
                },
                profile: loginResponse.data.profile,
            })
        );

        let pushTokenResponse = await axios.post(
            "/account/pushtoken/",
            {
                token: pushToken,
            },
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );
        setIsLoading(false);
        return loginResponse;
    } catch (err) {
        setIsLoading(false);
        console.log(err);
        if (err.response) return err.response;
        else return false;
    }
}

export function getAccessToken() {
    return store.getState().user.access_token;
}

export async function refreshToken() {
    const refresh = store.getState().user.refresh_token;
    try {
        let refreshTokenResponse = await axios.post(
            "/account/api/token/refresh/",
            {
                refresh,
            }
        );
        store.dispatch(
            login({
                access_token: refreshTokenResponse.data.access,
                refresh_token: refreshTokenResponse.data.refresh,
                user: {
                    username:
                        refreshTokenResponse.data.profile.Django_user.username,
                    email: refreshTokenResponse.data.profile.Django_user.email,
                },
                profile: refreshTokenResponse.data.profile,
            })
        );
        return true;
    } catch (err) {
        console.log("Refresh Failed");
        return false;
    }
}

//--------------------------------------------------------------------------------------------------------
// MerchantInfo
export async function getTransactions(
    setTransactions,
    pageNumber,
    searchQuery = "",
    trigger = "Merchant",
    outlet_id
) {
    let SERVER_URL;

    if (typeof cancelToken != typeof undefined) {
        cancelToken.cancel("New Key Press Found, so cancelling old request");
    }
    cancelToken = axios.CancelToken.source();

    if (searchQuery !== "") {
        if (trigger === "Merchant") {
            SERVER_URL = `/api/v1/merchant/transactions/search?query=${searchQuery}&page=${pageNumber}`;
        } else {
            SERVER_URL = `/api/v1/merchant/outlet/${outlet_id}/transactions/search?query=${searchQuery}&page=${pageNumber}`;
        }
    } else {
        if (trigger === "Merchant") {
            SERVER_URL = `/api/v1/merchant/transactions?page=${pageNumber}`;
        } else {
            SERVER_URL = `/api/v1/merchant/outlet/${outlet_id}/transactions?page=${pageNumber}`;
        }
    }

    console.log(SERVER_URL);

    try {
        let transactions = await axios.get(SERVER_URL, {
            headers: {
                Authorization: `Bearer ${store.getState().user.access_token}`,
            },
            cancelToken: cancelToken.token,
        });

        setTransactions((prevTransactions) => [
            ...prevTransactions,
            ...transactions.data.results,
        ]);
        return transactions.data.count;
    } catch (err) {
        console.log(err);
    }
}

export async function fetchBasicMerchantDetails(setMerchantBasicDetails) {
    try {
        let response = await axios.get("/api/v1/merchant/", {
            headers: {
                Authorization: `Bearer ${getAccessToken()}`,
            },
        });
        setMerchantBasicDetails(response.data);
    } catch (err) {
        console.log(err);
    }
}

export async function getOutletsList(setOutlets) {
    try {
        let response = await axios.get(`/api/v1/merchant/outlet`, {
            headers: {
                Authorization: `Bearer ${getAccessToken()}`,
            },
        });
        setOutlets(response.data);
        return response.data;
    } catch (err) {
        if (err.response) {
            console.log(err.response.status, err.response);
            return err.response;
        }
        return err;
    }
}

export async function toggleMachineOnOff(outlet_id) {
    try {
        let response = await axios.put(
            `/api/v1/merchant/outlet/${outlet_id}/togglestate/`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${getAccessToken()}`,
                },
            }
        );
        console.log(response.data);
        if (response.status === 200) {
            // setBlocked((blocked) => !blocked);
            return "success";
        }
    } catch (error) {
        console.error(error);
    }
}

export async function getOutletDetail(outlet_id, setOutletData) {
    // {{URL}}/api/v1/merchant/outlet/2
    try {
        let response = await axios.get(`/api/v1/merchant/outlet/${outlet_id}`, {
            headers: {
                Authorization: `Bearer ${getAccessToken()}`,
            },
        });
        setOutletData(response.data);
        return response.data;
    } catch (err) {
        if (err.response) {
            console.log(err.response.status, err.response);
            return err.response;
        }
        return err;
    }
}
export function getCoordinatesFromString(coordsString) {
    return coordsString.split(",").map((coord) => parseFloat(coord));
}

export function formatLocationHistory(locs) {
    res = [];
    for (let i = 0; i < locs.length; i++) {
        const [latitude, longitude] = getCoordinatesFromString(
            locs[i].coordinates
        );
        res.push({
            latitude,
            longitude,
        });
    }
    return res;
}

export function moveMapPointer(mapRef, coords) {
    mapRef.current.animateToRegion(
        {
            ...coords,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        },
        1000
    );
}

export function labelCoordsArray(coordsArray) {
    return {
        latitude: coordsArray[0],
        longitude: coordsArray[1],
    };
}

export function createMessage(title, status = "success") {
    store.dispatch(
        addMessage({
            title,
            status,
        })
    );
}

export async function fetchProfile() {
    try {
        let profile = axios.get("account/profile", {
            headers: {
                Authorization: `Bearer ${getAccessToken()}`,
            },
        });
        console.log(profile.data);
    } catch (err) {
        console.log(err);
    }
}

// Some more functions currently not in use

const openCamera = async () => {
    // Ask the user for the permission to access the camera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
        addErrorMessage("You have refused the camera permission", setErrors);
        return;
    }

    const result = await ImagePicker.launchCameraAsync();
    if (!result.canceled) {
        setNewLPData((lpData) => ({
            ...lpData,
            numberPlatePic: result.assets[0].uri,
        }));

        let localUri = result.assets[0].uri;
        let filename = localUri.split("/").pop();
        // Infer the type of the image
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;

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
};
