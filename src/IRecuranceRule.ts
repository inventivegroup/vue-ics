export interface IRecuranceRule{
    freq: string;
    until: Date;
    interval: number;
    byday: string[];
    count: number;
}