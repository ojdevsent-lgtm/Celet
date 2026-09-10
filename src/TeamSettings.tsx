import React,{useEffect,useState} from 'react';
import {User} from 'firebase/auth';
import {addDoc,collection,deleteDoc,doc,getDoc,onSnapshot,serverTimestamp,updateDoc} from 'firebase/firestore';
import {Plus,Trash2,ShieldCheck,Users,Save,Settings as SettingsIcon} from 'lucide-react';
import {db} from './firebase';

type Member={id:string;name:string;email:string;role:'Admin'|'Manager'|'Staff';active?:boolean};
const roles:Member['role'][]=['Admin','Manager','Staff'];

export default function TeamSettings({user}:{user:User}){
  const [businessId,setBusinessId]=useState(''),[members,setMembers]=useState<Member[]>([]),[loading,setLoading]=useState(true),[name,setName]=useState(''),[currency,setCurrency]=useState('NGN'),[member,setMember]=useState({name:'',email:'',role:'Staff' as Member['role']}),[show,setShow]=useState(false),[saving,setSaving]=useState(false),[message,setMessage]=useState('');

  useEffect(()=>{
    if(!db)return;
    let stop=()=>{};
    (async()=>{
      const s=await getDoc(doc(db,'users',user.uid));
      const bid=s.data()?.businessId;
      if(!bid){setLoading(false);return}
      setBusinessId(bid);
      const b=await getDoc(doc(db,'businesses',bid));
      if(b.exists()){
        const d=b.data();
        setName(d.name||'');
        setCurrency(d.currency||'NGN');
      }
      stop=onSnapshot(collection(db,'businesses',bid,'staff'),snap=>{
        setMembers(snap.docs.map(x=>({id:x.id,...x.data()} as Member)));
        setLoading(false);
      },()=>setLoading(false));
    })().catch(()=>setLoading(false));
    return()=>stop();
  },[user.uid]);

  async function saveSettings(e:React.FormEvent){
    e.preventDefault();
    if(!db||!businessId||!name.trim())return;
    setSaving(true);setMessage('');
    try{
      await updateDoc(doc(db,'businesses',businessId),{name:name.trim(),currency,updatedAt:serverTimestamp()});
      await updateDoc(doc(db,'users',user.uid),{businessName:name.trim()});
      setMessage('Workspace settings saved.');
    }catch{setMessage('Could not save workspace settings.')}finally{setSaving(false)}
  }

  async function addMember(e:React.FormEvent){
    e.preventDefault();
    if(!db||!businessId||!member.name.trim()||!member.email.trim())return;
    setSaving(true);
    try{
      await addDoc(collection(db,'businesses',businessId,'staff'),{...member,name:member.name.trim(),email:member.email.trim().toLowerCase(),active:true,createdAt:serverTimestamp()});
      setMember({name:'',email:'',role:'Staff'});setShow(false);setMessage('Team member added to the workspace.');
    }catch{setMessage('Could not add team member.')}finally{setSaving(false)}
  }

  async function removeMember(id:string){
    if(!db||!businessId)return;
    if(!confirm('Remove this team member from the workspace?'))return;
    try{await deleteDoc(doc(db,'businesses',businessId,'staff',id));setMessage('Team member removed.')}catch{setMessage('Could not remove team member.')}
  }

  async function changeRole(id:string,role:Member['role']){
    if(!db||!businessId)return;
    try{await updateDoc(doc(db,'businesses',businessId,'staff',id),{role,updatedAt:serverTimestamp()});setMessage('Team role updated.')}catch{setMessage('Could not update team role.')}
  }

  return <section className="page"><div className="panelHead"><div><h3>Workspace settings</h3><p>Manage your business profile and team access.</p></div><SettingsIcon size={20}/></div><div className="settingsGrid"><form className="panel settingsCard" onSubmit={saveSettings}><div className="settingsTitle"><ShieldCheck size={18}/><div><b>Business profile</b><small>Workspace identity and billing currency</small></div></div><label>Business name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Business name" required/></label><label>Currency<select value={currency} onChange={e=>setCurrency(e.target.value)}><option value="NGN">NGN — Nigerian Naira</option><option value="USD">USD — US Dollar</option><option value="GBP">GBP — British Pound</option><option value="EUR">EUR — Euro</option></select></label><button className="primary" disabled={saving}><Save size={16}/>{saving?'Saving…':'Save workspace'}</button>{message&&<div className="success">{message}</div>}</form><div className="panel settingsCard"><div className="settingsTitle"><Users size={18}/><div><b>Team & permissions</b><small>Manage workspace staff records</small></div><button type="button" className="primary" onClick={()=>setShow(true)}><Plus size={15}/>Add member</button></div><div className="permissionNote"><ShieldCheck size={17}/><span><b>Owner controls</b> — Workspace changes are currently restricted to the business owner. Staff records are ready for future authenticated invitations.</span></div><div className="memberList">{loading?<div className="tableEmpty">Loading team…</div>:members.map(m=><div className="memberRow" key={m.id}><div className="memberAvatar">{(m.name||'U')[0].toUpperCase()}</div><div className="memberInfo"><b>{m.name}</b><small>{m.email}</small></div><select value={m.role} onChange={e=>changeRole(m.id,e.target.value as Member['role'])}>{roles.map(r=><option key={r}>{r}</option>)}</select><button type="button" className="rowButton" onClick={()=>removeMember(m.id)} title="Remove member"><Trash2 size={15}/></button></div>)}{!loading&&!members.length&&<div className="emptySmall">No additional team members yet.</div>}</div></div></div>{show&&<div className="modal"><form className="modalCard" onSubmit={addMember}><button type="button" className="close" onClick={()=>setShow(false)}>×</button><span className="eyebrow">TEAM ACCESS</span><h2>Add team member</h2><p>Add a staff record and assign its workspace role. Authentication invitations will be added in the secure team-account stage.</p><label>Name<input autoFocus value={member.name} onChange={e=>setMember(x=>({...x,name:e.target.value}))} placeholder="Full name" required/></label><label>Email<input type="email" value={member.email} onChange={e=>setMember(x=>({...x,email:e.target.value}))} placeholder="staff@business.com" required/></label><label>Role<select value={member.role} onChange={e=>setMember(x=>({...x,role:e.target.value as Member['role']}))}>{roles.map(r=><option key={r}>{r}</option>)}</select></label><button className="primary full" disabled={saving}>{saving?'Adding…':'Add team member'}</button></form></div>}</section>
}
