const arrayDoc = (newLPData) => [
    [
        "registerationCertificate",
        `/api/v1/${newLPData.numberPlateText}/uploadrc/`,
    ],
    ["insurance", `/api/v1/${newLPData.numberPlateText}/uploadinsurance/`],
    ["puc", `/api/v1/${newLPData.numberPlateText}/uploadpuc/`],
    ["addnDoc1", `/api/v1/${newLPData.numberPlateText}/uploadad1/`],
    ["addnDoc2", `/api/v1/${newLPData.numberPlateText}/uploadad2/`],
];

export default arrayDoc;
