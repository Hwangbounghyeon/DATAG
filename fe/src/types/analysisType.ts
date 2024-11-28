export type ConditionType = {
    and_condition: string[];
    or_condition: string[];
    not_condition: string[];
};

export type AnalysisRequestType = {
    algorithm: string;
    project_id: string;
    history_name: string;
    is_private: boolean;
    selected_tags: ConditionType[]
    image_ids: string[]
};

export type AutoAnalysisRequestType = {
    algorithm: string;
    project_id: string;
    history_name: string;
    is_private: boolean;
    selected_tags: ConditionType[]
};