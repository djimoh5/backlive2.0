import { IndicatorParamType } from './indicator.model';

export interface DataField  {
    _id: string;
    name: string;
    type: IndicatorParamType;
    sort: number;
    fields: string[];
}