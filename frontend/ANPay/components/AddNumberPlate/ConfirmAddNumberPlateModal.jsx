import { Button, Flex, Modal, Text } from "native-base";

const ConfirmAddNumberPlateModal = ({
    showModal,
    setShowModal,
    navigation,
}) => (
    <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <Modal.Content maxWidth="420px">
            <Modal.Body>
                <Text
                    // fontWeight="semibold"
                    // fontFamily="Poppins-Bold"
                    fontSize="lg"
                >
                    Are you sure you want to add a new Number Plate?
                </Text>
                <Text color="red.400">
                    This vehicle will be linked to your wallet, and money can be
                    deducted from it.
                </Text>
            </Modal.Body>
            <Modal.Footer>
                <Button.Group space={4}>
                    <Flex direction="row" justify="space-evenly" w="full">
                        <Button
                            onPress={() => {
                                setShowModal(false);
                                navigation.navigate("AddNumberPlateForm1");
                            }}
                            bgColor="gray.900"
                        >
                            Yes, Confirm
                        </Button>
                        <Button
                            variant="ghost"
                            colorScheme="blueGray"
                            onPress={() => {
                                setShowModal(false);
                            }}
                            // variant="outline"
                        >
                            No, Cancel
                        </Button>
                    </Flex>
                </Button.Group>
            </Modal.Footer>
        </Modal.Content>
    </Modal>
);

export default ConfirmAddNumberPlateModal;
