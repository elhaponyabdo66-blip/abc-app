const API='https://abc-ai.elhaponyabdo66.workers.dev';
const DAILY=4;
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ROLES={
 student:{n:'طالب',l:'ط',c:'g',h:'راجع دروسك، والعب، واختبر نفسك'},
 teacher:{n:'معلم',l:'م',c:'r',h:'حضّر حصصك وامتحاناتك في دقائق'},
 parent:{n:'ولي أمر',l:'و',c:'n',h:'تابع مستوى ابنك خطوة بخطوة'},
 admin:{n:'إدارة',l:'إ',c:'a',h:'أدر الفصول والحضور والتقارير'}
};
const MODS={
 teacher:[['محضّر الدروس','صوّر الدرس واحصل على تحضير كامل ومخطط انسيابي',3,'lesson'],['بنك الامتحانات','ابنِ امتحانًا آمنًا بدرع ABC وتابع النتائج',4,'exams'],['متابعة الطلاب','الحضور والدرجات ونقاط الضعف',5],['المذكرات والملخصات','ملخصات جاهزة للطباعة',7]],
 student:[['ألعاب المراجعة','تحديات وبطاقات تلخّص المنهج',6],['امتحاناتي','ادخل برمز الامتحان وأجب بأمان',4,'sexam'],['مذكراتي','ملخصات ومراجعات لكل مادة',7],['تقدّمي','نقاطك وشاراتك ومستواك',5]],
 parent:[['مستوى ابني','الدرجات ونقاط القوة والضعف',5],['الحضور والغياب','سجل الحضور اليومي',5],['رسائل المعلمين','تواصل مباشر مع المعلم',8]],
 admin:[['الطلاب والفصول','إضافة الطلاب وتوزيعهم',2,'students'],['الحضور','حضور الطلاب والمعلمين',5],['التقارير','تقارير شاملة للمدرسة',5]]
};
const STAGES=['الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع'].map(x=>'الصف '+x+' أساسي').concat(['الأول الثانوي','الثاني الثانوي','الثالث الثانوي']);
const SUBJ=[['اللغة العربية','Arabic'],['اللغة الإنجليزية','English'],['الرياضيات','Mathematics'],['العلوم','Science'],['الفيزياء','Physics'],['الكيمياء','Chemistry'],['الأحياء','Biology'],['الجيولوجيا','Geology'],['التربية الإسلامية','Islamic Studies'],['الاجتماعيات','Social Studies'],['التاريخ','History'],['الجغرافيا','Geography'],['الحاسوب','Computer'],['التربية الفنية','Art'],['التربية البدنية','Physical Education']];
let S={role:null,stage:0},D={students:[],lessons:[],exams:[]},V='',CUR=null,CURT='',IMG=null;
let B={qs:[]},RC='',RD=null,EX=null,DN=null;
try{Object.assign(S,JSON.parse(localStorage.getItem('abc')||'{}'))}catch(e){}
try{Object.assign(D,JSON.parse(localStorage.getItem('abc_d')||'{}'))}catch(e){}
D.lessons=(D.lessons||[]).filter(l=>l&&l.plan);D.exams=D.exams||[];
const save=()=>{try{localStorage.setItem('abc',JSON.stringify(S))}catch(e){}};
const saveD=()=>{try{localStorage.setItem('abc_d',JSON.stringify(D))}catch(e){}};
const getCode=()=>{try{return localStorage.getItem('abc_code')||''}catch(e){return ''}};
const getUid=()=>{try{let u=localStorage.getItem('abc_uid');if(!u){const a=new Uint8Array(12);crypto.getRandomValues(a);u=Array.from(a,x=>x.toString(16).padStart(2,'0')).join('');localStorage.setItem('abc_uid',u)}return u}catch(e){return 'anon'}};
const codeField=()=>`<label class="fld" id="cdw"${getCode()?' hidden':''}>رمز المعلم (مرة واحدة فقط)<input id="cd" type="password" autocomplete="off" dir="ltr"></label>`;
const readCode=()=>getCode()||(($('#cd')||{}).value||'').trim();
const today=()=>new Date(Date.now()+7200000).toISOString().slice(0,10);
function leftText(){
 try{const o=JSON.parse(localStorage.getItem('abc_left')||'{}');if(o.day===today())return 'المتبقي اليوم: '+o.left+' من '+DAILY+' تحضيرات'}catch(e){}
 return 'لديك '+DAILY+' تحضيرات يوميًا';
}
function setLeft(n){
 try{localStorage.setItem('abc_left',JSON.stringify({day:today(),left:n}))}catch(e){}
 const e=$('#lf');if(e)e.textContent=leftText();
}
function render(){
 const app=$('#app');
 if(!ROLES[S.role]){
  app.innerHTML=`<section><h2>من يستخدم التطبيق؟</h2><p class="lead">اختر دورك لتظهر لك الأدوات المناسبة.</p><div class="tiles">${Object.entries(ROLES).map(([k,r])=>`<button class="tile ${r.c}" data-role="${k}"><span class="ltr">${r.l}</span><span>${r.n}</span></button>`).join('')}</div></section>`;
  return;
 }
 if(V==='run'&&EX&&!EX.done){viewExam();return}
 if(V==='done'){viewDone();return}
 if(V==='students'&&S.role==='admin'){viewStudents();return}
 if(V==='lesson'&&S.role==='teacher'){viewLesson();return}
 if(V==='exams'&&S.role==='teacher'){viewExams();return}
 if(V==='xres'&&S.role==='teacher'){viewRes();return}
 if(V==='sexam'&&S.role==='student'){viewJoin();return}
 V='';
 const r=ROLES[S.role];
 app.innerHTML=`<section><div class="hero ${r.c}"><span class="ltr">${r.l}</span><div><h2>${r.n}</h2><p>${r.h}</p></div></div>
 <label class="fld">المرحلة الدراسية<select id="stage">${STAGES.map((s,i)=>`<option value="${i}"${i===S.stage?' selected':''}>${s}</option>`).join('')}</select></label>
 <div class="list ${r.c}">${MODS[S.role].map(m=>`<button class="row" data-t="${m[0]}" data-n="${m[2]}" data-k="${m[3]||''}"><span class="bd">${m[0][0]}</span><span class="tx"><strong>${m[0]}</strong><small>${m[1]}</small></span><em class="${m[3]?'ok':''}">${m[3]?'جاهز':'المرحلة '+m[2]}</em></button>`).join('')}</div>
 <button class="link" data-role="">تغيير الدور</button></section>`;
}
function viewStudents(){
 $('#app').innerHTML=`<section><button class="link" data-view="" style="margin:0 0 10px">→ رجوع</button>
 <h2>الطلاب والفصول</h2><div class="stat"><b id="cnt">0</b> طالب</div>
 <label class="fld">اسم الطالب<input id="nm" type="text" placeholder="الاسم الكامل" autocomplete="off"></label>
 <label class="fld">الصف<select id="stg">${STAGES.map((s,i)=>`<option value="${i}">${s}</option>`).join('')}</select></label>
 <label class="fld">رقم ولي الأمر (اختياري)<input id="ph" type="tel" placeholder="09XXXXXXXX" dir="ltr"></label>
 <button class="btn" id="add">إضافة الطالب</button>
 <label class="fld">بحث<input id="q" type="search" placeholder="ابحث باسم الطالب"></label>
 <label class="fld">تصفية حسب الصف<select id="fs"><option value="">كل الصفوف</option>${STAGES.map((s,i)=>`<option value="${i}">${s}</option>`).join('')}</select></label>
 <div class="list" id="lst"></div></section>`;
 listStudents();
}
function listStudents(){
 const q=($('#q').value||'').trim(),f=$('#fs').value;
 const a=D.students.filter(s=>(!q||s.name.includes(q))&&(f===''||String(s.stage)===f));
 $('#cnt').textContent=D.students.length;
 $('#lst').innerHTML=a.length?a.map(s=>`<div class="row st"><span class="bd">${esc(s.name[0]||'؟')}</span><span class="tx"><strong>${esc(s.name)}</strong><small>${esc(STAGES[s.stage]||'')}${s.phone?' · '+esc(s.phone):''}</small></span><button class="del" data-del="${s.id}" aria-label="حذف الطالب">✕</button></div>`).join(''):'<p class="lead">لا يوجد طلاب بعد. أضف أول طالب من الأعلى.</p>';
}
/* ---------- الذكاء الاصطناعي ---------- */
async function ai(prompt,img){
 const code=readCode();
 if(!code){toast('أدخل رمز المعلم');return null}
 try{
  const ac=new AbortController(),to=setTimeout(()=>ac.abort(),90000);
  const r=await fetch(API,{method:'POST',signal:ac.signal,headers:{'content-type':'application/json','x-app-code':code,'x-uid':getUid()},body:JSON.stringify({prompt,image:img||null,mime:'image/jpeg'})});
  clearTimeout(to);
  const d=await r.json().catch(()=>({}));
  if(r.status===401){try{localStorage.removeItem('abc_code')}catch(e){}const w=$('#cdw');if(w)w.hidden=false;toast('الرمز غير صحيح');return null}
  if(r.status===429){setLeft(0);toast(d.error||'استهلكت تحضيراتك اليومية');return null}
  if(!d.text){toast('تعذّر التحضير: '+String(d.error||'لا يوجد رد').slice(0,120));return null}
  let p;try{p=JSON.parse(d.text.replace(/^```json|```$/g,'').trim())}catch(e){toast('جاء الرد بصيغة غير مفهومة، أعد المحاولة');return null}
  try{localStorage.setItem('abc_code',code)}catch(e){}
  const w=$('#cdw');if(w)w.hidden=true;
  if(typeof d.left==='number')setLeft(d.left);
  return p;
 }catch(e){toast(e.name==='AbortError'?'انتهت المهلة، أعد المحاولة':'تعذّر الاتصال، تأكد من الإنترنت');return null}
}
async function api(path,body){
 const code=readCode();
 if(!code){toast('أدخل رمز المعلم');return null}
 const ac=new AbortController(),to=setTimeout(()=>ac.abort(),30000);
 try{
  const r=await fetch(API+path,{method:body?'POST':'GET',signal:ac.signal,headers:{'content-type':'application/json','x-app-code':code,'x-uid':getUid()},body:body?JSON.stringify(body):undefined});
  const d=await r.json().catch(()=>({}));
  if(r.status===401){try{localStorage.removeItem('abc_code')}catch(e){}const w=$('#cdw');if(w)w.hidden=false;toast('الرمز غير صحيح');return null}
  if(!r.ok){toast(d.error||'حدث خطأ');return null}
  try{localStorage.setItem('abc_code',code)}catch(e){}
  const w=$('#cdw');if(w)w.hidden=true;
  return d;
 }catch(e){toast(e.name==='AbortError'?'انتهت المهلة':'تعذّر الاتصال');return null}
 finally{clearTimeout(to)}
}
async function sjson(path,body){
 try{const r=await fetch(API+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});const d=await r.json().catch(()=>({}));if(!r.ok){toast(d.error||'حدث خطأ');return null}return d}
 catch(e){toast('تعذّر الاتصال، تأكد من الإنترنت');return null}
}
let tt;
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('on'),3500)}
