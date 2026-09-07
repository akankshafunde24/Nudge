export type NudgeIntent="question"|"expense"|"income"|"refund"|"investment"|"settlement"|"goal_contribution"|"checkin"|"journal"|"unknown";

export interface ParsedNudge {
  intent:NudgeIntent;
  confidence:"high"|"medium"|"low";
  original:string;
  date:string;
  amount?:number;
  category?:string;
  description?:string;
  friends?:string[];
  person?:string;
  assetName?:string;
  assetType?:string;
  goalName?:string;
  movementMinutes?:number;
  mood?:number;
  content?:string;
  assumption?:string;
}

const cleanName=(v:string)=>v.trim().replace(/^(my|our)\s+/i,"").replace(/[.!?]+$/g,"");
const moneyNumber=(text:string)=>{const matches=[...text.matchAll(/(?:₹|rs\.?\s*)?([0-9][0-9,]*(?:\.\d{1,2})?)/gi)].map(m=>Number(m[1].replaceAll(",",""))).filter(n=>Number.isFinite(n));return matches[0]};
const shiftDate=(today:string,days:number)=>{const d=new Date(`${today}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10)};
const dateFrom=(text:string,today:string)=>/\byesterday\b/i.test(text)?shiftDate(today,-1):today;

function inferCategory(text:string){
 const s=text.toLowerCase();
 if(/dinner|lunch|breakfast|food|restaurant|cafe|coffee|pizza|grocer|snack|meal/.test(s))return"Food";
 if(/uber|ola|auto|cab|taxi|train|bus|flight|travel|petrol|fuel|metro/.test(s))return"Travel";
 if(/shop|clothes|dress|shoe|amazon|flipkart|purchase/.test(s))return"Shopping";
 if(/electric|wifi|internet|rent|bill|recharge|utility/.test(s))return"Bills";
 if(/movie|concert|party|game|fun|netflix|spotify/.test(s))return"Fun";
 if(/doctor|medicine|pharmacy|salon|health|personal care/.test(s))return"Health";
 if(/course|book|class|learn|exam/.test(s))return"Learning";
 if(/gift|birthday|family/.test(s))return"Gifts";
 return"Other";
}

function inferDescription(text:string,category:string){
 const s=text.toLowerCase();
 if(/dinner/.test(s))return"Dinner"; if(/lunch/.test(s))return"Lunch"; if(/breakfast/.test(s))return"Breakfast";
 if(/grocer/.test(s))return"Groceries"; if(/coffee|cafe/.test(s))return"Coffee"; if(/movie/.test(s))return"Movie";
 if(/uber|ola|auto|cab|taxi/.test(s))return"Ride"; if(/flight/.test(s))return"Flight"; if(/train/.test(s))return"Train";
 return category;
}

function parseFriends(text:string){
 const patterns=[/\bwith\s+(.+?)\s+(?:and\s+)?(?:i\s+)?(?:spent|spend|paid|covered|pay|bill|cost)/i,/\bwith\s+(.+?)(?:,|\.|$)/i];
 for(const p of patterns){const m=text.match(p);if(!m)continue;const names=m[1].split(/\s*(?:,|\band\b|&)\s*/i).map(cleanName).filter(Boolean).filter(n=>!/^me$|^myself$|^i$/i.test(n));if(names.length)return names;}
 return[] as string[];
}

function moodFrom(text:string){const s=text.toLowerCase();if(/amazing|great|very good|fantastic|happy|excellent/.test(s))return5;if(/good|nice|pretty good|calm|fine/.test(s))return4;if(/okay|ok|normal|neutral/.test(s))return3;if(/low|tired|sad|not great|bad/.test(s))return2;if(/awful|terrible|very sad|exhausted/.test(s))return1;return undefined}

export function parseNudgeText(raw:string,today:string):ParsedNudge{
 const original=raw.trim(); const text=original.toLowerCase(); const date=dateFrom(text,today);
 if(!original)return{intent:"unknown",confidence:"low",original,date};

 const movement=text.match(/(?:walked|walk|ran|run|jogged|worked out|workout|exercised|exercise|yoga).*?([0-9]{1,3})\s*(?:min|mins|minutes)/i);
 if(movement||/\b(feeling|mood|energy)\b/.test(text))return{intent:"checkin",confidence:movement?"high":"medium",original,date,movementMinutes:movement?Number(movement[1]):undefined,mood:moodFrom(text),description:original};

 const settlement=text.match(/^\s*([a-z][a-z .'-]{0,40}?)\s+(?:returned|paid me|gave me back|sent me back|repaid).*?(?:₹|rs\.?\s*)?([0-9][0-9,]*(?:\.\d{1,2})?)/i);
 if(settlement)return{intent:"settlement",confidence:"high",original,date,person:cleanName(settlement[1]),amount:Number(settlement[2].replaceAll(",","")),description:`Settlement from ${cleanName(settlement[1])}`};

 const investment=text.match(/(?:invested|invest|sip|bought|buy|deposited|deposit)\s*(?:₹|rs\.?\s*)?([0-9][0-9,]*(?:\.\d{1,2})?)\s+(?:in|into|towards?)\s+(.+)/i);
 if(investment){const assetName=cleanName(investment[2].replace(/\b(today|yesterday)\b/gi,"").trim());return{intent:"investment",confidence:"high",original,date,amount:Number(investment[1].replaceAll(",","")),assetName,assetType:/fund|sip/i.test(assetName)?"Mutual Fund":/gold/i.test(assetName)?"Gold":/fd|fixed deposit/i.test(assetName)?"RD / FD":/stock|share/i.test(assetName)?"Stocks":"Other",description:`Investment in ${assetName}`};}

 const refund=text.match(/(?:refund|refunded|got back)\D{0,20}(?:₹|rs\.?\s*)?([0-9][0-9,]*(?:\.\d{1,2})?)/i);
 if(refund)return{intent:"refund",confidence:"high",original,date,amount:Number(refund[1].replaceAll(",","")),category:inferCategory(text),description:"Refund"};

 const income=text.match(/(?:salary|income|credited|received)\D{0,20}(?:₹|rs\.?\s*)?([0-9][0-9,]*(?:\.\d{1,2})?)/i);
 if(income&&!/returned|repaid|refund/.test(text))return{intent:"income",confidence:"high",original,date,amount:Number(income[1].replaceAll(",","")),category:"Income",description:/salary/.test(text)?"Salary":"Income"};

 const goal=text.match(/(?:put|saved|added|set aside)\s*(?:₹|rs\.?\s*)?([0-9][0-9,]*(?:\.\d{1,2})?)\s+(?:toward|towards|for)\s+(.+)/i);
 if(goal){const goalName=cleanName(goal[2].replace(/\b(today|yesterday)\b/gi,"").trim());return{intent:"goal_contribution",confidence:"medium",original,date,amount:Number(goal[1].replaceAll(",","")),goalName,description:`Contribution to ${goalName}`};}

 const amount=moneyNumber(text);
 if(amount&&/(spent|spend|paid|pay|cost|bill|bought|purchase|had|went for)/.test(text)){
   const category=inferCategory(text),friends=parseFriends(original),description=inferDescription(text,category);
   return{intent:"expense",confidence:"high",original,date,amount,category,description,friends,assumption:friends.length?`Assuming the ₹${amount.toLocaleString("en-IN")} total was paid by you and split equally between you${friends.length?` and ${friends.join(", ")}`:""}.`:undefined};
 }

 if(/^(why|what|where|who|how|compare|show|tell me|did i|am i|which|when)\b/i.test(original)||original.endsWith("?"))return{intent:"question",confidence:"high",original,date,content:original};
 if(/^(remember|journal|note|gratitude|i want to remember)\b/i.test(original))return{intent:"journal",confidence:"medium",original,date,content:original.replace(/^(remember(?: that)?|journal|note|gratitude|i want to remember)[:\s-]*/i,"")};
 return{intent:"unknown",confidence:"low",original,date,content:original};
}
