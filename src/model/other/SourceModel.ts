import { BaseModel } from "./BaseModel";

export interface SourceModel extends BaseModel {
    name: string;
    reference_url: string;
    department_id: number;
    department: string;
}