export const attackTypes: string[];
export function defenseMultiplier(attack:string,defenders:string[]):number;
export function analyzeCoverage(team:string[]):{covered:string[];missing:string[]};
export function estimateBattlePressure(attack:string,defenders:string[],weather?:string,friendship?:string):number;
