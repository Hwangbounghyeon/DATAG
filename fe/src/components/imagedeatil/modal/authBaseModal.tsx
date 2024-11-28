import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from "@nextui-org/react";
import { Suspense } from "react";

interface AuthBaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    onConfirm: () => void;
    isConfirmDisabled: boolean;
}

export default function AuthBaseModal({
    isOpen,
    onClose,
    title,
    children,
    onConfirm,
    isConfirmDisabled,
}: AuthBaseModalProps) {
    return (
        <Modal
            size={"4xl"}
            isOpen={isOpen}
            onClose={onClose}
            classNames={{
                base: "min-h-[30%]",
                wrapper: "min-h-[30%]",
                body: "flex-grow",
            }}
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader>{title}</ModalHeader>
                        <ModalBody>
                            <div className="space-y-4">
                                <Suspense
                                    fallback={
                                        <div className="flex items-center justify-center">
                                            <div>Loading departments...</div>
                                        </div>
                                    }
                                >
                                    {children}
                                </Suspense>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" onPress={onClose}>
                                Close
                            </Button>
                            <Button
                                color="primary"
                                onPress={onConfirm}
                                isDisabled={isConfirmDisabled}
                            >
                                Add
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
