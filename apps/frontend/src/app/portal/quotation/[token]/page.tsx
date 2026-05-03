"use client";
import { useEffect, useState, useRef, use } from "react";
import SignatureCanvas from "react-signature-canvas";
import { format } from "date-fns";
import { CheckCircle, XCircle, Shield, Sparkles, ChevronDown, Hash, Calendar, Clock, MapPin, Phone, Mail, Building2, FileText, RotateCcw } from "lucide-react";
import { getTemplateData } from "./templateData";
import { t, type Lang } from "./translations";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const fmt = (n: number) => Number(n||0).toLocaleString(undefined,{minimumFractionDigits:3,maximumFractionDigits:3});

export default function P({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [d, setD] = useState<any>(null);
  const [loading, setL] = useState(true);
  const [lang, setLang] = useState<Lang|null>(null);
  const [modal, setModal] = useState<""|"accept"|"reject"|"revise">("");
  const [expandTerms, setET] = useState(false);
  const [af, setAF] = useState({acceptedByName:"",designation:"",email:"",phone:"",acceptanceNote:""});
  const [rf, setRF] = useState({rejectedByName:"",reason:"",note:""});
  const [revNote, setRevNote] = useState("");
  const sig = useRef<any>(null);

  useEffect(()=>{load()},[token]);
  const load = async()=>{try{const r=await fetch(`${API}/portal/quotations/${token}`);if(!r.ok)throw 0;setD(await r.json())}catch{setD(null)}finally{setL(false)}};
  const doAccept = async()=>{try{const s=sig.current?.isEmpty()?null:sig.current.getTrimmedCanvas().toDataURL("image/png");await fetch(`${API}/portal/quotations/${token}/accept`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...af,digitalSignatureData:s})});setModal("");load()}catch{alert("Failed")}};
  const doReject = async()=>{try{await fetch(`${API}/portal/quotations/${token}/reject`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(rf)});setModal("");load()}catch{alert("Failed")}};
  const doRevise = async()=>{try{await fetch(`${API}/portal/quotations/${token}/reject`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rejectedByName:"Customer",reason:"REVISION_REQUESTED",note:revNote})});setModal("");setRevNote("");load()}catch{alert("Failed")}};

  if(loading) return <div className="min-h-screen bg-[#050a0f] flex items-center justify-center"><div className="text-center"><div className="w-12 h-12 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"/><p className="mt-4 text-sky-300/60 text-sm tracking-widest">LOADING</p></div></div>;
  if(!d) return <div className="min-h-screen bg-[#050a0f] flex items-center justify-center p-6"><div className="text-center bg-white/5 border border-white/10 backdrop-blur p-8 rounded-2xl"><XCircle className="w-12 h-12 text-red-400 mx-auto mb-4"/><h2 className="text-xl font-bold text-white mb-2">Link Invalid</h2><p className="text-gray-400 text-sm">This quotation link is invalid or expired.</p></div></div>;

  // Language selector
  if(!lang) return (
    <div className="min-h-screen bg-[#050a0f] flex items-center justify-center p-6">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Montserrat:wght@700;800;900&family=Noto+Kufi+Arabic:wght@400;600;700;800&display=swap');
        @keyframes fu{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.an{animation:fu .5s ease-out forwards;opacity:0}.d1{animation-delay:.15s}.d2{animation-delay:.3s}
      `}</style>
      <div className="text-center max-w-sm w-full an">
        <img src="/octonics-logo.png" alt="Octonics" className="h-10 mx-auto mb-8 brightness-0 invert opacity-90"/>
        <h2 className="text-white text-xl font-bold mb-2" style={{fontFamily:"'Montserrat',sans-serif"}}>Choose Your Language</h2>
        <p className="text-gray-500 text-sm mb-8">اختر اللغة المفضلة</p>
        <div className="space-y-3">
          <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-base tracking-wide transition hover:opacity-90 active:scale-[0.98] an d1" onClick={()=>setLang("en")}>English</button>
          <button className="w-full py-4 rounded-2xl border border-white/10 bg-white/5 text-white font-semibold text-base tracking-wide transition hover:bg-white/10 active:scale-[0.98] an d2" style={{fontFamily:"'Noto Kufi Arabic',sans-serif"}} onClick={()=>setLang("ar")}>العربية</button>
        </div>
        <p className="text-[10px] text-gray-700 mt-8">Secure Document Portal</p>
      </div>
    </div>
  );

  const L = t(lang);

  const q=d.quotation, items=(q.items||[]).sort((a:any,b:any)=>a.sortOrder-b.sortOrder), terms=(q.terms||[]).sort((a:any,b:any)=>a.sortOrder-b.sortOrder);
  const canAct=q.status==="APPROVED"||q.status==="SENT_TO_CUSTOMER";
  const tpl = getTemplateData(q.serviceType?.slug || "it-infra", lang);
  const sMap:Record<string,[string,string]>={APPROVED:["bg-sky-500/20 text-sky-300 border-sky-500/30",L.statusApproved],SENT_TO_CUSTOMER:["bg-blue-500/20 text-blue-300 border-blue-500/30",L.statusPending],ACCEPTED:["bg-emerald-500/20 text-emerald-300 border-emerald-500/30",L.statusAccepted],REJECTED:["bg-red-500/20 text-red-300 border-red-500/30",L.statusRejected]};
  const [sCls,sLbl]=sMap[q.status]||["bg-gray-500/20 text-gray-300 border-gray-500/30",q.status];

  // Group items by section
  const sections:{title:string;items:any[]}[]=[];
  let cur:{title:string;items:any[]}={title:"General",items:[]};
  items.forEach((it:any)=>{if(it.itemType==="SECTION_HEADING"){if(cur.items.length||cur.title!=="General")sections.push(cur);cur={title:it.sectionTitle||"Section",items:[]};}else{cur.items.push(it);}});
  if(cur.items.length||cur.title!=="General")sections.push(cur);

  const inp="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:border-sky-500/50 focus:outline-none transition text-white placeholder-gray-600";

  return (
    <div className="min-h-screen text-white" dir={L.dir} style={{background:"#050a0f",fontFamily: lang==="ar" ? "'Noto Kufi Arabic','Inter',sans-serif" : "'Inter','Segoe UI',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Montserrat:wght@700;800;900&family=Noto+Kufi+Arabic:wght@400;500;600;700;800&display=swap');
        .pulse-dot{width:6px;height:6px;border-radius:50%;background:#38bdf8;animation:pg 2s infinite}@keyframes pg{0%,100%{box-shadow:0 0 0 0 rgba(56,189,248,0.4)}50%{box-shadow:0 0 0 8px rgba(56,189,248,0)}}
        .glow{height:1px;background:linear-gradient(90deg,transparent,rgba(56,189,248,0.5),transparent)}
        .glass{background:rgba(255,255,255,0.03);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.07)}
        @keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}.an{animation:fu .5s ease-out forwards;opacity:0}.d1{animation-delay:.1s}.d2{animation-delay:.2s}.d3{animation-delay:.3s}.d4{animation-delay:.4s}
        .modal-bg{animation:fi .2s}@keyframes fi{from{opacity:0}to{opacity:1}}.modal-s{animation:su .3s ease-out}@keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}}
      `}</style>

      {/* MODALS */}
      {modal==="accept"&&(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center modal-bg">
          <div className="bg-[#0c1a2e] rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-lg border border-white/10 max-h-[92vh] overflow-y-auto modal-s">
            <div className="flex items-center gap-2 mb-5"><div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-emerald-400"/></div><h2 className="text-lg font-semibold">{L.acceptTitle}</h2></div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3"><div><label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1">{L.name} *</label><input className={inp} value={af.acceptedByName} onChange={e=>setAF({...af,acceptedByName:e.target.value})}/></div><div><label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1">{L.designation}</label><input className={inp} value={af.designation} onChange={e=>setAF({...af,designation:e.target.value})}/></div></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1">{L.email}</label><input type="email" className={inp} value={af.email} onChange={e=>setAF({...af,email:e.target.value})}/></div><div><label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1">{L.phone}</label><input className={inp} value={af.phone} onChange={e=>setAF({...af,phone:e.target.value})}/></div></div>
              <div><label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1">{L.note}</label><textarea className={inp+" resize-none"} rows={2} value={af.acceptanceNote} onChange={e=>setAF({...af,acceptanceNote:e.target.value})}/></div>
              <div><div className="flex justify-between mb-1"><label className="text-[11px] text-gray-400 uppercase tracking-wider">{L.signature}</label><button className="text-sky-400 text-[11px]" onClick={()=>sig.current?.clear()}>{L.clear}</button></div><div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"><SignatureCanvas ref={sig} penColor="#38bdf8" backgroundColor="transparent" canvasProps={{className:"w-full h-28"}}/></div></div>
              <div className="flex gap-3 pt-2"><button className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-gray-400" onClick={()=>setModal("")}>{L.cancel}</button><button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-sm font-semibold disabled:opacity-40" onClick={doAccept} disabled={!af.acceptedByName}>{L.confirm}</button></div>
            </div>
          </div>
        </div>
      )}
      {modal==="reject"&&(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center modal-bg">
          <div className="bg-[#0c1a2e] rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-sm border border-white/10 modal-s">
            <div className="flex items-center gap-2 mb-5"><div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center"><XCircle className="w-4 h-4 text-red-400"/></div><h2 className="text-lg font-semibold">{L.rejectTitle}</h2></div>
            <div className="space-y-3">
              <div><label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1">{L.name} *</label><input className={inp} value={rf.rejectedByName} onChange={e=>setRF({...rf,rejectedByName:e.target.value})}/></div>
              <div><label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1">{L.reason}</label><select className={inp+" text-gray-300"} value={rf.reason} onChange={e=>setRF({...rf,reason:e.target.value})}><option value="" className="bg-[#0c1a2e]">{L.selectReason}</option><option value="PRICE_TOO_HIGH" className="bg-[#0c1a2e]">{L.reasonPriceHigh}</option><option value="WENT_WITH_COMPETITOR" className="bg-[#0c1a2e]">{L.reasonCompetitor}</option><option value="PROJECT_CANCELLED" className="bg-[#0c1a2e]">{L.reasonCancelled}</option><option value="OTHER" className="bg-[#0c1a2e]">{L.reasonOther}</option></select></div>
              <div><label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1">{L.note}</label><textarea className={inp+" resize-none"} rows={2} value={rf.note} onChange={e=>setRF({...rf,note:e.target.value})}/></div>
              <div className="flex gap-3 pt-2"><button className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-gray-400" onClick={()=>setModal("")}>{L.cancel}</button><button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-sm font-semibold disabled:opacity-40" onClick={doReject} disabled={!rf.rejectedByName}>{L.reject}</button></div>
            </div>
          </div>
        </div>
      )}
      {modal==="revise"&&(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center modal-bg">
          <div className="bg-[#0c1a2e] rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-sm border border-white/10 modal-s">
            <div className="flex items-center gap-2 mb-5"><div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center"><RotateCcw className="w-4 h-4 text-amber-400"/></div><h2 className="text-lg font-semibold">{L.reviseTitle}</h2></div>
            <div className="space-y-3">
              <div><label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1">{L.revisionDetails}</label><textarea className={inp+" resize-none"} rows={4} value={revNote} onChange={e=>setRevNote(e.target.value)}/></div>
              <div className="flex gap-3 pt-2"><button className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-gray-400" onClick={()=>setModal("")}>{L.cancel}</button><button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-semibold disabled:opacity-40" onClick={doRevise} disabled={!revNote}>{L.sendRequest}</button></div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SECTION 1: COVER ═══ */}
      <section className="relative overflow-hidden" style={{background:"linear-gradient(150deg,rgba(5,10,15,0.97),rgba(5,25,55,0.88),rgba(5,10,15,0.97))",minHeight:"85vh"}}>
        <div style={{position:"absolute",inset:0,opacity:0.04,backgroundImage:"linear-gradient(rgba(56,189,248,1) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,1) 1px, transparent 1px)",backgroundSize:"40px 40px"}}/>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"4px",background:"linear-gradient(90deg,#0369a1,#38bdf8,#0ea5e9,#38bdf8,#0369a1)"}}/>
        <div className="relative z-10 px-5 sm:px-8 pt-8 pb-6 max-w-2xl mx-auto flex flex-col justify-between" style={{minHeight:"85vh"}}>
          {/* Logo + Ref */}
          <div className="flex justify-between items-start an">
            <img src="/octonics-logo.png" alt="Octonics" className="h-8 sm:h-10 brightness-0 invert opacity-95"/>
            <div className="text-right"><div className="text-[9px] text-gray-600 tracking-[2px] uppercase">Reference</div><div className="text-sky-400 text-sm font-semibold mt-0.5">{q.quotationNumber}</div>{q.revisionNumber>0&&<div className="text-gray-600 text-[10px]">Rev. {q.revisionNumber}</div>}</div>
          </div>
          {/* Title */}
          <div className="flex-1 flex flex-col justify-center py-8 an d1">
            <span className={`${sCls} self-start text-[10px] font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5 mb-4`}><span className="pulse-dot"/>{sLbl}</span>
            <h1 className="text-3xl sm:text-5xl font-black leading-[1.05] tracking-tight" style={{fontFamily:"'Montserrat',sans-serif"}}>
              {q.serviceType?.name?.split(" ").map((w:string,i:number)=><span key={i}>{i===1?<span className="text-sky-400">{w}</span>:w}{" "}</span>)||"COMMERCIAL"} <br/><span className="text-sky-400">PROPOSAL</span>
            </h1>
            <div className="w-14 h-[3px] bg-gradient-to-r from-sky-700 to-sky-400 rounded-full mt-4 mb-3"/>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">{tpl.tagline}</p>
            {/* Cover Layers */}
            {tpl.coverLayers&&<div className="flex flex-wrap gap-1.5 mt-4">{tpl.coverLayers.map((l,i)=><div key={i} className="text-center px-2.5 py-1.5 glass rounded-lg"><div className="text-sm mb-0.5">{l.icon}</div><div className="text-[9px] text-gray-500">{l.label}</div></div>)}</div>}
            {q.projectTitle&&(<div className="mt-4 glass rounded-xl px-4 py-3 inline-block"><div className="text-[9px] text-gray-500 tracking-[2px] uppercase mb-1">Project</div><div className="text-white font-bold text-base">{q.projectTitle}</div>{q.projectLocation&&<div className="text-sky-400 text-xs mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3"/>{q.projectLocation}</div>}</div>)}
          </div>
          {/* Bottom Info */}
          <div className="border-t border-white/[0.07] pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 an d2">
            <div><div className="text-[9px] text-gray-600 tracking-[2px] uppercase mb-1">Prepared For</div><div className="text-white font-semibold text-sm">{q.customer?.displayName||"—"}</div>{q.customer?.companyName&&<div className="text-gray-400 text-xs">{q.customer.companyName}</div>}</div>
            <div className="hidden sm:block"><div className="text-[9px] text-gray-600 tracking-[2px] uppercase mb-1">Prepared By</div><div className="text-white font-semibold text-sm">{q.company?.name}</div></div>
            <div className="text-right"><div className="text-[9px] text-gray-600 tracking-[2px] uppercase mb-1">Date</div><div className="text-white font-semibold text-sm">{q.issueDate?format(new Date(q.issueDate),"dd MMM yyyy"):"—"}</div>{q.validUntil&&<div className="text-gray-500 text-[11px]">Valid until {format(new Date(q.validUntil),"dd MMM yyyy")}</div>}</div>
          </div>
          {/* Certifications */}
          <div className="flex items-center gap-2 mt-4 an d3">
            {[{label:"ISO 9001",sub:"Certified"},{label:"KNX",sub:"Partner"},{label:"RTi",sub:"Certified"},{label:"SIRA",sub:"Approved"}].map((c,i)=>(
              <div key={i} className="glass rounded-lg px-3 py-1.5 text-center">
                <div className="text-[11px] font-bold text-sky-400 leading-tight">{c.label}</div>
                <div className="text-[8px] text-gray-500 uppercase tracking-wider">{c.sub}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:"3px",background:"linear-gradient(90deg,#0369a1,#38bdf8,#0369a1)"}}/>
      </section>

      {/* ═══ SECTION 2: ABOUT / INTRODUCTION ═══ */}
      <section className="px-5 sm:px-8 py-8 max-w-2xl mx-auto" style={{background:"#f8fafc"}}>
        <div className="text-[10px] font-bold text-sky-600 tracking-[2px] uppercase mb-1">About Our Solution</div>
        <h2 className="text-lg sm:text-xl font-extrabold text-[#0f172a] mb-0.5" style={{fontFamily:"'Montserrat',sans-serif"}}>{tpl.aboutTitle}<br/><span className="text-sky-700">{tpl.aboutHighlight}</span></h2>
        <div className="w-12 h-[3px] bg-gradient-to-r from-sky-700 to-sky-400 rounded-full mb-4"/>
        <div className="bg-white rounded-xl p-4 border border-gray-200 border-l-4 border-l-sky-500 mb-4 space-y-2.5">{tpl.introParagraphs.map((p,i)=><p key={i} className="text-[13px] text-gray-600 leading-relaxed">{p}</p>)}</div>
        {/* Vendor badges */}
        <div className="flex flex-wrap gap-1.5 mb-5">{tpl.vendors.map(v=><span key={v} className="text-[11px] font-semibold px-2.5 py-1 rounded-md text-white" style={{background:"linear-gradient(135deg,#0c2340,#0369a1)"}}>{v}</span>)}</div>
        {/* Value cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">{tpl.valueCards.map((c,i)=><div key={i} className="bg-white rounded-xl p-3 border border-gray-200 border-t-[3px] border-t-sky-500"><div className="text-xl mb-1">{c.icon}</div><div className="font-bold text-[11px] text-[#0c2340] mb-1" style={{fontFamily:"'Montserrat',sans-serif"}}>{c.title}</div><div className="text-[11px] text-gray-500 leading-relaxed">{c.text}</div></div>)}</div>
      </section>

      {/* ═══ SECTION 3: INFRASTRUCTURE SCOPE ═══ */}
      <section className="px-5 sm:px-8 py-8 max-w-2xl mx-auto" style={{background:"#f8fafc"}}>
        <div className="text-[10px] font-bold text-sky-600 tracking-[2px] uppercase mb-1">Proposed Scope</div>
        <h2 className="text-lg sm:text-xl font-extrabold text-[#0f172a] mb-0.5" style={{fontFamily:"'Montserrat',sans-serif"}}>{tpl.scopeTitle} <span className="text-sky-700">{tpl.scopeHighlight}</span></h2>
        <div className="w-12 h-[3px] bg-gradient-to-r from-sky-700 to-sky-400 rounded-full mb-2"/>
        <p className="text-[13px] text-gray-500 mb-4">{tpl.scopeIntro}</p>
        <div className="space-y-3">{tpl.scopes.map(s=>(
          <div key={s.number} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2" style={{background:"linear-gradient(90deg,#0c1a2e,#0c2d50)"}}><span className="text-base">{s.icon}</span><span className="text-[10px] font-extrabold text-sky-400 bg-sky-400/10 px-1.5 py-0.5 rounded">{s.number}</span><span className="text-[12px] font-bold text-white tracking-wide" style={{fontFamily:"'Montserrat',sans-serif"}}>{s.title}</span></div>
            <div className="p-3"><p className="text-[12px] text-gray-600 mb-2 leading-relaxed">{s.intro}</p><div className="flex flex-wrap gap-1.5">{s.features.map((f,i)=><span key={i} className="text-[11px] text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">• {f}</span>)}</div></div>
          </div>
        ))}</div>
        {/* Deliverables */}
        <div className="mt-4 rounded-xl p-4" style={{background:"linear-gradient(135deg,#0c1a2e,#0c2d50)"}}>
          <div className="text-sky-400 text-[11px] font-bold tracking-[1.5px] uppercase mb-3">📦 Deliverables</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">{tpl.deliverables.map((d,i)=><div key={i} className="flex items-center gap-2 text-[12px] text-sky-100"><div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0"/>{d}</div>)}</div>
        </div>
      </section>

      {/* ═══ SECTION 4: PROJECT DETAILS ═══ */}
      {(q.requirementSummary||q.proposedSolution||q.scopeSummary)&&(
        <section className="px-5 sm:px-8 py-8 max-w-2xl mx-auto">
          <div className="text-[10px] font-bold text-sky-600 tracking-[2px] uppercase mb-1">Project Specific</div>
          <h2 className="text-xl font-extrabold mb-1" style={{fontFamily:"'Montserrat',sans-serif"}}>Project <span className="text-sky-400">Details</span></h2>
          <div className="w-9 h-[2px] bg-gradient-to-r from-sky-700 to-sky-400 rounded-full mb-5"/>
          <div className="space-y-4">
            {q.requirementSummary&&<div className="glass rounded-xl p-4"><div className="text-[10px] text-sky-400 font-semibold tracking-wider uppercase mb-2">Requirement</div><p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{q.requirementSummary}</p></div>}
            {q.scopeSummary&&<div className="glass rounded-xl p-4"><div className="text-[10px] text-sky-400 font-semibold tracking-wider uppercase mb-2">Scope of Work</div><p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{q.scopeSummary}</p></div>}
            {q.proposedSolution&&<div className="glass rounded-xl p-4"><div className="text-[10px] text-sky-400 font-semibold tracking-wider uppercase mb-2">Proposed Solution</div><p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{q.proposedSolution}</p></div>}
          </div>
        </section>
      )}
      <div className="glow max-w-2xl mx-auto"/>

      {/* ═══ SECTION 3: COMMERCIAL OFFER ═══ */}
      <section className="px-5 sm:px-8 py-8 max-w-2xl mx-auto an d3">
        <div className="text-[10px] font-bold text-sky-600 tracking-[2px] uppercase mb-1">Quotation Items</div>
        <h2 className="text-xl font-extrabold mb-1" style={{fontFamily:"'Montserrat',sans-serif"}}>Commercial <span className="text-sky-400">Quotation</span></h2>
        <div className="w-9 h-[2px] bg-gradient-to-r from-sky-700 to-sky-400 rounded-full mb-5"/>

        {sections.map((sec,si)=>(
          <div key={si} className="mb-4">
            {(sections.length>1||sec.title!=="General")&&<div className="text-xs font-bold text-sky-500 tracking-wide mb-2 flex items-center gap-2"><span className="w-1 h-4 bg-sky-500 rounded-full"/>{sec.title}</div>}
            <div className="space-y-2">
              {sec.items.map((it:any,ii:number)=>(
                <div key={it.id} className="glass rounded-xl p-3.5 hover:border-sky-500/20 transition-all">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2.5">
                        {it.image&&<img src={it.image} className="w-10 h-10 rounded-lg object-contain border border-white/10 bg-white/5 shrink-0 mt-0.5"/>}
                        <div className="min-w-0">
                          <p className="font-semibold text-[13px] text-white/90 leading-tight">{it.sectionTitle||it.description||"—"}</p>
                          {it.sectionTitle&&it.description&&<p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{it.description}</p>}
                          {it.warranty&&<p className="text-[10px] text-sky-400 mt-1 font-medium">✓ {it.warranty}</p>}
                          {it.isOptional&&<span className="inline-block text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full mt-1 font-semibold">OPTIONAL</span>}
                        </div>
                      </div>
                      <div className="flex gap-3 mt-2 text-[11px] text-gray-500">
                        <span>Qty: <span className="text-white/70 font-medium">{it.quantity}</span> {it.unit}</span>
                        <span>Price: <span className="text-white/70 font-medium">{fmt(it.unitPrice)}</span></span>
                        {it.product?.brand&&<span>Brand: <span className="text-white/70">{it.product.brand}</span></span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-sky-300">{fmt(it.lineTotal)}</p>
                      <p className="text-[10px] text-gray-600">{q.currency}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Section Summary */}
        {sections.length > 1 && (
          <div className="mt-6 glass rounded-xl overflow-hidden">
            <div className="px-4 py-2 border-b border-white/5"><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Section Summary</span></div>
            {sections.map((sec, si) => {
              const secTotal = sec.items.reduce((sum: number, it: any) => sum + (it.isOptional ? 0 : Number(it.lineTotal || 0)), 0);
              return (
                <div key={si} className="flex justify-between items-center px-4 py-2.5 border-b border-white/5 last:border-0 text-sm">
                  <span className="text-gray-400">{sec.title}</span>
                  <span className="font-semibold text-white">{fmt(secTotal)} <span className="text-[10px] text-gray-600">{q.currency}</span></span>
                </div>
              );
            })}
          </div>
        )}

        {/* Totals */}
        <div className={`${sections.length > 1 ? "mt-3" : "mt-6"} glass rounded-xl overflow-hidden`}>
          <div className="px-4 py-2 border-b border-white/5"><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Price Summary</span></div>
          {[{l:"Subtotal",v:fmt(q.subtotal),c:"text-white"},{l:"Discount",v:`- ${fmt(q.discountAmount)}`,c:"text-red-400",show:q.discountAmount>0},{l:"Tax",v:`+ ${fmt(q.taxAmount)}`,c:"text-gray-400",show:q.taxAmount>0}].filter(r=>r.show!==false).map(r=>(
            <div key={r.l} className="flex justify-between px-4 py-2.5 border-b border-white/5 text-sm"><span className="text-gray-500">{r.l}</span><span className={`font-medium ${r.c}`}>{r.v} <span className="text-[10px] text-gray-600">{q.currency}</span></span></div>
          ))}
          <div className="flex justify-between items-center px-4 py-4" style={{background:"linear-gradient(135deg,#0c1a2e,#0c2d50)"}}>
            <span className="text-xs font-bold tracking-wider uppercase">Grand Total</span>
            <span className="text-2xl sm:text-3xl font-black text-sky-400" style={{fontFamily:"'Montserrat',sans-serif"}}>{fmt(q.grandTotal)} <span className="text-sm font-semibold">{q.currency}</span></span>
          </div>
        </div>
        {q.amountInWords&&<p className="text-[11px] text-gray-600 italic mt-2 text-right">{q.amountInWords}</p>}
      </section>
      <div className="glow max-w-2xl mx-auto"/>

      {/* ═══ SECTION 4: TERMS ═══ */}
      {terms.length>0&&(
        <section className="px-5 sm:px-8 py-8 max-w-2xl mx-auto an d4">
          <button className="w-full flex items-center justify-between mb-4" onClick={()=>setET(!expandTerms)}>
            <div><div className="text-[10px] font-bold text-sky-600 tracking-[2px] uppercase mb-1">Legal</div><h2 className="text-xl font-extrabold" style={{fontFamily:"'Montserrat',sans-serif"}}>Terms & <span className="text-sky-400">Conditions</span></h2></div>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expandTerms?"rotate-180":""}`}/>
          </button>
          {expandTerms&&<div className="glass rounded-xl p-4 space-y-2.5">{terms.map((t:any,i:number)=><p key={t.id} className="text-[13px] text-gray-400 leading-relaxed"><span className="text-sky-400 font-semibold mr-1.5">{i+1}.</span>{t.content}</p>)}</div>}
        </section>
      )}

      {/* ═══ ACTION BUTTONS (end of page only) ═══ */}
      {canAct&&(
        <section className="px-5 sm:px-8 py-8 max-w-2xl mx-auto">
          <div className="glass rounded-2xl p-5 space-y-3">
            <button className="w-full py-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition flex items-center justify-center gap-2" onClick={()=>setModal("accept")}><CheckCircle className="w-4 h-4"/>{L.acceptBtn}</button>
            <button className="w-full py-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm font-medium hover:bg-amber-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2" onClick={()=>setModal("revise")}><RotateCcw className="w-4 h-4"/>{L.reviseBtn}</button>
            <button className="w-full py-3.5 rounded-xl border border-white/10 text-sm text-gray-400 font-medium hover:bg-white/5 active:scale-[0.98] transition flex items-center justify-center gap-2" onClick={()=>setModal("reject")}><XCircle className="w-4 h-4"/>{L.rejectBtn}</button>
          </div>
        </section>
      )}

      {/* Footer */}
      <div className="text-center py-6"><p className="text-[10px] text-gray-700 flex items-center justify-center gap-1"><Shield className="w-3 h-3"/>{L.footer}</p></div>
    </div>
  );
}
