const FILES = [
  { id:1, subject:'arabic', type:'sharh', ensub:null, kind:'pdf',
    titleAr:'الأسماء الخمسة — نحو (شرح)', titleEn:'The Five Nouns — Arabic Grammar',
    descAr:'ملف شرح تفاعلي', descEn:'Interactive lesson file',
    file:'files/asmaa-khamsa-PDF.pdf' },
  { id:2, subject:'english', type:'sharh', ensub:'grammar', kind:'pdf',
    titleAr:'Relative Clauses — جرامر (شرح)', titleEn:'Relative Clauses — Grammar',
    descAr:'شرح شامل + تريكات الامتحان', descEn:'Full lesson + exam tricks',
    file:'files/relative-clauses-PDF.pdf' },
  { id:3, subject:'history', type:'molakhas', ensub:null, kind:'pdf',
    titleAr:'ملخص الدرس الأول — تاريخ', titleEn:'Lesson 1 Summary — History',
    descAr:'ملف PDF عرض وتحميل', descEn:'PDF view and download',
    file:'files/summary-lesson1.pdf' },
  { id:4, subject:'english', type:'sharh', ensub:'vocab', kind:'pdf',
    titleAr:'كلمات الوحدة الأولى — إنجليزي', titleEn:'Unit 1 Vocabulary — English',
    descAr:'ملف PDF عرض وتحميل', descEn:'PDF view and download',
    file:'files/unit1-vocabulary.pdf' },
  { id:5, subject:'english', type:'sharh', ensub:'vocab', kind:'pdf',
    titleAr:'الدرس الأول إنجليزي — كلمات', titleEn:'English Lesson 1 — Vocabulary',
    descAr:'ملف PDF عرض وتحميل', descEn:'PDF view and download',
    file:'files/english lesson 1.pdf' },
];

const SUBJECTS = [
  { key:'arabic', ar:'عربي', en:'Arabic' },
  { key:'english', ar:'إنجليزي', en:'English' },
  { key:'history', ar:'تاريخ', en:'History' },
];
const TYPES = [
  { key:'sharh', ar:'شرح', en:'Lessons' },
  { key:'molakhas', ar:'ملخص', en:'Summary' },
  { key:'exam', ar:'امتحان', en:'Exam' },
];

let lang = 'ar';
let fSubject = 'all', fType = 'all', fEnsub = 'all', query = '';

const $ = s => document.querySelector(s);
const content = $('#content');

function t(ar,en){ return lang==='ar'?ar:en; }

function bindPills(id, cb){
  document.querySelectorAll(`#${id} button`).forEach(b=>{
    b.onclick = ()=>{
      document.querySelectorAll(`#${id} button`).forEach(x=>x.classList.remove('active'));
      b.classList.add('active'); cb(b);
    };
  });
}

bindPills('subjectPills', b=>{
  fSubject = b.dataset.subject;
  $('#enSubRow').hidden = !(fSubject==='all'||fSubject==='english');
  render();
});
bindPills('typePills', b=>{ fType=b.dataset.type; render(); });
bindPills('enSubPills', b=>{ fEnsub=b.dataset.ensub; render(); });

$('#search').addEventListener('input', e=>{ query=e.target.value.trim(); render(); });

$('#langBtn').onclick = ()=>{
  lang = lang==='ar'?'en':'ar';
  document.documentElement.lang = lang;
  document.documentElement.dir = lang==='ar'?'rtl':'ltr';
  $('#langBtn').textContent = lang==='ar'?'EN':'عربي';
  document.querySelectorAll('[data-ar]').forEach(el=>{ el.textContent = t(el.dataset.ar, el.dataset.en); });
  document.querySelectorAll('[data-ar-ph]').forEach(el=>{ el.placeholder = t(el.dataset.arPh, el.dataset.enPh); });
  document.querySelectorAll('#subjectPills button,#typePills button,#enSubPills button').forEach(b=>{
    // labels stored in data-ar/en already handled above
  });
  render();
};

