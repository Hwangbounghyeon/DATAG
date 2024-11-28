import { StepProps } from "@/types/projectType";
import { Input, Textarea } from "@nextui-org/react";
import { memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CreateProjectAppDispatch, CreateProjectState } from "@/store/store";
import { setProjectName, setDescription } from "@/store/create-store";
import ButtonFooter from "./buttonFooter";

const Step2 = ({ handleMove }: StepProps) => {
  const dispatch = useDispatch<CreateProjectAppDispatch>();
  const { project_name, description } = useSelector(
    (state: CreateProjectState) => state.project
  );
  return (
    <div className="flex flex-col item-center max-w-[700px] w-[90%] flex-wrap md:flex-nowrap ">
      <Input
        isRequired
        defaultValue={project_name}
        type="text"
        name="project_name"
        className="mb-5"
        label="Project Name"
        radius="md"
        size="md"
        onChange={(e) => {
          dispatch(setProjectName(e.target.value || ""));
        }}
      />

      <Textarea
        isRequired
        minRows={2}
        className="mb-5"
        defaultValue={description}
        label="Project Description"
        radius="md"
        size="md"
        name="description"
        onChange={(e) => {
          dispatch(setDescription(e.target.value || ""));
        }}
      />

      <ButtonFooter
        beforeButtonText="이전"
        beforeButtonFunction={() => {
          handleMove(1);
        }}
        nextButtonText="다음"
        nextButtonFunction={() => {
          handleMove(3);
        }}
        nextButtonDisabled={!project_name || !description}
      />
    </div>
  );
};

export default memo(Step2);
