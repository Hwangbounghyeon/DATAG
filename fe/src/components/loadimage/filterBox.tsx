import { useEffect } from "react";
import { Select, SelectItem, Button } from "@nextui-org/react";
import { IoCloseOutline } from "react-icons/io5";
import { TagBySearchRequest } from "@/types/tag";

export interface FilterRow {
    id: string;
    AND: string[];
    OR: string[];
    NOT: string[];
}

export const createInitialRow = () => ({
    id: crypto.randomUUID(),
    AND: [],
    OR: [],
    NOT: [],
});

interface FilterComponentProps {
    onDone: (filterData: TagBySearchRequest) => void;
    tags: string[];
    filterRows: FilterRow[];
    setFilterRows: (rows: FilterRow[]) => void;
}

const FilterComponent = ({
    onDone,
    tags,
    filterRows,
    setFilterRows,
}: FilterComponentProps) => {
    const SELECT_OPTIONS = {
        fields: tags,
    };

    const FilterSelect = ({
        type,
        value,
        onChange,
        placeholder,
        disabledOptions,
    }: {
        type: keyof typeof SELECT_OPTIONS;
        value: Set<string>;
        onChange: (values: string[]) => void;
        placeholder: string;
        disabledOptions: Set<string>;
    }) => (
        <Select
            size="sm"
            selectionMode="multiple"
            placeholder={placeholder}
            selectedKeys={value}
            disabledKeys={disabledOptions}
            aria-label={placeholder}
            onSelectionChange={(keys) => {
                onChange(Array.from(keys as Set<string>));
            }}
        >
            {SELECT_OPTIONS[type].map((option) => (
                <SelectItem key={option} value={option}>
                    {option}
                </SelectItem>
            ))}
        </Select>
    );

    const transformFilterData = () => {
        const conditions = filterRows
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

        return {
            conditions: conditions,
        };
    };

    const getDisabledOptions = (
        rowIndex: number,
        currentField: keyof FilterRow
    ) => {
        const currentRow = filterRows[rowIndex];
        const disabledOptions = new Set<string>();

        if (currentField !== "AND") {
            currentRow.AND.forEach((value) => disabledOptions.add(value));
        }

        if (currentField !== "OR") {
            currentRow.OR.forEach((value) => disabledOptions.add(value));
        }
        if (currentField !== "NOT") {
            currentRow.NOT.forEach((value) => disabledOptions.add(value));
        }

        return disabledOptions;
    };

    const handleRowChange = (
        index: number,
        field: keyof FilterRow,
        values: string[]
    ) => {
        const newRows = [...filterRows];
        newRows[index] = { ...newRows[index], [field]: values };
        setFilterRows(newRows);
    };

    const handleReset = () => {
        setFilterRows([createInitialRow()]);
        onDone?.({
            conditions: [
                {
                    and_condition: [],
                    or_condition: [],
                    not_condition: [],
                },
            ],
        });
    };

    useEffect(() => {
        const lastRow = filterRows[filterRows.length - 1];
        if (
            lastRow.AND.length > 0 ||
            lastRow.OR.length > 0 ||
            lastRow.NOT.length > 0
        ) {
            setFilterRows([...filterRows, createInitialRow()]);
        }
    }, [filterRows, setFilterRows]);

    return (
        <div className="p-3 space-y-2 min-w-[600px]">
            {filterRows.map((row, index) => (
                <div key={row.id} className="flex items-center space-x-2">
                    <div className="flex-shrink-0 w-20">
                        {index !== 0 && (
                            <span className="text-sm flex justify-end items-end me-2">
                                or
                            </span>
                        )}
                    </div>
                    <div className="flex-1 flex items-center space-x-2">
                        <FilterSelect
                            type="fields"
                            disabledOptions={getDisabledOptions(index, "AND")}
                            value={new Set(row.AND)}
                            onChange={(values) =>
                                handleRowChange(index, "AND", values)
                            }
                            placeholder="Select AND filters"
                        />
                        <FilterSelect
                            type="fields"
                            disabledOptions={getDisabledOptions(index, "OR")}
                            value={new Set(row.OR)}
                            onChange={(values) =>
                                handleRowChange(index, "OR", values)
                            }
                            placeholder="Select OR filters"
                        />
                        <FilterSelect
                            type="fields"
                            disabledOptions={getDisabledOptions(index, "NOT")}
                            value={new Set(row.NOT)}
                            onChange={(values) =>
                                handleRowChange(index, "NOT", values)
                            }
                            placeholder="Select NOT filters"
                        />
                    </div>
                    <Button
                        isIconOnly
                        radius="full"
                        size="sm"
                        onClick={() => {
                            setFilterRows(
                                filterRows.length > 1
                                    ? filterRows.filter((_, i) => i !== index)
                                    : [createInitialRow()]
                            );
                        }}
                        className="p-1 hover:bg-gray-100 rounded-full"
                    >
                        <IoCloseOutline />
                    </Button>
                </div>
            ))}
            <div className="flex justify-end pt-3 gap-4">
                <Button color="danger" onPress={handleReset}>
                    Reset
                </Button>
                <Button
                    color="primary"
                    onPress={() => {
                        const filterData = transformFilterData();
                        onDone(filterData);
                    }}
                    isDisabled={
                        !filterRows.some(
                            (row) =>
                                row.AND.length > 0 ||
                                row.OR.length > 0 ||
                                row.NOT.length > 0
                        )
                    }
                >
                    Done
                </Button>
            </div>
        </div>
    );
};

export default FilterComponent;
