import { AuthUser } from "@/types/auth";
import { Button } from "@nextui-org/react";
import { MdOutlineClear } from "react-icons/md";

interface SelectedPeopleProps {
    people: AuthUser[];
    onRemove: (id: number) => void;
}

export function SelectedPeople({ people, onRemove }: SelectedPeopleProps) {
    return (
        <div className="flex flex-col gap-2">
            {people.map((person) => (
                <div
                    key={person.user_id}
                    className="flex items-center justify-between ps-3 py-1 rounded-full border border-blue-400"
                >
                    <span className="text-sm">
                        {person.user_name} / {person.department_name}
                    </span>
                    <Button
                        onClick={() => onRemove(person.user_id)}
                        className="hover:text-blue-300"
                    >
                        <MdOutlineClear />
                    </Button>
                </div>
            ))}
        </div>
    );
}
