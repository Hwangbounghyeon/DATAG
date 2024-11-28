import {
    Button,
    Input,
    RadioGroup,
    Radio,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Card,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { postAnalysis } from "@/api/analysis/postAnalysis";
import { FilterRow } from "./filter-container";

interface AnalysisModalProps {
    onClose: () => void;
    selectedImageIds: string[];
    projectId: string;
    conditions: FilterRow[];
}

const AnalysisModal = ({
    onClose,
    selectedImageIds,
    projectId,
    conditions,
}: AnalysisModalProps) => {
    const [isBtnDisabled, setIsBtnDisaled] = useState(true);
    const [historyName, setHistoryName] = useState(
        `History_${new Date().toUTCString()}`
    );
    const [algorithm, setAlgorithm] = useState("tsne");
    const [isPrivate, setIsPrivate] = useState("open");

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const preventClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const analysis = async () => {
        setIsLoading(true);

        try {
            const filteredConditions = conditions
                .filter(
                    (row) =>
                        row.AND.length > 0 ||
                        row.OR.length > 0 ||
                        row.NOT.length > 0
                )
                .map((row) => ({
                    and_condition: row.AND,
                    or_condition: row.OR,
                    not_condition: row.NOT,
                }));

            const bodyData = {
                algorithm: algorithm,
                project_id: projectId,
                history_name: historyName,
                is_private: isPrivate !== "open",
                selected_tags: filteredConditions,
                image_ids: selectedImageIds,
            };

            await postAnalysis(bodyData);

            onClose();
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedImageIds.length >= 10) {
            setIsBtnDisaled(false);
            setErrorMessage("");
        } else {
            setIsBtnDisaled(true);
            setErrorMessage("최소 10개 이상의 데이터를 선택해주세요.");
        }
    }, [selectedImageIds]);

    return (
        <div>
            <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold">Analysis Configuration</h2>
            </ModalHeader>
            <ModalBody>
                <Card className="p-6 w-full" onClick={preventClick}>
                    <div className="space-y-6">
                        {/* Analysis Name Section */}
                        <div className="space-y-2 w-full">
                            <label className="text-sm font-semibold text-[#1a1a1a] dark:text-[#e6e6e6]">
                                분석명
                            </label>
                            <Input
                                value={historyName}
                                onValueChange={setHistoryName}
                                classNames={{
                                    base: "w-full",
                                    mainWrapper: "h-full",
                                    input: "text-base",
                                    inputWrapper:
                                        "h-10 shadow-sm border-2 hover:border-primary focus:border-primary",
                                }}
                                placeholder="분석 이름을 입력하세요"
                            />
                        </div>

                        {/* Algorithm Selection */}
                        <div className="space-y-2 w-full">
                            <RadioGroup
                                label="차원축소 알고리즘"
                                orientation="horizontal"
                                value={algorithm}
                                onValueChange={setAlgorithm}
                                classNames={{
                                    base: "gap-2 w-full",
                                    label: "text-sm font-semibold mb-2 text-[#1a1a1a] dark:text-[#e6e6e6]",
                                }}
                            >
                                <Radio
                                    value="tsne"
                                    classNames={{
                                        base: "p-1 border-2 rounded-lg data-[selected=true]:border-primary me-[0.5rem] ms-[0.2rem] min-w-[100px]",
                                        wrapper: "before:bg-primary",
                                        label: "text-sm font-medium text-[#1a1a1a] dark:text-[#e6e6e6]",
                                    }}
                                >
                                    T-SNE
                                </Radio>
                                <Radio
                                    value="umap"
                                    classNames={{
                                        base: "p-1 border-2 rounded-lg data-[selected=true]:border-primary min-w-[100px]",
                                        wrapper: "before:bg-primary",
                                        label: "text-sm font-medium text-[#1a1a1a] dark:text-[#e6e6e6]",
                                    }}
                                >
                                    UMAP
                                </Radio>
                            </RadioGroup>
                        </div>

                        {/* Privacy Settings */}
                        <div className="space-y-2 w-full">
                            <RadioGroup
                                label="공개여부"
                                orientation="horizontal"
                                value={isPrivate}
                                onValueChange={setIsPrivate}
                                classNames={{
                                    base: "gap-2 w-full",
                                    label: "text-sm font-semibold mb-2 text-[#1a1a1a] dark:text-[#e6e6e6]",
                                }}
                            >
                                <Radio
                                    value="open"
                                    classNames={{
                                        base: "p-1 border-2 rounded-lg data-[selected=true]:border-primary me-[0.5rem] ms-[0.2rem] min-w-[100px]",
                                        wrapper: "before:bg-primary",
                                        label: "text-sm font-medium text-[#1a1a1a] dark:text-[#e6e6e6]",
                                    }}
                                >
                                    공개
                                </Radio>
                                <Radio
                                    value="private"
                                    classNames={{
                                        base: "p-1 border-2 rounded-lg data-[selected=true]:border-primary min-w-[100px]",
                                        wrapper: "before:bg-primary",
                                        label: "text-sm font-medium text-[#1a1a1a] dark:text-[#e6e6e6]",
                                    }}
                                >
                                    비공개
                                </Radio>
                            </RadioGroup>
                        </div>
                    </div>
                </Card>
            </ModalBody>
            <ModalFooter className="flex items-center justify-between px-6 py-4">
                <div className="text-sm text-red-500 truncate">
                    {errorMessage}
                </div>
                <div className="flex gap-2">
                    <Button
                        color="danger"
                        variant="light"
                        onPress={onClose}
                        className="px-6"
                    >
                        취소
                    </Button>
                    <Button
                        color="primary"
                        isDisabled={isBtnDisabled}
                        isLoading={isLoading}
                        onPress={analysis}
                        className="px-6"
                    >
                        분석 시작
                    </Button>
                </div>
            </ModalFooter>
        </div>
    );
};

export default AnalysisModal;
