"use client"
import { useEffect, useState } from "react"

type Person={id:string;name:string;designation:string}
type Vertical={id:string;name:string;designation:string;people:Person[]}
type BU={id:string;name:string;lead:Person;design:Person;content:Person;accounts:Person[];designers:Person[];writers:Person[]}
type Data={founders:Person;finance:Vertical;mahima:Person;support:Vertical[];bus:BU[]}
const p=(id:string,name:string,designation=""):Person=>({id,name,designation})
const v=(id:string,name:string,people:Person[]=[]):Vertical=>({id,name,designation:"",people})
const makeBU=(i:number):BU=>({id:`bu${i}`,name:`BU${i}`,lead:p(`bu${i}-lead`,"BU Lead"),design:p(`bu${i}-design`,"CD – Design"),content:p(`bu${i}-content`,"CD – Content"),accounts:[],designers:[],writers:[]})
const seed:Data={founders:p("founders","Founders"),finance:v("finance","Finance"),mahima:p("mahima","Mahima","CBO"),support:[v("advisory","Advisory"),v("operations","Operations"),v("hr","HR")],bus:[1,2,3,4].map(makeBU)}
const STORAGE="zen-org-v3"

function Card({person,onEdit}:{person:Person;onEdit:(p:Person)=>void}){return <button className="card" onClick={()=>onEdit(person)}><strong>{person.name||"Name"}</strong>{person.designation&&<span>{person.designation}</span>}</button>}
function Add({label,onClick}:{label:string;onClick:()=>void}){return <button className="add" onClick={onClick}>+ {label}</button>}
function PersonList({people,onEdit,onAdd,label}:{people:Person[];onEdit:(p:Person)=>void;onAdd:()=>void;label:string}){return <div className="personList">{people.map(x=><Card key={x.id} person={x} onEdit={onEdit}/>) }<Add label={label} onClick={onAdd}/></div>}

