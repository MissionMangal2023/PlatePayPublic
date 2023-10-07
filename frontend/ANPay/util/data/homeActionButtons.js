import {
    FontAwesome,
    FontAwesome5,
    Entypo,
    Feather,
    Ionicons,
    MaterialIcons,
    MaterialCommunityIcons,
} from "@expo/vector-icons";
import AddNumberPlate from "../../screens/AddNumberPlate/AddNumberPlate";
import PreAuthSettings from "../../screens/PreAuthSettings";
import TestScreen from "../../screens/TestScreen";
import Home from "../../screens/Home";
import MerchantInfo from "../../screens/MerchantInfo";
import Locations from "../../screens/Locations";
import Reports from "../../screens/Reports";

const actionButtons = [
    {
        name: "home",
        verboseName: "Home",
        // type: "font-awesome",
        color: "#800020",
        as: Ionicons,
        component: Home,
    },
    {
        name: "car",
        verboseName: "Car",
        // type: "font-awesome",
        color: "#800020",
        as: FontAwesome5,
        component: AddNumberPlate,
    },
    {
        name: "location-arrow",
        verboseName: "Location",
        type: "font-awesome",
        color: "#800020",
        as: FontAwesome,
        component: Locations,
    },
    {
        name: "line-graph",
        verboseName: "Reports",
        type: "entypo",
        color: "#800020",
        as: Entypo,
        component: Reports,
    },
    {
        name: "verified-user",
        verboseName: "Preauthorization",
        type: "font-awesome",
        as: MaterialIcons,

        color: "#800020",
        component: PreAuthSettings,
    },
    {
        name: "test-tube-empty",
        verboseName: "Test Screen",
        type: "ionicons",
        color: "#800020",
        as: MaterialCommunityIcons,
        component: TestScreen,
    },
];

const merchantButtons = [
    {
        name: "home",
        verboseName: "Home",
        // type: "font-awesome",
        color: "#800020",
        as: Ionicons,
        component: Home,
    },
    {
        name: "car",
        verboseName: "Car",
        // type: "font-awesome",
        color: "#800020",
        as: FontAwesome5,
        component: AddNumberPlate,
    },
    {
        name: "location-arrow",
        verboseName: "Location",
        type: "font-awesome",
        color: "#800020",
        as: FontAwesome,
        component: Locations,
    },
    {
        name: "line-graph",
        verboseName: "Reports",
        type: "entypo",
        color: "#800020",
        as: Entypo,
        component: Reports,
    },
    {
        name: "verified-user",
        verboseName: "Preauthorization",
        type: "font-awesome",
        as: MaterialIcons,

        color: "#800020",
        component: PreAuthSettings,
    },
    {
        name: "shop",
        verboseName: "Merchant Info",
        // type: "font-awesome",
        color: "#800020",
        as: Entypo,
        component: MerchantInfo,
    },
    {
        name: "test-tube-empty",
        verboseName: "Test Screen",
        type: "ionicons",
        color: "#800020",
        as: MaterialCommunityIcons,
        component: TestScreen,
    },
];

export default actionButtons;
export { merchantButtons };
