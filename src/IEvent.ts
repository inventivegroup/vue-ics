import { IRecuranceRule } from "./IRecuranceRule";

export interface IEvent {
    language: string;
    subject: string;
    description: string;
    location: string | undefined;
    begin: Date;
    stop: Date;
    url: string | undefined;
    organizer: { name: string, email: string } | undefined;
    recuranceRule: IRecuranceRule | undefined;
}