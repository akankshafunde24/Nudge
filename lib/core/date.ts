export const NUDGE_TIME_ZONE = "Asia/Kolkata";
export function indiaDateParts(date=new Date()){const parts=new Intl.DateTimeFormat("en-CA",{timeZone:NUDGE_TIME_ZONE,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(date),value=(type:Intl.DateTimeFormatPartTypes)=>parts.find(p=>p.type===type)?.value||"",year=value("year"),monthNumber=value("month"),day=value("day");return{date:`${year}-${monthNumber}-${day}`,month:`${year}-${monthNumber}`,year:Number(year)}}
export function indiaHour(date=new Date()){return Number(new Intl.DateTimeFormat("en-GB",{timeZone:NUDGE_TIME_ZONE,hour:"2-digit",hourCycle:"h23"}).format(date))}
export function indiaTime(date=new Date()){return new Intl.DateTimeFormat("en-GB",{timeZone:NUDGE_TIME_ZONE,hour:"2-digit",minute:"2-digit",hour12:false}).format(date)}
export function logicalIndiaDate(date=new Date()){const{date:key}=indiaDateParts(date);return new Date(`${key}T12:00:00.000Z`)}
