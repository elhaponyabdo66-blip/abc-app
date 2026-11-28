/* ---------- محضّر الدروس ---------- */
function wrap(s,n){
 const w=String(s).split(/\s+/),L=[''];
 for(const x of w){const c=L[L.length-1],j=(c+' '+x).trim();if(j.length<=n)L[L.length-1]=j;else L.push(x)}
 if(L.length>2){L.length=2;L[1]=L[1].slice(0,n-1)+'…'}
 return L;
}
function flow(nodes){
 const H=46,G=26,W=300;let y=4,s='';
 nodes.forEach((t,i)=>{
  const ls=wrap(t,34),pill=i===0||i===nodes.length-1;
  s+=`<rect x="10" y="${y}" width="${W-20}" height="${H}" rx="${pill?23:8}"/>`;
  ls.forEach((l,j)=>{s+=`<text x="${W/2}" y="${y+(ls.length>1?20+j*15:28)}" text-anchor="middle">${esc(l)}</text>`});
  if(i<nodes.length-1){const a=y+H;s+=`<line x1="${W/2}" y1="${a}" x2="${W/2}" y2="${a+G-6}"/><polygon points="${W/2-5},${a+G-8} ${W/2+5},${a+G-8} ${W/2},${a+G-1}"/>`}
  y+=H+G;
 });
 return `<svg class="fc" viewBox="0 0 ${W} ${y-G+4}" role="img" aria-label="مخطط انسيابي">${s}</svg>`;
}
function makePrompt(L){
 const sj=SUBJ[L.subject],lang={ar:'العربية',en:'English',both:'العربية مع إبقاء المصطلحات الإنجليزية كما هي'}[L.lang];
 return `أنت خبير تربوي ومعلم متمرس في منهج دولة ليبيا. حضّر درسًا للمعلم.
المادة: ${sj[0]} (${sj[1]}). الصف: ${STAGES[S.stage]}. ${L.title?'عنوان الدرس: '+L.title+'.':''}
${L.text?'نص الدرس:\n'+L.text:'محتوى الدرس موجود في الصورة المرفقة (صفحة من الكتاب المدرسي). اقرأها بعناية بما فيها الجداول والأمثلة.'}
اعتمد على محتوى الدرس فقط، ولا تضف معلومات غير موجودة فيه إلا للتوضيح البسيط، وكن دقيقًا علميًا ولغويًا، واجعل المستوى مناسبًا للصف.
لغة التحضير: ${lang}.
أعد JSON فقط بهذا الشكل بالضبط:
{"title":"","objectives":["3 إلى 5 أهداف سلوكية قابلة للقياس"],"intro":["2 أو 3 أفكار للتمهيد"],"concepts":[{"term":"","meaning":""}],"explanation":["خطوات الشرح بالترتيب، 4 إلى 8"],"activities":["2 إلى 4 أنشطة مناسبة للمادة"],"questions":{"mcq":[{"q":"","options":["","","",""],"answer":0}],"tf":[{"q":"","answer":true}],"essay":[""]},"flow":["5 إلى 8 مراحل قصيرة (أقل من 8 كلمات) لمخطط انسيابي يلخص تسلسل الدرس"],"summary":["2 إلى 4 نقاط ملخص"]}
عدد الأسئلة: 4 اختيار من متعدد (answer هو رقم الخيار الصحيح من 0 إلى 3)، و3 صح وخطأ، و2 مقالية. إن تعذّرت قراءة الصورة أعد {"error":"السبب"}.`;
}
function planHTML(p,sj){
 const li=a=>(a||[]).map(x=>`<li dir="auto">${esc(x)}</li>`).join('');
 const q=p.questions||{};
 const cn=(p.concepts||[]).map(c=>`<li dir="auto"><b>${esc(c.term)}</b>: ${esc(c.meaning)}</li>`).join('');
 const mcq=(q.mcq||[]).map(m=>`<li dir="auto">${esc(m.q)}<ol type="a">${(m.options||[]).map((o,i)=>`<li${i===m.answer?' class="ok"':''}>${esc(o)}</li>`).join('')}</ol></li>`).join('');
 const tf=(q.tf||[]).map(m=>`<li dir="auto">${esc(m.q)} <span class="mu">(${m.answer?'صح':'خطأ'})</span></li>`).join('');
 return `<div class="card"><h3 dir="auto">${esc(p.title)}</h3><p class="mu">${sj[0]} — ${sj[1]} · ${STAGES[S.stage]}</p>
 <h4>الأهداف</h4><ul>${li(p.objectives)}</ul><h4>التمهيد</h4><ul>${li(p.intro)}</ul>
 <h4>المفاهيم الأساسية</h4><ul>${cn}</ul><h4>الشرح</h4><ol>${li(p.explanation)}</ol>
 <h4>الأنشطة</h4><ul>${li(p.activities)}</ul>
 <h4>أسئلة اختيار من متعدد</h4><ol>${mcq}</ol><p class="mu">الإجابة الصحيحة باللون الأخضر.</p>
 <h4>صح أم خطأ</h4><ol>${tf}</ol><h4>أسئلة مقالية</h4><ol>${li(q.essay)}</ol>
 <h4>الملخص</h4><ul>${li(p.summary)}</ul>
 <h4>مخطط انسيابي</h4>${flow((p.flow||[]).slice(0,8))}</div>`;
}
function planTxt(p,sj){
 const q=p.questions||{},L=(h,a)=>['',h,...(a||[]).map((x,i)=>(i+1)+'. '+x)];
 return [p.title,sj[0]+' - '+sj[1]+' - '+STAGES[S.stage],
  ...L('الأهداف',p.objectives),...L('التمهيد',p.intro),
  ...L('المفاهيم',(p.concepts||[]).map(c=>c.term+': '+c.meaning)),
  ...L('الشرح',p.explanation),...L('الأنشطة',p.activities),
  ...L('اختيار من متعدد',(q.mcq||[]).map(m=>m.q+' | '+(m.options||[]).map((o,i)=>String.fromCharCode(97+i)+') '+o).join('  ')+' | الإجابة: '+String.fromCharCode(97+(m.answer||0)))),
  ...L('صح أم خطأ',(q.tf||[]).map(m=>m.q+' ('+(m.answer?'صح':'خطأ')+')')),
  ...L('أسئلة مقالية',q.essay),...L('الملخص',p.summary),...L('مخطط الدرس',p.flow)].join('\n');
}
function viewLesson(){
 IMG=null;
 $('#app').innerHTML=`<section><button class="link" data-view="" style="margin:0 0 10px">→ رجوع</button>
 <h2>محضّر الدروس</h2><p class="lead" style="margin-bottom:6px">صوّر صفحة الدرس، وسيجهّز الذكاء الاصطناعي تحضيرًا كاملًا.</p>
 <p class="mu" id="lf">${leftText()}</p>
 <label class="fld">المادة<select id="sj">${SUBJ.map((s,i)=>`<option value="${i}">${s[0]} — ${s[1]}</option>`).join('')}</select></label>
 <label class="fld">لغة التحضير<select id="lg"><option value="ar">عربي</option><option value="en">English</option><option value="both">عربي + مصطلحات English</option></select></label>
 <label class="fld">عنوان الدرس (اختياري)<input id="lt" type="text" placeholder="مثال: الزمن الماضي البسيط" autocomplete="off"></label>
 <div class="two"><button class="btn b2" id="cam">📷 تصوير</button><button class="btn b2" id="gal">🖼️ من المعرض</button></div>
 <input id="fc" type="file" accept="image/*" capture="environment" hidden><input id="fg" type="file" accept="image/*" hidden>
 <img id="pv" alt="صفحة الدرس" hidden>
 <p class="mu" id="pg"></p>
 <label class="fld">أو اكتب/الصق نص الدرس (اختياري)<textarea id="tx" rows="5" dir="auto" placeholder="يمكنك الاكتفاء بالصورة."></textarea></label>
 ${codeField()}
 <button class="btn" id="gen">حضّر الدرس</button>
 <div id="out"></div>
 <h3>تحضيراتي المحفوظة</h3><div class="list" id="ls"></div></section>`;
 lessons();
}
function lessons(){
 $('#ls').innerHTML=D.lessons.length?D.lessons.map(l=>`<div class="row st" data-open="${l.id}" style="cursor:pointer"><span class="bd">${esc((l.title||'؟')[0])}</span><span class="tx"><strong>${esc(l.title)}</strong><small>${SUBJ[l.subject]?SUBJ[l.subject][0]:''}</small></span><button class="del" data-ldel="${l.id}" aria-label="حذف التحضير">✕</button></div>`).join(''):'<p class="mu">لا توجد تحضيرات محفوظة بعد.</p>';
}
function show(L){
 CUR=L;CURT=planTxt(L.plan,SUBJ[L.subject]);
 $('#out').innerHTML=planHTML(L.plan,SUBJ[L.subject])+'<div class="two"><button class="btn b2" id="sv">💾 حفظ</button><button class="btn b2" id="sh">📤 نسخ / مشاركة</button></div>';
 $('#out').scrollIntoView({behavior:'smooth'});
}
const TIPS='نصيحة: صوّر الصفحة بإضاءة جيدة وبشكل مستقيم من الأعلى بدون ظل أو انعكاس، وركّز على الدرس نفسه (جزء واحد من الصفحة أفضل من صفحة مزدحمة)، أو اكتب النص في الخانة أسفل الصورة.';
async function gen(){
 const L={title:$('#lt').value.trim(),subject:+$('#sj').value,lang:$('#lg').value,text:$('#tx').value.trim()};
 if(!IMG&&!L.text){toast('صوّر صفحة الدرس أو اكتب نصه أولًا');return}
 const b=$('#gen'),pg=$('#pg');b.disabled=true;b.textContent='جارٍ التحضير…';pg.textContent='';
 try{
  const p=await ai(makePrompt(L),IMG);
  if(!p)return;
  if(p.error){pg.innerHTML='<div class="tip">تعذّرت قراءة الصورة: '+esc(p.error)+'<br>'+esc(TIPS)+'</div>';toast('تعذّرت قراءة الصورة');return}
  show({title:p.title||L.title||'درس',subject:L.subject,lang:L.lang,plan:p});
 }finally{b.disabled=false;b.textContent='حضّر الدرس'}
}
const shrink=f=>new Promise((ok,no)=>{const u=URL.createObjectURL(f),i=new Image();i.onload=()=>{const k=Math.min(1,1600/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=Math.round(i.width*k);c.height=Math.round(i.height*k);c.getContext('2d').drawImage(i,0,0,c.width,c.height);URL.revokeObjectURL(u);ok(c.toDataURL('image/jpeg',.85))};i.onerror=no;i.src=u});
async function pick(f){
 if(!f)return;
 try{const u=await shrink(f);IMG=u.split(',')[1];const p=$('#pv');p.src=u;p.hidden=false;$('#pg').textContent='تم اختيار الصورة. اضغط «حضّر الدرس».'}
 catch(e){toast('تعذّر فتح الصورة')}
}
async function share(txt,title){
 try{if(navigator.share){await navigator.share({title,text:txt});return}}catch(e){if(e.name==='AbortError')return}
 try{await navigator.clipboard.writeText(txt);toast('تم النسخ')}catch(e){toast('تعذّر النسخ')}
}
