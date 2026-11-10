export type GoType='normal'|'fire'|'water'|'electric'|'grass'|'ice'|'fighting'|'poison'|'ground'|'flying'|'psychic'|'bug'|'rock'|'ghost'|'dragon'|'dark'|'steel'|'fairy';
export type Weather='none'|'sunny'|'rainy'|'partly-cloudy'|'cloudy'|'windy'|'snow'|'fog';
export const GO_TYPES:ReadonlyArray<GoType>;
export const GO_WEATHER_TYPES:Readonly<Record<Weather,ReadonlyArray<GoType>>>;
export function goTypeMultiplier(attackType:string,defenderTypes:string[]):number|null;
export function goTypeMatchups(defenderTypes:string[]):{type:GoType;multiplier:number}[];
export function matchupForMove(attackType:string,defenderTypes:string[],opts?:{sameType?:boolean;weather?:Weather}):number|null;
export function maxMoveCost(move:'attack'|'guard'|'spirit',from:number,to:number,options?:{group?:'A'|'B'|'C'|'D'}):{mp:number;candy:number;candyXL:number;group:string;move:string;from:number;to:number}|null;
export function coverageCandidates<T extends {types?:string[]}>(candidates:T[],defenderTypes:string[]):(T&{originalOrder:number;possibleTypeCoverage:number|null})[];
