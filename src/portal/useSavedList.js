import {useEffect,useRef,useState} from 'react';
import {getPreference,savePreference} from './preferences.js';

// Editing starts only after a successful account read. A failed read must never
// turn an empty/default list into a replacement for an existing saved list.
export function useSavedList(key,{demo=false,read=getPreference,write=savePreference}={}) {
  const [state,setState]=useState({key,value:[],ready:false,busy:true,error:''});
  const sequence=useRef(0),locked=useRef(false);
  const active=state.key===key;
  const load=async()=>{
    if(locked.current)return;
    const request=++sequence.current;
    setState({key,value:[],ready:false,busy:true,error:''});
    try{
      const value=demo?[]:await read(key,[]);
      if(!Array.isArray(value)||value.some(x=>typeof x!=='string'))throw new Error('Saved details could not be read. Retry before making changes.');
      if(request===sequence.current)setState({key,value,ready:true,busy:false,error:''});
    }catch(e){if(request===sequence.current)setState({key,value:[],ready:false,busy:false,error:e.message});}
  };
  useEffect(()=>{locked.current=false;load();return()=>{sequence.current++;};},[key,demo]);
  const setValue=(value)=>{if(active&&state.ready&&!state.busy)setState(s=>({...s,value:typeof value==='function'?value(s.value):value}));};
  const save=async(value)=>{
    if(!active||!state.ready||state.busy||locked.current)return false;
    const request=sequence.current;locked.current=true;setState(s=>({...s,busy:true,error:''}));
    try{
      if(!demo)await write(key,value);
      if(request===sequence.current)setState({key,value,ready:true,busy:false,error:''});
      return request===sequence.current;
    }catch(e){if(request===sequence.current)setState(s=>({...s,busy:false,error:e.message}));return false;}
    finally{if(request===sequence.current)locked.current=false;}
  };
  return {value:active?state.value:[],ready:active&&state.ready,busy:!active||state.busy,error:active?state.error:'',setValue,save,retry:load};
}
