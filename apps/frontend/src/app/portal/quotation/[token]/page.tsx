"use client";
import { useEffect, useState, useRef, use, type ReactNode } from "react";
import SignatureCanvas from "react-signature-canvas";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Shield, ChevronDown, MapPin, RotateCcw, Calendar, Building2, User, Check, Languages, X } from "lucide-react";
import { getTemplateData } from "./templateData";
import { t, type Lang } from "./translations";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const fmt = (n: number) => Number(n||0).toLocaleString(undefined,{minimumFractionDigits:3,maximumFractionDigits:3});
const day = (d?: string) => d ? format(new Date(d), "dd MMM yyyy") : "—";
const coverFor = (slug = "") => slug.includes("software") ? "/software-dev-cover.jpg" : slug.includes("home") ? "/smart-home-cover.jpg" : slug.includes("building") ? "/building-automation-cover.jpg" : "/it-infra-cover.jpg";

const Eyebrow = ({ children }: { children: ReactNode }) => <div className="text-[11px] font-semibold text-indigo-600 tracking-[0.18em] uppercase mb-2">{children}</div>;
const H2 = ({ a, b }: { a: string; b?: string }) => <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">{a} {b&&<span className="text-indigo-600">{b}</span>}</h2>;

function Sheet({ title, icon, onClose, children }: { title: string; icon: ReactNode; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm qp-fade" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92dvh] overflow-y-auto qp-up pb-[env(safe-area-inset-bottom)]" onClick={e=>e.stopPropagation()}>
        <div className="sm:hidden mx-auto mt-3 h-1.5 w-10 rounded-full bg-slate-200"/>
        <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-slate-100">
          {icon}<h2 className="text-lg font-semibold text-slate-900 flex-1">{title}</h2>
          <button aria-label="Close" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100" onClick={onClose}><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </div>
    </div>
  );
}

