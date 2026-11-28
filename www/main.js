document.addEventListener('visibilitychange',()=>{document.hidden?onHide():onShow()});
['copy','cut','contextmenu'].forEach(t=>document.addEventListener(t,e=>{if(EX&&!EX.done)e.preventDefault()}));
document.addEventListener('paste',e=>{if(EX&&!EX.done){e.preventDefault();EX.paste++;toast('اللصق ممنوع أثناء الامتحان')}});
document.addEventListener('click',e=>{
 const T=e.target;
 const a=T.closest('[data-role]');
 if(a){S.role=a.dataset.role||null;V='';save();render();window.scrollTo(0,0);return}
 const b=T.closest('[data-view]');
 if(b){V=b.dataset.view;render();window.scrollTo(0,0);return}
 if(T.closest('[data-home]')){V='';EX=null;DN=null;render();window.scrollTo(0,0);return}
 if(T.closest('#add')){
  const name=$('#nm').value.trim();
  if(!name){toast('اكتب اسم الطالب أولًا');return}
  D.students.unshift({id:Date.now(),name,stage:+$('#stg').value,phone:$('#ph').value.trim()});
  saveD();$('#nm').value='';$('#ph').value='';listStudents();toast('تمت إضافة الطالب');return;
 }
 const d=T.closest('[data-del]');
 if(d){if(confirm('حذف هذا الطالب؟')){D.students=D.students.filter(s=>String(s.id)!==d.dataset.del);saveD();listStudents()}return}
 if(T.closest('#cam')){$('#fc').click();return}
 if(T.closest('#gal')){$('#fg').click();return}
 if(T.closest('#gen')){gen();return}
 if(T.closest('#sv')){if(CUR){D.lessons.unshift(Object.assign({},CUR,{id:Date.now()}));saveD();lessons();toast('تم حفظ التحضير')}return}
 if(T.closest('#sh')){share(CURT,CUR?CUR.title:'');return}
 const ld=T.closest('[data-ldel]');
 if(ld){if(confirm('حذف هذا التحضير؟')){D.lessons=D.lessons.filter(l=>String(l.id)!==ld.dataset.ldel);saveD();lessons()}return}
 const op=T.closest('[data-open]');
 if(op){const l=D.lessons.find(x=>String(x.id)===op.dataset.open);if(l){$('#sj').value=l.subject;$('#lg').value=l.lang;$('#lt').value=l.title||'';show(l)}return}
 /* الامتحانات: المعلم */
 const im=T.closest('[data-imp]');if(im){importLesson(im.dataset.imp);return}
 const qd=T.closest('[data-qd]');if(qd){B.qs.splice(+qd.dataset.qd,1);qlist();return}
 if(T.closest('#madd')){addManual();return}
 if(T.closest('#vgen')){genVariants();return}
 if(T.closest('#pub')){publish();return}
 const sc=T.closest('[data-sc]');if(sc){share('امتحان «'+sc.dataset.st+'» على تطبيق مدرسة ABC\nرمز الدخول: '+sc.dataset.sc,'رمز الامتحان');return}
 const xo=T.closest('[data-xo]');if(xo){RC=xo.dataset.xo;V='xres';render();window.scrollTo(0,0);return}
 if(T.closest('#oo')){const c=$('#oc').value.trim();if(!/^\d{6}$/.test(c)){toast('أدخل رمزًا من 6 أرقام');return}RC=c;V='xres';render();window.scrollTo(0,0);return}
 if(T.closest('[data-reload]')){loadRes();return}
 const dt=T.closest('[data-det]');if(dt){showDet(dt.dataset.det);return}
 if(T.closest('#xclose')){if(confirm('إغلاق الامتحان؟ لن يستطيع طلاب جدد الدخول.'))api('/exam/close',{code:RC}).then(r=>{if(r){toast('تم إغلاق الامتحان');loadRes()}});return}
 if(T.closest('#rshare')&&RD){
  share(RD.title+'\n'+AN.rows.map(o=>o.r.n+' | '+o.r.s+'/'+o.r.m+(o.r.e?' + مقالي '+o.r.e:'')+' | ثقة '+o.t).join('\n')+(AN.pairs.length?'\n\nتشابه مشتبه:\n'+AN.pairs.map(p=>p.a+' ↔ '+p.b+' ('+p.p+'%)').join('\n'):''),RD.title);return;
 }
 /* الامتحانات: الطالب */
 if(T.closest('#xgo')){joinExam();return}
 if(EX&&!EX.done){
  const q=EX.plan[EX.qi];
  const o=T.closest('[data-opt]');if(o){EX.ans[q.id]=+o.dataset.opt;persist();viewExam();return}
  const tf=T.closest('[data-tf]');if(tf){EX.ans[q.id]=tf.dataset.tf==='1';persist();viewExam();return}
  const nv=T.closest('[data-nav]');if(nv){flushTime();EX.qi=Math.max(0,Math.min(EX.plan.length-1,EX.qi+ +nv.dataset.nav));resumeTime();persist();viewExam();window.scrollTo(0,0);return}
  if(T.closest('#fin')){const un=EX.plan.filter(p=>EX.ans[p.id]===undefined||EX.ans[p.id]==='').length;if(confirm(un?'لديك '+un+' أسئلة بدون إجابة. تسليم الآن؟':'إنهاء الامتحان وتسليم إجاباتك؟'))submitExam('done');return}
  if(T.closest('[data-retry]')){submitExam(EX.reason||'done');return}
 }
 const m=T.closest('.row');
 if(m&&m.dataset.k){V=m.dataset.k;render();window.scrollTo(0,0);return}
 if(m&&m.dataset.t)toast('«'+m.dataset.t+'» تُضاف في المرحلة '+m.dataset.n+' من الخطة');
});
document.addEventListener('input',e=>{
 if(e.target.id==='q')listStudents();
 if(e.target.id==='es'&&EX&&!EX.done){EX.ans[EX.plan[EX.qi].id]=e.target.value;persist()}
 if(e.target.dataset&&e.target.dataset.pts!==undefined){const q=B.qs[+e.target.dataset.pts];if(q)q.pts=Math.max(1,Math.min(20,+e.target.value||1))}
});
document.addEventListener('change',e=>{
 if(e.target.id==='stage'){S.stage=+e.target.value;save()}
 if(e.target.id==='fs')listStudents();
 if(e.target.id==='fc'||e.target.id==='fg'){pick(e.target.files[0]);e.target.value=''}
 if(e.target.id==='mt'){const t=e.target.value;$('#mm').hidden=t!=='mcq';$('#mf').hidden=t!=='tf'}
});
render();
