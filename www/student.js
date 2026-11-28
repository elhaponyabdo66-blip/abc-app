/* ---------- الطالب: الدخول والامتحان ---------- */
const persist=()=>{if(!EX||EX.done)return;try{localStorage.setItem('abc_ex',JSON.stringify({code:EX.code,name:EX.name,attemptId:EX.attemptId,ans:EX.ans,ms:EX.ms,exits:EX.exits,away:EX.away,paste:EX.paste,qi:EX.qi,seen:Date.now()}))}catch(e){}};
const loadEx=()=>{try{return JSON.parse(localStorage.getItem('abc_ex')||'null')}catch(e){return null}};
const clearEx=()=>{try{localStorage.removeItem('abc_ex')}catch(e){}};
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function shuf(a,r){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function buildPlan(ex,seed){
 const r=rng(seed),qs=shuf(ex.questions,r);
 return qs.map(q=>{const vi=Math.floor(r()*q.v.length),v=q.v[vi];return{id:q.id,type:q.type,pts:q.pts,vi,q:v.q,opts:q.type==='mcq'?shuf(v.options.map((t,i)=>({t,i})),r):null}});
}
function viewJoin(){
 const sv=loadEx();
 $('#app').innerHTML=`<section><button class="link" data-view="" style="margin:0 0 10px">→ رجوع</button>
 <h2>دخول الامتحان</h2>
 <div class="tip"><b>🛡️ قواعد الامتحان</b><br>• كل خروج من التطبيق يُسجَّل، وقد يُنهي امتحانك.<br>• النسخ واللصق ممنوع.<br>• ترتيب أسئلتك يختلف عن زملائك.<br>• الوقت يبدأ لحظة الدخول ويحسبه الخادم.<br>• يُنصح بتفعيل وضع «عدم الإزعاج» قبل البدء.</div>
 ${sv?'<p class="mu">لديك امتحان غير مكتمل، أدخل البيانات نفسها لمتابعته.</p>':''}
 <label class="fld">رمز الامتحان<input id="xc" inputmode="numeric" maxlength="6" dir="ltr" value="${sv?esc(sv.code):''}"></label>
 <label class="fld">اسمك الكامل<input id="xn" autocomplete="off" value="${sv?esc(sv.name):''}"></label>
 <button class="btn" id="xgo">ابدأ الامتحان</button></section>`;
}
async function joinExam(){
 const code=$('#xc').value.trim(),name=$('#xn').value.trim();
 if(!/^\d{6}$/.test(code)||!name){toast('أدخل رمزًا من 6 أرقام واسمك');return}
 const b=$('#xgo');b.disabled=true;
 const d=await sjson('/exam/join',{code,name});
 b.disabled=false;
 if(!d)return;
 EX={code,name:d.name,attemptId:d.attemptId,exam:d.exam,s:d.exam.settings||{},plan:buildPlan(d.exam,d.seed),qi:0,ans:{},ms:{},exits:[],away:0,paste:0,endAt:Date.now()+d.leftMs,hid:0,qt:0,done:false,sub:false,tc:0,reason:''};
 const sv=loadEx();
 if(sv&&sv.code===code&&sv.attemptId===d.attemptId){
  Object.assign(EX,{ans:sv.ans||{},ms:sv.ms||{},exits:sv.exits||[],away:sv.away||0,paste:sv.paste||0,qi:Math.min(sv.qi||0,EX.plan.length-1)});
  const gap=Date.now()-(sv.seen||Date.now());
  if(gap>8000){EX.exits.push(gap);EX.away+=gap}
 }
 V='run';EX.iv=setInterval(tick,1000);resumeTime();persist();viewExam();
 const m=EX.s.maxExits;
 if(d.leftMs<=0)submitExam('time');
 else if(m&&EX.exits.length>m)submitExam('exits');
}
function flushTime(){if(EX&&EX.qt){const q=EX.plan[EX.qi];EX.ms[q.id]=(EX.ms[q.id]||0)+Date.now()-EX.qt;EX.qt=0}}
function resumeTime(){if(EX&&!EX.hid)EX.qt=Date.now()}
function viewExam(){
 const P=EX.plan,q=P[EX.qi],a=EX.ans[q.id],m=EX.s.maxExits;
 $('#app').innerHTML=`<section class="exam"><div class="xt"><span id="tm">--:--</span><span>سؤال ${EX.qi+1} من ${P.length}</span><span>الخروج: ${EX.exits.length}${m?' من '+m:''}</span></div>
 <div class="bar"><i style="width:${Math.round((EX.qi+1)/P.length*100)}%"></i></div>
 <h2 class="xq" dir="auto">${esc(q.q)}</h2>
 ${q.type==='mcq'?q.opts.map(o=>`<button class="opt${a===o.i?' sel':''}" data-opt="${o.i}" dir="auto">${esc(o.t)}</button>`).join(''):''}
 ${q.type==='tf'?`<div class="two"><button class="opt${a===true?' sel':''}" data-tf="1">صح</button><button class="opt${a===false?' sel':''}" data-tf="0">خطأ</button></div>`:''}
 ${q.type==='essay'?`<textarea id="es" rows="8" dir="auto" placeholder="اكتب إجابتك هنا">${esc(a||'')}</textarea>`:''}
 <div class="two" style="margin-top:14px">${(!EX.s.noBack&&EX.qi>0)?'<button class="btn b2" data-nav="-1">السابق</button>':'<span></span>'}${EX.qi<P.length-1?'<button class="btn" data-nav="1">التالي</button>':'<button class="btn" id="fin">إنهاء وتسليم</button>'}</div></section>`;
 tick(true);
}
function tick(quiet){
 if(!EX||EX.done)return;
 const l=EX.endAt-Date.now(),e=$('#tm');
 if(e){const s=Math.max(0,Math.ceil(l/1000));e.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
 if(quiet===true)return;
 if(l<=0){submitExam('time');return}
 if(++EX.tc%5===0){flushTime();resumeTime();persist()}
}
function onHide(){if(!EX||EX.done||EX.sub||EX.hid)return;EX.hid=Date.now();flushTime();persist()}
function onShow(){
 if(!EX||EX.done||EX.sub||!EX.hid)return;
 const d=Date.now()-EX.hid;EX.hid=0;EX.exits.push(d);EX.away+=d;resumeTime();persist();
 const m=EX.s.maxExits;
 if(m&&EX.exits.length>m){submitExam('exits');return}
 toast('تم تسجيل خروجك من الامتحان ('+EX.exits.length+(m?' من '+m:'')+')');
 if(V==='run')viewExam();
}
async function submitExam(reason){
 if(!EX||EX.done||EX.sub)return;
 EX.sub=true;EX.reason=reason;flushTime();
 if(EX.hid){const d=Date.now()-EX.hid;EX.exits.push(d);EX.away+=d;EX.hid=0}
 clearInterval(EX.iv);persist();
 $('#app').innerHTML='<section><p class="lead">جارٍ تسليم إجاباتك…</p></section>';
 const answers=EX.plan.map(q=>({id:q.id,vi:q.vi,a:EX.ans[q.id]===undefined?null:EX.ans[q.id],ms:EX.ms[q.id]||0}));
 const d=await sjson('/exam/submit',{code:EX.code,name:EX.name,attemptId:EX.attemptId,answers,log:{exits:EX.exits,away:EX.away,paste:EX.paste},reason});
 if(!d){EX.sub=false;$('#app').innerHTML='<section><div class="tip">تعذّر تسليم إجاباتك (تأكد من الإنترنت). إجاباتك محفوظة على جهازك.</div><button class="btn" data-retry="1">إعادة محاولة التسليم</button></section>';return}
 EX.done=true;clearEx();DN=d;V='done';render();
}
function viewDone(){
 const d=DN||{},r=EX&&EX.reason;
 const msg=r==='exits'?'أُنهي امتحانك لتجاوز عدد مرات الخروج المسموحة، وتم تسليم إجاباتك.':r==='time'?'انتهى الوقت، وتم تسليم إجاباتك.':'تم تسليم إجاباتك بنجاح.';
 $('#app').innerHTML=`<section><div class="hero g"><span class="ltr">✓</span><div><h2>تم التسليم</h2><p>${msg}</p></div></div>${d.score!==undefined?`<div class="card"><h3>درجتك</h3><div class="code">${d.score} / ${d.max}</div>${d.essayMax?`<p class="mu">الأسئلة المقالية (${d.essayMax} درجة) يصحّحها المعلم.</p>`:''}</div>`:'<p class="lead">ستظهر نتيجتك من معلمك.</p>'}<button class="btn" data-home="1">العودة للرئيسية</button></section>`;
}