function filtered(){
  return FILES.filter(f=>{
    if(fSubject!=='all' && f.subject!==fSubject) return false;
    if(fType!=='all' && f.type!==fType) return false;
    if(fEnsub!=='all' && f.ensub!==fEnsub) return false;
    if(query){
      const q=query.toLowerCase();
      const hay=(f.titleAr+' '+f.titleEn+' '+f.file).toLowerCase();
      if(!hay.includes(q)) return false;
    }
    return true;
  });
}

function render(){
  const list = filtered();
  $('#statFiles').textContent = FILES.length;
  content.innerHTML='';
  const subs = fSubject==='all'?SUBJECTS:SUBJECTS.filter(s=>s.key===fSubject);
  subs.forEach(s=>{
    const types = fType==='all'?TYPES:TYPES.filter(x=>x.key===fType);
    const box=document.createElement('section');
    box.className='subject';
    const count=list.filter(f=>f.subject===s.key).length;
    box.innerHTML=`<div class="subject-head"><h3>${t(s.ar,s.en)}</h3><span class="count">${count} ${t('ملفات','files')}</span></div>`;
    const g=document.createElement('div'); g.className='groups';
    types.forEach(tp=>{
      let items=list.filter(f=>f.subject===s.key&&f.type===tp.key);
      if(s.key==='english'&&tp.key==='sharh'&&fEnsub!=='all') items=items.filter(f=>f.ensub===fEnsub);
      const gd=document.createElement('div'); gd.className='group';
      gd.innerHTML=`<h4>${t(tp.ar,tp.en)}</h4>`;
      if(!items.length){
        gd.innerHTML+=`<div class="empty">${t('قريباً — سيتم إضافة ملفات هنا','Soon — files will be added here')}</div>`;
      }
      items.forEach(f=>{
        const badge = f.ensub==='grammar'?t('جرامر','Grammar'):f.ensub==='vocab'?t('كلمات','Vocab'):t(tp.ar,tp.en);
        const card=document.createElement('div'); card.className='card';
        card.innerHTML=`<span class="tag">${badge} • ${f.kind.toUpperCase()}</span>
          <h5>${t(f.titleAr,f.titleEn)}</h5>
          <p>${t(f.descAr,f.descEn)}</p>
          <div class="btns"></div>`;
        const btns=card.querySelector('.btns');
        const v=document.createElement('button'); v.className='btn gold'; v.textContent=t('عرض','View');
        v.onclick=()=>openViewer(f);
        btns.appendChild(v);
        if(f.kind==='pdf'){
          const d=document.createElement('a'); d.className='btn ghost'; d.textContent=t('تحميل','Download');
          d.href=f.file; d.download=''; btns.appendChild(d);
        } else {
          const o=document.createElement('a'); o.className='btn ghost'; o.textContent=t('فتح في تبويب','Open');
          o.href=f.file; o.target='_blank'; btns.appendChild(o);
        }
        gd.appendChild(card);
      });
      g.appendChild(gd);
    });
    box.appendChild(g);
    content.appendChild(box);
  });
}

function openViewer(f){
  $('#viewer').hidden=false;
  $('#viewerTitle').textContent=t(f.titleAr,f.titleEn);
  $('#viewerFrame').src=f.file;
  $('#viewerOpen').href=f.file;
  const dl=$('#viewerDownload');
  if(f.kind==='pdf'){ dl.style.display=''; dl.href=f.file; }
  else dl.style.display='none';
  document.querySelectorAll('#viewer [data-ar]').forEach(el=>{ el.textContent=t(el.dataset.ar,el.dataset.en); });
}
$('#viewerClose').onclick=()=>{ $('#viewer').hidden=true; $('#viewerFrame').src=''; };
$('#viewer').addEventListener('click',e=>{ if(e.target.id==='viewer') $('#viewerClose').onclick(); });

render();
