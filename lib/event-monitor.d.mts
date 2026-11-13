export const MONITOR_IMAGE_HOSTS:Set<string>;
export function monitorInventory(events:any[],now?:Date):{day:string;events:number;current:number;upcoming:number;issues:{code:string;severity:string;eventId:string|null;message:string}[];remoteImages:{url:string;eventIds:string[]}[];sourceHosts:{host:string;count:number}[]};
export function checkRemoteImages(targets:{url:string;eventIds:string[]}[],options?:{limit?:number;timeout?:number}):Promise<{url:string;eventIds:string[];status:string;httpStatus:number|null;note:string}[]>;