export default function Home(){
 const [data,setData]=useState<Data>(seed);const [selected,setSelected]=useState<Person|null>(null)
 useEffect(()=>{const raw=localStorage.getItem(STORAGE);if(raw)try{setData(JSON.parse(raw))}catch{}},[])
 useEffect(()=>{localStorage.setItem(STORAGE,JSON.stringify(data))},[data])
 const edit=(x:Person)=>setSelected({...x})
 const replace=(d:Data,x:Person)=>({...d,founders:d.founders.id===x.id?x:d.founders,mahima:d.mahima.id===x.id?x:d.mahima,finance:{...d.finance,people:d.finance.people.map(a=>a.id===x.id?x:a)},support:d.support.map(s=>({...s,people:s.people.map(a=>a.id===x.id?x:a)})),bus:d.bus.map(b=>({...b,lead:b.lead.id===x.id?x:b.lead,design:b.design.id===x.id?x:b.design,content:b.content.id===x.id?x:b.content,accounts:b.accounts.map(a=>a.id===x.id?x:a),designers:b.designers.map(a=>a.id===x.id?x:a),writers:b.writers.map(a=>a.id===x.id?x:a)}))})
 const save=()=>{if(selected){setData(d=>replace(d,selected));setSelected(null)}}
 const addPerson=(where:string)=>setData(d=>{const x=p(`${where}-${Date.now()}`,where.includes("account")?"Account Manager":where.includes("designer")?"Designer":where.includes("writer")?"Content Writer":"Name");if(where==="finance")return {...d,finance:{...d.finance,people:[...d.finance.people,x]}};const m=where.match(/^(advisory|operations|hr)$/);if(m)return {...d,support:d.support.map(s=>s.id===m[1]?{...s,people:[...s.people,x]}:s)};return {...d,bus:multiply(d.bus,where,x)}})
 const multiply=(bus:BU[],where:string,x:Person)=>bus.map(b=>where===`${b.id}-accounts`?{...b,accounts:[...b.accounts,x]}:where===`${b.id}-designers`?{...b,designers:[...b.designers,x]}:where===`${b.id}-writers`?{...b,writers:[...b.writers,x]}:b)
 const editVertical=(id:string,name:string)=>setData(d=>id==="finance"?{...d,finance:{...d.finance,name}}:{...d,support:d.support.map(s=>s.id===id?{...s,name}:s)})
 return <main><header><div><h1>Zen-Sheet</h1><p>Organization Builder · click any card to edit</p></div><button className="reset" onClick={()=>{localStorage.removeItem(STORAGE);location.reload()}}>Reset</button></header>
 <section className="canvas"><div className="chart">
  <div className="topNode"><Card person={data.founders} onEdit={edit}/></div>
  <div className="topBranches">
   <div className="directReportRow">
    <section className="financeBranch"><div className="levelLabel">DIRECT REPORT</div><button className="verticalTitle" onClick={()=>editVertical("finance",data.finance.name)}>{data.finance.name}</button><PersonList people={data.finance.people} onEdit={edit} onAdd={()=>addPerson("finance")} label="Finance person"/></section>
    <section className="mahimaBranch"><div className="levelLabel">DIRECT REPORT</div><Card person={data.mahima} onEdit={edit}/></section>
   </div>
   <div className="mahimaChildren"><div className="mahimaConnector"/><div className="sevenLevel"><div className="line"/>{data.bus.map(b=><BUColumn key={b.id} b={b} onEdit={edit} onAdd={(k)=>addPerson(`${b.id}-${k}`)}/>)}{data.support.map(s=><SupportColumn key={s.id} s={s} onEdit={edit} onRename={()=>editVertical(s.id,s.name)} onAdd={()=>addPerson(s.id)}/>)}</div></div>
  </div>
 </div></section>
 {selected&&<div className="modal"><div className="dialog"><h2>Edit person</h2><label>Name<input autoFocus value={selected.name} onChange={e=>setSelected({...selected,name:e.target.value})}/></label><label>Designation<input value={selected.designation} onChange={e=>setSelected({...selected,designation:e.target.value})}/></label><div className="actions"><button onClick={()=>setSelected(null)}>Cancel</button><button className="save" onClick={save}>Save</button></div></div></div>}
 </main>
}

function BUColumn({b,onEdit,onAdd}:{b:BU;onEdit:(p:Person)=>void;onAdd:(k:"accounts"|"designers"|"writers")=>void}){return <article className="vertical buColumn"><h2>{b.name}</h2><div className="leaders"><Leader title="BU Lead" person={b.lead} onEdit={onEdit}/><Leader title="CD – Design" person={b.design} onEdit={onEdit}/><Leader title="CD – Content" person={b.content} onEdit={onEdit}/></div><div className="children"><Child title="Account Managers" people={b.accounts} onEdit={onEdit} onAdd={()=>onAdd("accounts")} label="Account Manager"/><Child title="Designers" people={b.designers} onEdit={onEdit} onAdd={()=>onAdd("designers")} label="Designer"/><Child title="Content Writers" people={b.writers} onEdit={onEdit} onAdd={()=>onAdd("writers")} label="Content Writer"/></div></article>}
function Leader({title,person,onEdit}:{title:string;person:Person;onEdit:(p:Person)=>void}){return <div className="leader"><h3>{title}</h3><Card person={person} onEdit={onEdit}/></div>}
function Child({title,people,onEdit,onAdd,label}:{title:string;people:Person[];onEdit:(p:Person)=>void;onAdd:()=>void;label:string}){return <div className="child"><h4>{title}</h4>{people.map(x=><Card key={x.id} person={x} onEdit={onEdit}/>) }<Add label={label} onClick={onAdd}/></div>}
function SupportColumn({s,onEdit,onRename,onAdd}:{s:Vertical;onEdit:(p:Person)=>void;onRename:()=>void;onAdd:()=>void}){return <article className="vertical supportColumn"><button className="verticalTitle" onClick={onRename}>{s.name}</button><PersonList people={s.people} onEdit={onEdit} onAdd={onAdd} label={`${s.name} person`}/></article>}
