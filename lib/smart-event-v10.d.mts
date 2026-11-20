export function personalizedEvents(events:any[],savedIds:Iterable<string>,today:string,filters?:{area?:string;category?:string;status?:string;from?:string;through?:string;query?:string}):any[];
export function upcomingReminderCandidates(events:any[],savedIds:Iterable<string>,today:string,days?:number):any[];
export function auditSchedule(events:any[],today:string):{id:string;kind:string;message:string}[];
