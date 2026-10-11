const s=require("fs").readFileSync(require("path").join(__dirname,"../web/index.html"),"utf8");
const grab=re=>s.match(re)[0];
const src=[grab(/const dayKey = ts => \{[^\n]*/), grab(/function weekKey[^\n]*/), grab(/function streakInfo[\s\S]*?\n\}/)].join("\n");
const {dayKey,streakInfo}=new Function(src+";return {dayKey,streakInfo};")();
const ago=n=>{const d=new Date();d.setDate(d.getDate()-n);return dayKey(d.getTime());};
const set=a=>new Set(a.map(ago));
let fails=0;const eq=(name,got,exp)=>{const ok=JSON.stringify(got)===JSON.stringify(exp);if(!ok)fails++;console.log(ok?"PASS":"FAIL",name,"got",JSON.stringify(got),"exp",JSON.stringify(exp));};
eq("boş",streakInfo(new Set()).n,0);
eq("bugün+dün+önceki",streakInfo(set([0,1,2])).n,3);
eq("bugün yok, dün var",streakInfo(set([1,2])).n,2);
// gün 1 boşluk: [0,2,3] → freeze (aynı haftada başka kullanım yoksa) → 3
const r=streakInfo(set([0,2,3]));
const sameWeekGap = true;
eq("tek gün boşluk korunur",r.n,3);
eq("dondurulan gün",r.frozen,[ago(1)]);
eq("iki gün boşluk korunmaz",streakInfo(set([0,3,4])).n,1);
// aynı hafta içinde iki boşluk: sadece biri korunur — haftanın başından bağımsız test için 14 günlük, her 2. gün boş
const alt=[];for(let i=0;i<14;i+=2)alt.push(i);
const ra=streakInfo(set(alt));
console.log("INFO alternating:",ra.n,"frozen",ra.frozen.length,"(her haftada en fazla 1 donma beklenir)");
const weeks={};for(const f of ra.frozen){const d=new Date(f+"T12:00");d.setDate(d.getDate()-((d.getDay()+6)%7));const k=d.toDateString();weeks[k]=(weeks[k]||0)+1;}
eq("hafta başına ≤1 donma",Object.values(weeks).every(v=>v<=1),true);
eq("hazır bayrağı (boşluk yok)",streakInfo(set([0,1,2])).freezeReady,true);
process.exit(fails?1:0);
