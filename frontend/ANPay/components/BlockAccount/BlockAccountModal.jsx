import { Button, Flex, Modal, Text } from "native-base";
import React from "react";
import { blockAccountHandler } from "../../util/function";

const BlockAccountModal = ({ isModalOpen, setIsModalOpen }) => {
    return (
        <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            size="xl"
        >
            {/* This modal is triggered when user clicks on block account */}
            {/* "Yes" calls the backend and blocks the account */}
            <Modal.Content maxWidth="420px">
                <Modal.Body>
                    <Text fontFamily="Poppins-Regular" mb="1">
                        Are you sure you want to block your account? You will be
                        logged out, and won't be able to login from any device.
                        You can get it unblocked by contacting us!
                    </Text>
                    <Button.Group space={4} mt="3">
                        <Flex direction="row" justify="space-evenly" w="full">
                            <Button
                                onPress={() => {
                                    blockAccountHandler();
                                    setIsModalOpen(false);
                                }}
                                bgColor="gray.900"
                                size="sm"
                            >
                                Yes, Confirm
                            </Button>
                            <Button
                                variant="ghost"
                                colorScheme="blueGray"
                                onPress={() => {
                                    setIsModalOpen(false);
                                }}
                                size="sm"
                            >
                                No, Cancel
                            </Button>
                        </Flex>
                    </Button.Group>
                </Modal.Body>
            </Modal.Content>
        </Modal>
    );
};

export default BlockAccountModal;