export default function P({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [d, setD] = useState<any>(null);
  const [loading, setL] = useState(true);
  const [busy, setBusy] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [modal, setModal] = useState<""|"accept"|"reject"|"revise">("");
  const [af, setAF] = useState({acceptedByName:"",designation:"",email:"",phone:"",acceptanceNote:""});
  const [rf, setRF] = useState({rejectedByName:"",reason:"",note:""});
  const [revNote, setRevNote] = useState("");
  const sig = useRef<any>(null);
  const L = t(lang);

  useEffect(()=>{ if(navigator.language?.startsWith("ar")) setLang("ar"); },[]);
  useEffect(()=>{load()},[token]);
  const load = async()=>{try{const r=await fetch(`${API}/portal/quotations/${token}`);if(!r.ok)throw 0;setD(await r.json())}catch{setD(null)}finally{setL(false)}};
  const post = async(path:string, body:any)=>{
    setBusy(true);
    try{const r=await fetch(`${API}/portal/quotations/${token}/${path}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});if(!r.ok)throw 0;setModal("");await load()}
    catch{alert(L.actionFailed)}finally{setBusy(false)}
  };
  const doAccept = ()=>post("accept",{...af,digitalSignatureData:sig.current?.isEmpty()?null:sig.current.getTrimmedCanvas().toDataURL("image/png")});
  const doReject = ()=>post("reject",rf);
  const doRevise = ()=>post("reject",{rejectedByName:"Customer",reason:"REVISION_REQUESTED",note:revNote}).then(()=>setRevNote(""));

  const font = lang==="ar" ? "'Noto Kufi Arabic','Inter',sans-serif" : "'Inter',system-ui,sans-serif";
  const styles = <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Kufi+Arabic:wght@400;500;600;700;800&display=swap');
    @keyframes qpf{from{opacity:0}to{opacity:1}}.qp-fade{animation:qpf .2s}
    @keyframes qpu{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}.qp-up{animation:qpu .3s ease-out}
    details>summary{list-style:none}details>summary::-webkit-details-marker{display:none}details[open] .qp-chev{transform:rotate(180deg)}`}</style>;

  if(loading) return <div className="min-h-dvh bg-slate-50 flex items-center justify-center"><div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>;
  if(!d) return (
    <div className="min-h-dvh bg-slate-50 flex items-center justify-center p-6" style={{fontFamily:font}}>{styles}
      <div className="text-center bg-white border border-slate-200 shadow-sm p-8 rounded-2xl max-w-sm"><XCircle className="w-12 h-12 text-rose-500 mx-auto mb-4"/><h2 className="text-xl font-bold text-slate-900 mb-2">{L.linkInvalid}</h2><p className="text-slate-500 text-sm">{L.linkInvalidText}</p></div>
    </div>
  );

  const q=d.quotation, items=[...(q.items||[])].sort((a:any,b:any)=>a.sortOrder-b.sortOrder), terms=[...(q.terms||[])].sort((a:any,b:any)=>a.sortOrder-b.sortOrder);
  const canAct=q.status==="APPROVED"||q.status==="SENT_TO_CUSTOMER";
  const slug=q.serviceType?.slug||"it-infra";
  const tpl=getTemplateData(slug, lang);
  const sMap:Record<string,[string,string]>={APPROVED:["bg-sky-50 text-sky-700 ring-sky-200",L.statusApproved],SENT_TO_CUSTOMER:["bg-indigo-50 text-indigo-700 ring-indigo-200",L.statusPending],ACCEPTED:["bg-emerald-50 text-emerald-700 ring-emerald-200",L.statusAccepted],REJECTED:["bg-rose-50 text-rose-700 ring-rose-200",L.statusRejected]};
  const [sCls,sLbl]=sMap[q.status]||["bg-slate-100 text-slate-700 ring-slate-200",q.status];

  // Group items by section
  const sections:{title:string;items:any[]}[]=[];
  let cur:{title:string;items:any[]}={title:"General",items:[]};
  items.forEach((it:any)=>{if(it.itemType==="SECTION_HEADING"){if(cur.items.length||cur.title!=="General")sections.push(cur);cur={title:it.sectionTitle||"Section",items:[]};}else{cur.items.push(it);}});
  if(cur.items.length||cur.title!=="General")sections.push(cur);
  const showSecTitles=sections.length>1||sections[0]?.title!=="General";

  const inp="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition";
  const lbl="block text-xs font-medium text-slate-600 mb-1.5";
  const card="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)]";
  const btnPrimary="w-full py-3.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none";
  const btnGhost="w-full py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 active:scale-[0.98] transition flex items-center justify-center gap-2";
  const cur$=<span className="text-[0.7em] font-medium text-slate-400 ms-1">{q.currency}</span>;

  const Summary = (
    <div className={`${card} overflow-hidden`}>
      <div className="px-5 pt-5 pb-3"><div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{L.priceSummary}</div></div>
      {showSecTitles&&sections.length>1&&<div className="px-5 pb-3 space-y-2 border-b border-slate-100">
        {sections.map((sec,si)=><div key={si} className="flex justify-between gap-3 text-sm"><span className="text-slate-500 truncate">{sec.title}</span><span className="text-slate-700 font-medium tabular-nums shrink-0">{fmt(sec.items.reduce((s:number,it:any)=>s+(it.isOptional?0:Number(it.lineTotal||0)),0))}</span></div>)}
      </div>}
      <div className="px-5 py-3 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-slate-500">{L.subtotal}</span><span className="font-medium text-slate-800 tabular-nums">{fmt(q.subtotal)}{cur$}</span></div>
        {q.discountAmount>0&&<div className="flex justify-between"><span className="text-slate-500">{L.discount}</span><span className="font-medium text-rose-600 tabular-nums">− {fmt(q.discountAmount)}{cur$}</span></div>}
        {q.taxAmount>0&&<div className="flex justify-between"><span className="text-slate-500">{L.tax}</span><span className="font-medium text-slate-800 tabular-nums">+ {fmt(q.taxAmount)}{cur$}</span></div>}
      </div>
      <div className="mx-3 mb-3 rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 px-4 py-4 text-white">
        <div className="text-[11px] uppercase tracking-wider text-indigo-100 font-semibold">{L.grandTotal}</div>
        <div className="text-2xl sm:text-3xl font-bold tabular-nums mt-0.5">{fmt(q.grandTotal)} <span className="text-sm font-medium text-indigo-100">{q.currency}</span></div>
        {q.amountInWords&&<div className="text-[11px] text-indigo-100/90 mt-1 leading-snug">{q.amountInWords}</div>}
      </div>
    </div>
  );

  const Actions = canAct ? (
    <div id="decision" className={`${card} p-5 space-y-3`}>
      <div><div className="font-semibold text-slate-900">{L.yourDecision}</div><p className="text-sm text-slate-500 mt-0.5">{L.decisionHint}</p></div>
      <button className={btnPrimary} onClick={()=>setModal("accept")}><CheckCircle2 className="w-4 h-4"/>{L.acceptBtn}</button>
      <div className="grid grid-cols-2 gap-2">
        <button className={btnGhost} onClick={()=>setModal("revise")}><RotateCcw className="w-4 h-4"/>{L.reviseBtn}</button>
        <button className={btnGhost+" hover:text-rose-600"} onClick={()=>setModal("reject")}><XCircle className="w-4 h-4"/>{L.rejectBtn}</button>
      </div>
    </div>
  ) : (q.status==="ACCEPTED"||q.status==="REJECTED") ? (
    <div className={`rounded-2xl p-5 flex items-start gap-3 ${q.status==="ACCEPTED"?"bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200":"bg-rose-50 text-rose-800 ring-1 ring-rose-200"}`}>
      {q.status==="ACCEPTED"?<CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5"/>:<XCircle className="w-5 h-5 shrink-0 mt-0.5"/>}
      <p className="text-sm font-medium">{q.status==="ACCEPTED"?L.acceptedMsg:L.rejectedMsg}</p>
    </div>
  ) : null;

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-800 antialiased" dir={L.dir} style={{fontFamily:font}}>
      {styles}

      {/* MODALS */}
      {modal==="accept"&&(
        <Sheet title={L.acceptTitle} onClose={()=>setModal("")} icon={<div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-600"/></div>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className={lbl}>{L.name} *</label><input className={inp} autoComplete="name" value={af.acceptedByName} onChange={e=>setAF({...af,acceptedByName:e.target.value})}/></div>
            <div><label className={lbl}>{L.designation}</label><input className={inp} autoComplete="organization-title" value={af.designation} onChange={e=>setAF({...af,designation:e.target.value})}/></div>
            <div><label className={lbl}>{L.email}</label><input type="email" inputMode="email" autoComplete="email" className={inp} value={af.email} onChange={e=>setAF({...af,email:e.target.value})}/></div>
            <div><label className={lbl}>{L.phone}</label><input type="tel" inputMode="tel" autoComplete="tel" className={inp} value={af.phone} onChange={e=>setAF({...af,phone:e.target.value})}/></div>
          </div>
          <div><label className={lbl}>{L.note}</label><textarea className={inp+" resize-none"} rows={2} value={af.acceptanceNote} onChange={e=>setAF({...af,acceptanceNote:e.target.value})}/></div>
          <div>
            <div className="flex justify-between items-baseline mb-1.5"><label className={lbl+" mb-0"}>{L.signature}</label><button className="text-indigo-600 text-xs font-medium" onClick={()=>sig.current?.clear()}>{L.clear}</button></div>
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden" dir="ltr"><SignatureCanvas ref={sig} penColor="#0f172a" backgroundColor="rgba(0,0,0,0)" canvasProps={{className:"w-full h-36 touch-none"}}/></div>
            <p className="text-[11px] text-slate-400 mt-1.5">{L.signHint}</p>
          </div>
          <div className="flex gap-3 pt-1"><button className={btnGhost} onClick={()=>setModal("")}>{L.cancel}</button><button className={btnPrimary+" bg-emerald-600! hover:bg-emerald-700!"} onClick={doAccept} disabled={!af.acceptedByName||busy}>{L.confirm}</button></div>
        </Sheet>
      )}
      {modal==="reject"&&(
        <Sheet title={L.rejectTitle} onClose={()=>setModal("")} icon={<div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center"><XCircle className="w-5 h-5 text-rose-600"/></div>}>
          <div><label className={lbl}>{L.name} *</label><input className={inp} autoComplete="name" value={rf.rejectedByName} onChange={e=>setRF({...rf,rejectedByName:e.target.value})}/></div>
          <div><label className={lbl}>{L.reason}</label><select className={inp} value={rf.reason} onChange={e=>setRF({...rf,reason:e.target.value})}><option value="">{L.selectReason}</option><option value="PRICE_TOO_HIGH">{L.reasonPriceHigh}</option><option value="WENT_WITH_COMPETITOR">{L.reasonCompetitor}</option><option value="PROJECT_CANCELLED">{L.reasonCancelled}</option><option value="OTHER">{L.reasonOther}</option></select></div>
          <div><label className={lbl}>{L.note}</label><textarea className={inp+" resize-none"} rows={3} value={rf.note} onChange={e=>setRF({...rf,note:e.target.value})}/></div>
          <div className="flex gap-3 pt-1"><button className={btnGhost} onClick={()=>setModal("")}>{L.cancel}</button><button className={btnPrimary+" bg-rose-600! hover:bg-rose-700!"} onClick={doReject} disabled={!rf.rejectedByName||busy}>{L.reject}</button></div>
        </Sheet>
      )}
      {modal==="revise"&&(
        <Sheet title={L.reviseTitle} onClose={()=>setModal("")} icon={<div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center"><RotateCcw className="w-5 h-5 text-amber-600"/></div>}>
          <div><label className={lbl}>{L.revisionDetails}</label><textarea className={inp+" resize-none"} rows={5} value={revNote} onChange={e=>setRevNote(e.target.value)}/></div>
          <div className="flex gap-3 pt-1"><button className={btnGhost} onClick={()=>setModal("")}>{L.cancel}</button><button className={btnPrimary+" bg-amber-500! hover:bg-amber-600!"} onClick={doRevise} disabled={!revNote||busy}>{L.sendRequest}</button></div>
        </Sheet>
      )}

      {/* TOP BAR */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center gap-3">
          <img src="/octonics-logo.png" alt="Octonics" className="h-7 sm:h-8 w-auto"/>
          <div className="flex-1"/>
          <div className="hidden sm:block text-end leading-tight"><div className="text-[10px] text-slate-400 uppercase tracking-wider">{L.reference}</div><div className="text-sm font-semibold text-slate-800">{q.quotationNumber}{q.revisionNumber>0&&<span className="text-slate-400 font-normal"> · {L.revision} {q.revisionNumber}</span>}</div></div>
          <button className="flex items-center gap-1.5 h-9 px-3 rounded-full border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={()=>setLang(lang==="en"?"ar":"en")} aria-label="Switch language">
            <Languages className="w-4 h-4"/><span style={{fontFamily:lang==="en"?"'Noto Kufi Arabic',sans-serif":undefined}}>{lang==="en"?"العربية":"English"}</span>
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-900">
        <img src={coverFor(slug)} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40"/>
        <div className="absolute inset-0 bg-linear-to-br from-slate-950/90 via-indigo-950/70 to-slate-900/40"/>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-24 sm:pt-16 sm:pb-32">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ring-1 ${sCls}`}><span className="w-1.5 h-1.5 rounded-full bg-current"/>{sLbl}</span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.1] max-w-3xl">{q.serviceType?.name||L.commercialTitle} <span className="text-indigo-300">{L.proposal}</span></h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">{tpl.tagline}</p>
          {q.projectTitle&&<div className="mt-5 inline-flex flex-col rounded-xl bg-white/10 backdrop-blur ring-1 ring-white/15 px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-slate-300">{L.project}</span><span className="text-white font-semibold">{q.projectTitle}</span>{q.projectLocation&&<span className="text-indigo-200 text-xs flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3"/>{q.projectLocation}</span>}</div>}
        </div>
      </section>

      {/* META STRIP (overlaps hero) */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 -mt-14 sm:-mt-20">
        <div className={`${card} shadow-lg shadow-slate-900/5 grid grid-cols-2 lg:grid-cols-4 divide-slate-100 *:p-4 sm:*:p-5`}>
          <div className="border-b lg:border-b-0 border-e border-slate-100"><div className="flex items-center gap-1.5 text-[11px] text-slate-400 uppercase tracking-wider"><User className="w-3.5 h-3.5"/>{L.preparedFor}</div><div className="mt-1 font-semibold text-slate-900 text-sm sm:text-base">{q.customer?.displayName||"—"}</div>{q.customer?.companyName&&<div className="text-xs text-slate-500">{q.customer.companyName}</div>}</div>
          <div className="border-b lg:border-b-0 lg:border-e border-slate-100"><div className="flex items-center gap-1.5 text-[11px] text-slate-400 uppercase tracking-wider"><Building2 className="w-3.5 h-3.5"/>{L.preparedBy}</div><div className="mt-1 font-semibold text-slate-900 text-sm sm:text-base">{q.company?.name}</div></div>
          <div className="border-e border-slate-100"><div className="flex items-center gap-1.5 text-[11px] text-slate-400 uppercase tracking-wider"><Calendar className="w-3.5 h-3.5"/>{L.date}</div><div className="mt-1 font-semibold text-slate-900 text-sm sm:text-base">{day(q.issueDate)}</div>{q.validUntil&&<div className="text-xs text-slate-500">{L.validUntil} {day(q.validUntil)}</div>}</div>
          <div><div className="text-[11px] text-slate-400 uppercase tracking-wider">{L.grandTotal}</div><div className="mt-1 font-bold text-indigo-600 text-base sm:text-lg tabular-nums">{fmt(q.grandTotal)}<span className="text-xs font-medium text-slate-400 ms-1">{q.currency}</span></div><div className="sm:hidden text-xs text-slate-400">{q.quotationNumber}</div></div>
        </div>
      </div>

      {/* BODY */}
      <main className={`max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 grid lg:grid-cols-[minmax(0,1fr)_340px] gap-8 lg:gap-10 items-start ${canAct?"pb-32 lg:pb-12":""}`}>
        <div className="space-y-12 min-w-0">

          {/* ABOUT */}
          <section>
            <Eyebrow>{L.aboutLabel}</Eyebrow>
            <H2 a={tpl.aboutTitle} b={tpl.aboutHighlight}/>
            <div className="mt-4 space-y-3 text-[15px] text-slate-600 leading-relaxed">{tpl.introParagraphs.map((p,i)=><p key={i}>{p}</p>)}</div>
            <div className="mt-6 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{L.technologies}</div>
            <div className="flex flex-wrap gap-2">{tpl.vendors.map(v=><span key={v} className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700">{v}</span>)}</div>
            <div className="mt-8 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{L.whyUs}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">{tpl.valueCards.map((c,i)=>(
              <div key={i} className={`${card} p-4 flex gap-3`}><div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-lg shrink-0">{c.icon}</div><div><div className="font-semibold text-sm text-slate-900">{c.title}</div><div className="text-[13px] text-slate-500 leading-relaxed mt-0.5">{c.text}</div></div></div>
            ))}</div>
          </section>

          {/* SCOPE */}
          <section>
            <Eyebrow>{L.scopeLabel}</Eyebrow>
            <H2 a={tpl.scopeTitle} b={tpl.scopeHighlight}/>
            <p className="mt-3 text-[15px] text-slate-600 leading-relaxed">{tpl.scopeIntro}</p>
            <div className="mt-5 space-y-2.5">{tpl.scopes.map((s,i)=>(
              <details key={s.number} open={i===0} className={`${card} group`}>
                <summary className="flex items-center gap-3 p-4 cursor-pointer select-none">
                  <span className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg shrink-0">{s.icon}</span>
                  <span className="flex-1 min-w-0"><span className="block text-[11px] font-bold text-indigo-600">{s.number}</span><span className="block font-semibold text-sm text-slate-900 leading-snug">{s.title}</span></span>
                  <ChevronDown className="qp-chev w-5 h-5 text-slate-400 transition-transform shrink-0"/>
                </summary>
                <div className="px-4 pb-4 sm:ps-17">
                  <p className="text-sm text-slate-600 leading-relaxed">{s.intro}</p>
                  <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">{s.features.map((f,j)=><li key={j} className="flex items-start gap-2 text-[13px] text-slate-700"><Check className="w-4 h-4 text-emerald-500 shrink-0 mt-px"/>{f}</li>)}</ul>
                </div>
              </details>
            ))}</div>
            <div className="mt-5 rounded-2xl bg-slate-900 text-white p-5 sm:p-6">
              <div className="text-sm font-semibold text-indigo-200 mb-3">{L.deliverables}</div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">{tpl.deliverables.map((x,i)=><li key={i} className="flex items-start gap-2 text-[13px] text-slate-200"><Check className="w-4 h-4 text-indigo-300 shrink-0 mt-px"/>{x}</li>)}</ul>
            </div>
          </section>

          {/* PROJECT DETAILS */}
          {(q.requirementSummary||q.proposedSolution||q.scopeSummary)&&(
            <section>
              <Eyebrow>{L.projectLabel}</Eyebrow>
              <H2 a={L.projectTitle} b={L.projectDetails}/>
              <div className="mt-5 space-y-3">
                {[[L.requirement,q.requirementSummary],[L.scopeOfWork,q.scopeSummary],[L.proposedSolution,q.proposedSolution]].filter(([,v])=>v).map(([k,v])=>(
                  <div key={k} className={`${card} p-5`}><div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">{k}</div><p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{v}</p></div>
                ))}
              </div>
            </section>
          )}

          {/* COMMERCIAL */}
          <section>
            <Eyebrow>{L.commercialLabel}</Eyebrow>
            <H2 a={L.commercialTitle} b={L.commercialHighlight}/>
            <div className="mt-5 space-y-6">
              {sections.map((sec,si)=>(
                <div key={si}>
                  {showSecTitles&&<div className="flex items-center gap-2 mb-2.5"><span className="w-1 h-4 rounded-full bg-indigo-500"/><span className="text-sm font-semibold text-slate-900">{sec.title}</span><span className="text-xs text-slate-400">· {sec.items.length} {L.items}</span></div>}

                  {/* Desktop table */}
                  <div className={`${card} overflow-hidden hidden md:block`}>
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                        <tr><th className="text-start font-semibold px-4 py-3 w-10">#</th><th className="text-start font-semibold px-4 py-3">{L.item}</th><th className="text-end font-semibold px-4 py-3">{L.qty}</th><th className="text-end font-semibold px-4 py-3">{L.unitPrice}</th><th className="text-end font-semibold px-4 py-3">{L.total}</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sec.items.map((it:any,i:number)=>(
                          <tr key={it.id} className="align-top hover:bg-slate-50/60">
                            <td className="px-4 py-3.5 text-slate-400 tabular-nums">{String(i+1).padStart(2,"0")}</td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-start gap-3">
                                {it.image&&<img src={it.image} alt="" className="w-10 h-10 rounded-lg object-contain border border-slate-200 bg-white shrink-0"/>}
                                <div className="min-w-0">
                                  <div className="font-medium text-slate-900">{it.sectionTitle||it.description||"—"}{it.isOptional&&<span className="ms-2 align-middle text-[10px] font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200 px-1.5 py-0.5 rounded">{L.optional}</span>}</div>
                                  {it.sectionTitle&&it.description&&<div className="text-[13px] text-slate-500 mt-0.5 leading-snug">{it.description}</div>}
                                  {it.warranty&&<div className="text-xs text-emerald-600 mt-1">✓ {it.warranty}</div>}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-end text-slate-700 tabular-nums whitespace-nowrap">{it.quantity} <span className="text-slate-400 text-xs">{it.unit}</span></td>
                            <td className="px-4 py-3.5 text-end text-slate-700 tabular-nums whitespace-nowrap">{fmt(it.unitPrice)}</td>
                            <td className="px-4 py-3.5 text-end font-semibold text-slate-900 tabular-nums whitespace-nowrap">{fmt(it.lineTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden space-y-2.5">
                    {sec.items.map((it:any)=>(
                      <div key={it.id} className={`${card} p-4`}>
                        <div className="flex items-start gap-3">
                          {it.image&&<img src={it.image} alt="" className="w-11 h-11 rounded-lg object-contain border border-slate-200 bg-white shrink-0"/>}
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-[15px] text-slate-900 leading-snug">{it.sectionTitle||it.description||"—"}</div>
                            {it.sectionTitle&&it.description&&<div className="text-[13px] text-slate-500 mt-1 leading-snug">{it.description}</div>}
                            {it.warranty&&<div className="text-xs text-emerald-600 mt-1">✓ {it.warranty}</div>}
                            {it.isOptional&&<span className="inline-block mt-1.5 text-[10px] font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200 px-1.5 py-0.5 rounded">{L.optional}</span>}
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-end justify-between gap-3">
                          <div className="text-xs text-slate-500 tabular-nums">{it.quantity} {it.unit} × {fmt(it.unitPrice)}</div>
                          <div className="font-semibold text-slate-900 tabular-nums">{fmt(it.lineTotal)}<span className="text-[11px] font-medium text-slate-400 ms-1">{q.currency}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 lg:hidden">{Summary}</div>
          </section>

          {/* TERMS */}
          {terms.length>0&&(
            <section>
              <Eyebrow>{L.termsLabel}</Eyebrow>
              <H2 a={L.termsTitle} b={L.termsHighlight}/>
              <details className={`${card} mt-5`}>
                <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer select-none text-sm font-medium text-slate-700">{terms.length} {L.termsTitle} {L.termsHighlight}<ChevronDown className="qp-chev w-5 h-5 text-slate-400 transition-transform"/></summary>
                <ol className="px-5 pb-5 space-y-3">{terms.map((tm:any,i:number)=><li key={tm.id} className="flex gap-3 text-sm text-slate-600 leading-relaxed"><span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold flex items-center justify-center shrink-0">{i+1}</span><span className="whitespace-pre-wrap">{tm.content}</span></li>)}</ol>
              </details>
            </section>
          )}

          {Actions&&<div className="lg:hidden">{Actions}</div>}
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden lg:block sticky top-24 space-y-4">
          {Summary}
          {Actions}
        </aside>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <span>{q.company?.name}{q.company?.phone&&` · ${q.company.phone}`}{q.company?.email&&` · ${q.company.email}`}</span>
          <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5"/>{L.footer}</span>
        </div>
      </footer>

      {/* Mobile sticky action bar */}
      {canAct&&(
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <div className="flex-1 min-w-0"><div className="text-[10px] uppercase tracking-wider text-slate-400">{L.grandTotal}</div><div className="font-bold text-slate-900 tabular-nums truncate">{fmt(q.grandTotal)} <span className="text-xs font-medium text-slate-400">{q.currency}</span></div></div>
            <button className="h-12 px-5 rounded-xl bg-indigo-600 text-white text-sm font-semibold active:scale-[0.98] transition flex items-center gap-2" onClick={()=>document.getElementById("decision")?.scrollIntoView({behavior:"smooth",block:"center"})}><CheckCircle2 className="w-4 h-4"/>{L.reviewAccept}</button>
          </div>
        </div>
      )}
    </div>
  );
}
