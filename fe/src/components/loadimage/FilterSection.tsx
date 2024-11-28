"use client";

import { useEffect, useState } from "react";
import { IoFilter } from "react-icons/io5";
import { FilterCondition, TagBySearchRequest } from "@/types/tag";
import { createInitialRow, FilterRow } from "@/components/loadimage/filterBox";
import { FilterModal } from "@/components/loadimage/filterModal";

interface FilterSectionProps {
    tags: string[];
    onFilterApply: (filterData: TagBySearchRequest) => void;
}

export function FilterSection({
    tags,
    onFilterApply,
    currentFilter,
}: FilterSectionProps & { currentFilter: TagBySearchRequest }) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterRows, setFilterRows] = useState<FilterRow[]>(() => {
        return currentFilter.conditions.map((condition: FilterCondition) => ({
            id: crypto.randomUUID(),
            AND: condition.and_condition || [],
            OR: condition.or_condition || [],
            NOT: condition.not_condition || [],
        }));
    });

    useEffect(() => {
        if (isFilterOpen) {
            const searchParams = new URLSearchParams(window.location.search);
            const filterParam = searchParams.get("filter");

            if (filterParam) {
                try {
                    const parsedFilter = JSON.parse(
                        decodeURIComponent(filterParam)
                    );
                    const newFilterRows = parsedFilter.conditions.map(
                        (condition: FilterCondition) => ({
                            id: crypto.randomUUID(),
                            AND: condition.and_condition || [],
                            OR: condition.or_condition || [],
                            NOT: condition.not_condition || [],
                        })
                    );
                    setFilterRows(newFilterRows);
                } catch {
                    setFilterRows([createInitialRow()]);
                }
            }
        }
    }, [isFilterOpen]);

    useEffect(() => {
        const newFilterRows = currentFilter.conditions.map(
            (condition: FilterCondition) => ({
                id: crypto.randomUUID(),
                AND: condition.and_condition || [],
                OR: condition.or_condition || [],
                NOT: condition.not_condition || [],
            })
        );
        setFilterRows(newFilterRows);
    }, [currentFilter]);

    const handleDone = (filterData: TagBySearchRequest) => {
        onFilterApply(filterData);
        setIsFilterOpen(false);
    };

    return (
        <div className="flex-col gap-4 max-w-[25%] min-w-[15%]">
            <div
                className="relative h-[8%] flex justify-between border border-solid border-primary rounded-lg p-2 cursor-pointer items-center hover:bg-primary/10 hover:scale-[1.02] transition-all duration-200"
                onClick={() => setIsFilterOpen(true)}
            >
                <div className="flex justify-between items-center min-w-full">
                    {tags.length === 0 ? "태그 로딩중..." : "필터링"}
                    <IoFilter />
                </div>
            </div>
            <FilterModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onDone={handleDone}
                tags={tags}
                filterRows={filterRows}
                setFilterRows={setFilterRows}
            />
        </div>
    );
}
