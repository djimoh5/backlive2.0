export class BaseModel {
    editing: boolean = false;
    isFiltered: boolean = false;
    hidden: boolean = false;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
}