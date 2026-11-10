export type QualityIssue = { id:string; severity:'error'|'warning'|'info'; code:string; eventId:string|null; field:string|null; eventName:string|null; message:string; suggestion:string };
export type QualityAudit = { summary:{events:number;posterMappings:number;localPosters:number;generatedPosters:number;errors:number;warnings:number;info:number}; issues:QualityIssue[] };
export function runQualityAudit(events:Record<string,unknown>[],posterMap:Record<string,string>,fileExists?:(source:string)=>boolean):QualityAudit;
