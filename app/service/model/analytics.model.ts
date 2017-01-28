import { BaseModel } from './base.model';

export interface AnalyticsEvent {
    category: string;
    action: string;
    label: string;
    value?: number;
}

export class AnalyticsEventCategory {
    static javascript: string = 'javascript';
    static api: string = 'api';
}

export class AnalyticsEventAction {
    static exception: string = 'exception';
    static click: string = 'click';
}

export interface AnalyticsTiming {
    category: string;
    variable: string;
    value: number;
    label?: string;
}

export class AnalyticsTimingVar {
    static timeSpent: string = 'timeSpent';
    static apiTime: string = 'apiTime';
}

export class AnalyticsDimension {
    static userId: string = 'dimension1';
}