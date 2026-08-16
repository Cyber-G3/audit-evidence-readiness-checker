export const DOMAINS=[
 {id:"gov",name:"Governance & accountability",refs:{NIS2:"Arts. 20–21",ISO27001:"Clauses 5–6",SOC2:"CC1–CC2",AIACT:"Arts. 9, 17, 26"},evidence:["Approved policy or charter","Named accountable owner","Management review record"]},
 {id:"risk",name:"Risk management",refs:{NIS2:"Art. 21(2)(a)",ISO27001:"6.1.2–6.1.3",SOC2:"CC3",AIACT:"Art. 9"},evidence:["Current risk methodology","Risk register with treatment","Risk acceptance approvals"]},
 {id:"assets",name:"Scope, assets & systems",refs:{NIS2:"Art. 21",ISO27001:"4.3, A.5.9",SOC2:"CC2.3",AIACT:"Arts. 49, 72"},evidence:["Approved scope statement","Asset or system inventory","Ownership and classification"]},
 {id:"access",name:"Identity & access",refs:{NIS2:"Art. 21(2)(i)(j)",ISO27001:"A.5.15–A.5.18",SOC2:"CC6",AIACT:"Art. 15"},evidence:["Access control standard","Recent access review","MFA or privileged-access evidence"]},
 {id:"operations",name:"Secure operations & change",refs:{NIS2:"Art. 21(2)(e)",ISO27001:"A.8",SOC2:"CC7–CC8",AIACT:"Arts. 12, 15"},evidence:["Change records and approvals","Logging/monitoring evidence","Vulnerability remediation samples"]},
 {id:"incident",name:"Incident management",refs:{NIS2:"Arts. 21(2)(b), 23",ISO27001:"A.5.24–A.5.28",SOC2:"CC7.3–CC7.5",AIACT:"Arts. 73–74"},evidence:["Tested incident procedure","Incident register and decisions","Exercise or lessons-learned record"]},
 {id:"continuity",name:"Continuity & resilience",refs:{NIS2:"Art. 21(2)(c)",ISO27001:"A.5.29–A.5.30",SOC2:"A1",AIACT:"Art. 15"},evidence:["BIA and continuity plans","Backup/restore test","Exercise and corrective actions"]},
 {id:"supplier",name:"Supplier assurance",refs:{NIS2:"Art. 21(2)(d)",ISO27001:"A.5.19–A.5.23",SOC2:"CC9.2",AIACT:"Arts. 25, 28"},evidence:["Supplier inventory and tiering","Due-diligence samples","Contract and monitoring evidence"]},
 {id:"people",name:"People & awareness",refs:{NIS2:"Arts. 20, 21(2)(g)",ISO27001:"A.6",SOC2:"CC1.4",AIACT:"Art. 4"},evidence:["Role-based training record","Completion and exception report","Competence or awareness test"]},
 {id:"assurance",name:"Testing & assurance",refs:{NIS2:"Art. 21(2)(f)",ISO27001:"9.2–10.2",SOC2:"CC4",AIACT:"Arts. 9, 17"},evidence:["Audit or control test plan","Test samples and conclusions","Findings and remediation tracker"]}
];

const ES={
 "Governance & accountability":"Gobernanza y responsabilidad","Risk management":"Gestión de riesgos","Scope, assets & systems":"Alcance, activos y sistemas","Identity & access":"Identidad y accesos","Secure operations & change":"Operaciones seguras y cambios","Incident management":"Gestión de incidentes","Continuity & resilience":"Continuidad y resiliencia","Supplier assurance":"Aseguramiento de proveedores","People & awareness":"Personas y concienciación","Testing & assurance":"Pruebas y aseguramiento",
 "Control implementation is not complete":"La implementación del control no está completa","Evidence is missing or not sufficiently reliable":"La evidencia falta o no es suficientemente fiable","Evidence is missing or outside the review period":"La evidencia falta o está fuera del periodo de revisión","No accountable owner recorded":"No se ha registrado un responsable","Operating effectiveness has not been tested":"La eficacia operativa no ha sido probada",
 "Audit-ready with targeted validation":"Preparado para auditoría con validación específica","Conditionally ready":"Preparación condicionada","Material remediation required":"Requiere remediación material","Not audit-ready":"No preparado para auditoría"
};
export const translate=value=>ES[value]||value;

