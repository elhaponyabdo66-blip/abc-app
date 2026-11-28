/* ---------- منظومة الامتحانات: المعلم ---------- */
const TL={mcq:'اختيار من متعدد',tf:'صح / خطأ',essay:'مقالي'};
const qid=()=>'q'+Date.now().toString(36)+Math.floor(Math.random()*46656).toString(36);
function viewExams(){
 $('#app').innerHTML=`<section><button class="link" data-view="" style="margin:0 0 10px">→ رجوع</button>
 <h2>بنك الامتحانات</h2><p class="lead">ابنِ امتحانًا بدرع ABC، وشارك رمزه مع الطلاب.</p>
 <label class="fld">عنوان الامتحان<input id="bt" type="text" placeholder="مثال: اختبار الوحدة الأولى" autocomplete="off"></label>
 <label class="fld">المدة بالدقائق<input id="bd" type="number" min="5" max="240" value="30" dir="ltr"></label>
 <h3>🛡️ إعدادات درع ABC</h3>
 <label class="fld">عدد مرات الخروج المسموحة من التطبيق<select id="bx"><option value="0">بدون حد (تسجيل فقط)</option><option value="1">مرة واحدة</option><option value="2" selected>مرتان</option><option value="3">3 مرات</option><option value="5">5 مرات</option></select></label>
 <label class="chk"><input type="checkbox" id="bn"> منع الرجوع للأسئلة السابقة</label>
 <label class="chk"><input type="checkbox" id="br"> إظهار الدرجة للطالب بعد التسليم</label>
 <p class="mu">ترتيب الأسئلة والخيارات يختلف تلقائيًا لكل طالب، والإجابات الصحيحة تبقى على الخادم ولا تصل لهاتف الطالب.</p>
 <h3>الأسئلة (<span id="qc">0</span>)</h3><div id="ql"></div>
 <h4>إضافة من تحضيراتي المحفوظة</h4><div class="list" id="lsrc"></div>
 <h4>إضافة سؤال يدويًا</h4>
 <label class="fld">نوع السؤال<select id="mt"><option value="mcq">اختيار من متعدد</option><option value="tf">صح / خطأ</option><option value="essay">مقالي</option></select></label>
 <label class="fld">نص السؤال<textarea id="mq" rows="2" dir="auto"></textarea></label>
 <div id="mm"><input id="mo1" placeholder="الخيار 1" dir="auto"><input id="mo2" placeholder="الخيار 2" dir="auto"><input id="mo3" placeholder="الخيار 3" dir="auto"><input id="mo4" placeholder="الخيار 4" dir="auto"><label class="fld">الخيار الصحيح<select id="mc"><option value="0">الخيار 1</option><option value="1">الخيار 2</option><option value="2">الخيار 3</option><option value="3">الخيار 4</option></select></label></div>
 <label class="fld" id="mf" hidden>الإجابة الصحيحة<select id="mtf"><option value="1">صح</option><option value="0">خطأ</option></select></label>
 <button class="btn b2" id="madd">+ إضافة السؤال</button>
 <button class="btn b2" id="vgen">🧬 ولّد نسخًا متعددة بالذكاء الاصطناعي</button>
 <p class="mu">يولّد نسختين إضافيتين لكل سؤال، فيحصل كل طالب على صيغة مختلفة. يُحسب من تحضيراتك اليومية، وراجع النسخ الجديدة قبل النشر.</p>
 ${codeField()}
 <button class="btn" id="pub">🚀 نشر الامتحان</button><div id="pubres"></div>
 <h3>امتحاناتي المنشورة</h3><div class="list" id="ex2"></div>
 <label class="fld" style="margin-top:14px">فتح نتائج برمز امتحان<input id="oc" inputmode="numeric" maxlength="6" dir="ltr" placeholder="123456"></label>
 <button class="btn b2" id="oo">عرض النتائج</button></section>`;
 qlist();lsrc();exlist();
}
function qlist(){
 $('#qc').textContent=B.qs.length;
 $('#ql').innerHTML=B.qs.length?B.qs.map((q,i)=>`<div class="card" style="margin:8px 0;padding:10px"><div style="display:flex;gap:8px;align-items:center"><span class="mu" style="margin:0">${TL[q.type]}</span><input type="number" min="1" max="20" value="${q.pts}" data-pts="${i}" style="width:64px;margin:0;padding:6px" aria-label="الدرجة" dir="ltr"><button class="del" data-qd="${i}" style="margin-inline-start:auto" aria-label="حذف السؤال">✕</button></div><p dir="auto" style="margin:6px 0">${esc(q.v[0].q)}</p><details><summary class="mu">النسخ (${q.v.length})</summary>${q.v.map(v=>`<div dir="auto" style="margin:6px 0;font-size:14px">• ${esc(v.q)}${q.type==='mcq'?'<br>'+v.options.map((o,k)=>(k===v.a?'✅ ':'▫️ ')+esc(o)).join(' · '):q.type==='tf'?' ('+(v.a?'صح':'خطأ')+')':''}</div>`).join('')}</details></div>`).join(''):'<p class="mu">لم تُضف أسئلة بعد.</p>';
}
function lsrc(){
 $('#lsrc').innerHTML=D.lessons.length?D.lessons.map(l=>{const q=l.plan.questions||{};const n=(q.mcq||[]).length+(q.tf||[]).length+(q.essay||[]).length;return `<div class="row" data-imp="${l.id}"><span class="bd">${esc((l.title||'؟')[0])}</span><span class="tx"><strong>${esc(l.title)}</strong><small>${n} سؤالًا · اضغط للإضافة</small></span></div>`}).join(''):'<p class="mu">احفظ تحضيرًا من «محضّر الدروس» لتستورد أسئلته هنا.</p>';
}
function exlist(){
 $('#ex2').innerHTML=D.exams.length?D.exams.map(x=>`<div class="row" data-xo="${x.code}"><span class="bd">${esc((x.title||'؟')[0])}</span><span class="tx"><strong>${esc(x.title)}</strong><small>الرمز: ${x.code}</small></span><em>النتائج</em></div>`).join(''):'<p class="mu">لم تنشر امتحانات بعد.</p>';
}
function importLesson(id){
 const l=D.lessons.find(x=>String(x.id)===id);if(!l)return;
 const q=l.plan.questions||{};let n=0;
 (q.mcq||[]).forEach(m=>{if(m&&m.q&&Array.isArray(m.options)&&m.options.length>=2&&Number.isInteger(m.answer)&&m.answer>=0&&m.answer<m.options.length){B.qs.push({id:qid(),type:'mcq',pts:2,v:[{q:String(m.q),options:m.options.map(String),a:m.answer}]});n++}});
 (q.tf||[]).forEach(m=>{if(m&&m.q&&typeof m.answer==='boolean'){B.qs.push({id:qid(),type:'tf',pts:1,v:[{q:String(m.q),a:m.answer}]});n++}});
 (q.essay||[]).forEach(m=>{if(m){B.qs.push({id:qid(),type:'essay',pts:3,v:[{q:String(m),a:null}]});n++}});
 B.qs=B.qs.slice(0,50);qlist();toast('أُضيف '+n+' سؤالًا');
}
function addManual(){
 const t=$('#mt').value,q=$('#mq').value.trim();
 if(!q){toast('اكتب نص السؤال');return}
 if(B.qs.length>=50){toast('الحد الأقصى 50 سؤالًا');return}
 if(t==='mcq'){
  const o=[1,2,3,4].map(i=>$('#mo'+i).value.trim());
  if(o.some(x=>!x)){toast('اكتب الخيارات الأربعة');return}
  B.qs.push({id:qid(),type:'mcq',pts:2,v:[{q,options:o,a:+$('#mc').value}]});
 }else if(t==='tf')B.qs.push({id:qid(),type:'tf',pts:1,v:[{q,a:$('#mtf').value==='1'}]});
 else B.qs.push({id:qid(),type:'essay',pts:3,v:[{q,a:null}]});
 $('#mq').value='';[1,2,3,4].forEach(i=>$('#mo'+i).value='');qlist();toast('تمت الإضافة');
}
function variantsPrompt(items){
 return `أنت معلم خبير. لكل سؤال في القائمة التالية اكتب نسختين مختلفتين تقيسان نفس المفهوم وبنفس المستوى والصعوبة وبنفس لغة السؤال. في الرياضيات والمسائل غيّر الأرقام والمعطيات، وفي غيرها أعد الصياغة بمثال أو سياق مختلف. لا تغيّر نوع السؤال. في اختيار من متعدد اكتب 4 خيارات و a هو رقم الخيار الصحيح (0 إلى 3). في صح وخطأ a هو true أو false. تأكد أن الإجابة الصحيحة صحيحة فعلًا.
الأسئلة: ${JSON.stringify(items)}
أعد JSON فقط: {"variants":[{"id":"","v":[{"q":"","options":["","","",""],"a":0},{"q":"","options":["","","",""],"a":0}]}]} (بدون options في أسئلة صح وخطأ).`;
}
async function genVariants(){
 const qs=B.qs.filter(q=>q.type!=='essay'&&q.v.length<3).slice(0,15);
 if(!qs.length){toast('لا توجد أسئلة تحتاج نسخًا (اختيار أو صح/خطأ)');return}
 const b=$('#vgen');b.disabled=true;b.textContent='جارٍ توليد النسخ…';
 try{
  const p=await ai(variantsPrompt(qs.map(q=>({id:q.id,type:q.type,q:q.v[0].q,options:q.v[0].options,a:q.v[0].a}))));
  if(!p)return;
  let n=0;
  (p.variants||[]).forEach(x=>{
   const q=B.qs.find(y=>y.id===x.id);if(!q)return;
   (x.v||[]).forEach(v=>{
    if(!v||!v.q)return;
    if(q.type==='mcq'){if(!Array.isArray(v.options)||v.options.length<2||!Number.isInteger(v.a)||v.a<0||v.a>=v.options.length)return;q.v.push({q:String(v.q),options:v.options.map(String),a:v.a});n++}
    else if(typeof v.a==='boolean'){q.v.push({q:String(v.q),a:v.a});n++}
   });
   q.v=q.v.slice(0,3);
  });
  qlist();toast('أُضيفت '+n+' نسخة. راجعها قبل النشر.');
 }finally{b.disabled=false;b.textContent='🧬 ولّد نسخًا متعددة بالذكاء الاصطناعي'}
}
async function publish(){
 if(!B.qs.length){toast('أضف أسئلة أولًا');return}
 const title=$('#bt').value.trim()||'امتحان',duration=+$('#bd').value||30;
 const settings={maxExits:+$('#bx').value,noBack:$('#bn').checked,showResult:$('#br').checked};
 const btn=$('#pub');btn.disabled=true;
 const d=await api('/exam/publish',{exam:{title,duration,settings,questions:B.qs}});
 btn.disabled=false;
 if(!d)return;
 D.exams.unshift({code:d.code,title,created:Date.now()});saveD();exlist();
 $('#pubres').innerHTML=`<div class="card"><p class="mu">تم نشر الامتحان. رمز الدخول للطلاب:</p><div class="code">${d.code}</div><button class="btn b2" data-sc="${d.code}" data-st="${esc(title)}">📤 مشاركة الرمز</button></div>`;
 B={qs:[]};qlist();
}
/* ---------- نتائج الامتحان وكاشف التشابه ---------- */
function viewRes(){
 $('#app').innerHTML=`<section><button class="link" data-view="exams" style="margin:0 0 10px">→ رجوع</button>
 <h2>نتائج الامتحان</h2><p class="mu" dir="ltr" style="text-align:start">${esc(RC)}</p>${codeField()}<div id="rb"><p class="lead">جارٍ تحميل النتائج…</p></div></section>`;
 loadRes();
}
async function loadRes(){
 const d=await api('/exam/results?code='+encodeURIComponent(RC));
 if(!d){$('#rb').innerHTML='<button class="btn b2" data-reload="1">إعادة المحاولة</button>';return}
 RD=d;renderRes();
}
function analyze(d){
 const Q=d.questions,K=d.key;
 const rows=d.results.map(r=>{
  const ans=(r.a||'').split(',').map(s=>{const i=s.indexOf('.');return{vi:+s.slice(0,i),a:s.slice(i+1)}});
  const ts=(r.t||'').split(',').map(Number);
  const wrong={};let obj=0,fast=0;
  Q.forEach((q,i)=>{
   if(q.type==='essay')return;const x=ans[i];if(!x)return;obj++;
   if(x.a!=='-'&&(ts[i]||0)<2)fast++;
   const k=K[q.id]?K[q.id][x.vi]:null,kk=typeof k==='boolean'?(k?'1':'0'):String(k);
   if(x.a!=='-'&&x.a!==kk)wrong[i]=x.vi+':'+x.a;
  });
  return{r,ans,wrong,nw:Object.keys(wrong).length,obj,fast,pair:0,t:100};
 });
 const pairs=[];
 for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){
  let sh=0;for(const k in rows[i].wrong)if(rows[i].wrong[k]===rows[j].wrong[k])sh++;
  const m=Math.min(rows[i].nw,rows[j].nw);
  if(sh>=3&&m&&sh/m>=.6){pairs.push({a:rows[i].r.n,b:rows[j].r.n,sh,m,p:Math.round(sh/m*100)});rows[i].pair=1;rows[j].pair=1}
 }
 rows.forEach(o=>{
  const r=o.r;let t=100;
  t-=Math.min(40,(r.x||0)*12);t-=Math.min(25,Math.floor((r.aw||0)/10));t-=Math.min(20,(r.p||0)*10);
  if(r.l)t-=10;if(r.r==='exits')t-=20;if(o.obj>=4&&o.fast/o.obj>=.5)t-=15;if(o.pair)t-=25;
  o.t=Math.max(0,t);
 });
 return{rows,pairs};
}
const tcls=t=>t>=80?'ok':t>=50?'wa':'bad';
const tlab=t=>t>=80?'موثوق':t>=50?'يحتاج مراجعة':'مشتبه';
let AN=null;
function renderRes(){
 const d=RD;AN=analyze(d);const{rows,pairs}=AN;
 const done=rows.length,avg=done?Math.round(rows.reduce((s,o)=>s+(o.r.m?o.r.s/o.r.m:0),0)/done*100):0;
 rows.sort((a,b)=>(b.r.m?b.r.s/b.r.m:0)-(a.r.m?a.r.s/a.r.m:0));
 $('#rb').innerHTML=`<h3 style="margin-top:0" dir="auto">${esc(d.title)}</h3>
 <div class="stat">سلّموا: <b>${done}</b></div><div class="stat">قيد الحل: <b>${d.inProgress.length}</b></div><div class="stat">المتوسط: <b>${avg}%</b></div>${d.closed?'<div class="stat"><b>مغلق</b></div>':''}
 ${d.inProgress.length?`<p class="mu">قيد الحل الآن: ${d.inProgress.map(x=>esc(x.n)).join('، ')}</p>`:''}
 <div class="two"><button class="btn b2" data-reload="1">🔄 تحديث</button><button class="btn b2" id="rshare">📤 نسخ النتائج</button></div>
 ${d.closed?'':'<button class="btn b2" id="xclose" style="margin-top:0">🔒 إغلاق الامتحان (لا دخول جديد)</button>'}
 <h3>🛡️ كاشف التشابه</h3>
 ${pairs.length?pairs.map(p=>`<div class="tip" dir="auto"><b>${esc(p.a)}</b> ↔ <b>${esc(p.b)}</b><br>${p.sh} أخطاء متطابقة من ${p.m} (${p.p}%)</div>`).join('')+'<p class="mu">تطابق الأخطاء نفسها مع اختلاف ترتيب الخيارات مؤشر قوي، لكنه ليس دليلًا قاطعًا. راجع الحالة بنفسك.</p>':'<p class="mu">لا توجد أزواج مشتبهة.</p>'}
 <h3>الطلاب</h3><p class="mu">الرقم الملوّن هو درجة الثقة (0 إلى 100)، وهي للمراجعة وليست حكمًا.</p>
 <div id="det"></div>
 <div class="list">${rows.length?rows.map(o=>{const r=o.r,c=tcls(o.t),mins=Math.max(0,Math.round(((r.en||0)-(r.st||0))/60000));return `<div class="row" data-det="${esc(r.n)}"><span class="bd ${c}">${o.t}</span><span class="tx"><strong>${esc(r.n)}</strong><small>${r.s}/${r.m}${r.e?' + مقالي '+r.e:''} · ${mins} د · خروج ${r.x||0}${r.aw?' ('+r.aw+'ث)':''}${r.p?' · لصق '+r.p:''}${r.l?' · تأخّر':''}${r.r==='exits'?' · أُنهي تلقائيًا':''}</small></span><em class="${c}">${tlab(o.t)}</em></div>`}).join(''):'<p class="mu">لم يسلّم أحد بعد.</p>'}</div>`;
}
async function showDet(name){
 const d=await api('/exam/result?code='+encodeURIComponent(RC)+'&name='+encodeURIComponent(name));
 if(!d)return;
 const o=AN.rows.find(x=>x.r.n===name);
 const es=Object.keys(d.essay||{}).map(id=>{const i=RD.questions.findIndex(q=>q.id===id),q=RD.questions[i],vi=o&&o.ans[i]?o.ans[i].vi:0;return `<p dir="auto"><b>${esc(q&&q.v[vi]?q.v[vi].q:'')}</b><br>${esc(d.essay[id]||'(بدون إجابة)')}</p>`}).join('');
 $('#det').innerHTML=`<div class="card"><h3 dir="auto">${esc(name)}</h3>${es||'<p class="mu">لا توجد أسئلة مقالية.</p>'}<p class="mu">مرات الخروج: ${(d.exits||[]).length?d.exits.map(x=>x+'ث').join('، '):'لا يوجد'}</p></div>`;
 $('#det').scrollIntoView({behavior:'smooth'});
}
