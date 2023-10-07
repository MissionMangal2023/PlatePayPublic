import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import store from "../store/store";
import { Box } from "native-base";
import SingleSale from "./SingleSale";

function LastThreeTransactions() {
    const [lastThreeSales, setLastThreeSales] = useState([]);

    useEffect(() => {
        async function getLastThreeTransactions() {
            try {
                let response = await axiosInstance.get(
                    `api/v1/outlet/${
                        store.getState().user.device_id
                    }/getlastthreetransaction/`,
                    {
                        headers: {
                            Authorization: `Bearer ${
                                store.getState().user.access_token
                            }`,
                        },
                    }
                );
                if (response.status === 200) {
                    console.log(response.data[1].last_three_transactions);
                    setLastThreeSales(response.data[1].last_three_transactions);
                }
            } catch (err) {
                console.log(err);
            }
        }

        getLastThreeTransactions();
    }, []);
    return (
        <Box>
            {lastThreeSales.map((sale) => (
                <SingleSale key={sale.timing} sale={sale} />
            ))}
        </Box>
    );
}

export default LastThreeTransactions;
