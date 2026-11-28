export function catchCP(attack,defense,stamina,iv=15,boosted=false){
 if(![attack,defense,stamina].every(v=>Number.isInteger(v)&&v>0&&v<=1000)||!Number.isInteger(iv)||iv<0||iv>15)return null;
 const cpm=boosted?0.667934:0.59740001;
 return Math.max(10,Math.floor((attack+iv)*Math.sqrt(defense+iv)*Math.sqrt(stamina+iv)*cpm*cpm/10));
}
export function trainerEstimate(hp,dps,seconds,uptime){
 if(![hp,dps,seconds,uptime].every(Number.isFinite)||hp<=0||dps<=0||seconds<=0||uptime<=0||uptime>100)return null;
 const damage=dps*seconds*uptime/100;
 return {trainers:Math.ceil(hp/damage),damagePerTrainer:Math.floor(damage)};
}