const weights={none:0,planned:.25,partial:.55,implemented:.8,assured:1};
const quality={none:0,weak:.35,adequate:.7,strong:1};
const freshness={missing:0,stale:.35,current:1};

export function assess(input,now=new Date()){
 const es=input.lang==="es";
 const rows=DOMAINS.map(domain=>{
  const value=input.assessments?.[domain.id]||{};
  const implementation=weights[value.maturity]??0;
  const evidence=quality[value.quality]??0;
  const recent=freshness[value.freshness]??0;
  const ownership=value.owner?.trim()?1:0;
  const tested=value.tested===true?1:0;
  const score=Math.round((implementation*.3+evidence*.3+recent*.15+ownership*.1+tested*.15)*100);
  const gaps=[];
  if(implementation<.8)gaps.push("Control implementation is not complete");
  if(evidence<.7)gaps.push("Evidence is missing or not sufficiently reliable");
  if(recent<1)gaps.push("Evidence is missing or outside the review period");
  if(!ownership)gaps.push("No accountable owner recorded");
  if(!tested)gaps.push("Operating effectiveness has not been tested");
  const priority=score<40?"critical":score<65?"high":score<80?"medium":"monitor";
  return {...domain,name:es?translate(domain.name):domain.name,score,priority,gaps:es?gaps.map(translate):gaps,value};
 });
 const score=Math.round(rows.reduce((s,r)=>s+r.score,0)/rows.length);
 const coverage=Math.round(rows.filter(r=>r.value.quality&&r.value.quality!=="none").length/rows.length*100);
 const tested=Math.round(rows.filter(r=>r.value.tested).length/rows.length*100);
 const owned=Math.round(rows.filter(r=>r.value.owner?.trim()).length/rows.length*100);
 let readiness=score>=80?"Audit-ready with targeted validation":score>=65?"Conditionally ready":score>=40?"Material remediation required":"Not audit-ready";if(es)readiness=translate(readiness);
 const findings=rows.filter(r=>r.gaps.length).sort((a,b)=>a.score-b.score);
 return {score,coverage,tested,owned,readiness,rows,findings,generatedAt:now.toISOString()};
}

export function markdown(input,result){
 if(input.lang==="es"){const lines=["# Registro de preparación de evidencias de auditoría","",`Organización: ${input.organisation||"No indicada"}`,`Marco: ${input.framework}`,`Fecha de evaluación: ${result.generatedAt}`,`Puntuación global: ${result.score}%`,`Conclusión: ${result.readiness}`,"",`Cobertura de evidencias: ${result.coverage}% | Probados: ${result.tested}% | Con responsable: ${result.owned}%`,"","## Resultados por dominio"];result.rows.forEach(r=>lines.push(`### ${r.name} — ${r.score}% (${r.priority})`,`Referencia: ${r.refs[input.framework]}`,`Responsable: ${r.value.owner||"No asignado"}`,`Brechas: ${r.gaps.join("; ")||"Sin brechas materiales en este análisis"}`,""));lines.push("## Remediación prioritaria",...result.findings.slice(0,8).map((r,i)=>`${i+1}. **${r.name}:** ${r.gaps.join("; ")}.`),"","_Herramienta de apoyo a decisiones. Valide alcance, muestreo y criterios específicos con un profesional cualificado._");return lines.join("\n")}
 const lines=["# Audit Evidence Readiness Record","",`Organisation: ${input.organisation||"Not provided"}`,`Framework: ${input.framework}`,`Assessment date: ${result.generatedAt}`,`Overall score: ${result.score}%`,`Conclusion: ${result.readiness}`,"",`Evidence coverage: ${result.coverage}% | Tested: ${result.tested}% | Owned: ${result.owned}%`,"","## Domain results"];
 result.rows.forEach(r=>lines.push(`### ${r.name} — ${r.score}% (${r.priority})`,`Reference: ${r.refs[input.framework]}`,`Owner: ${r.value.owner||"Not assigned"}`,`Gaps: ${r.gaps.join("; ")||"No material screening gaps"}`,""));
 lines.push("## Priority remediation",...result.findings.slice(0,8).map((r,i)=>`${i+1}. **${r.name}:** ${r.gaps.join("; ")}.`),"","_Decision-support screening only. Validate scope, sampling and framework-specific criteria with a qualified professional._");return lines.join("\n");
}
