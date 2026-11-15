import React from 'react';
import TestRenderer,{act} from 'react-test-renderer';
import assert from 'node:assert/strict';
import {OperatorAgreement} from '../src/components/OperatorAgreement.jsx';

export async function run(){
  globalThis.window={devicePixelRatio:1};
  let ui,closed=0;
  const canvas={offsetWidth:500,offsetHeight:120,getContext:()=>({scale(){}})};
  await act(async()=>{ui=TestRenderer.create(<OperatorAgreement delivery="record" onClose={()=>closed++} initialValues={{legalName:'QA operator'}}/>,{createNodeMock:el=>el.type==='canvas'?canvas:null});});
  const signer=()=>ui.root.findByProps({placeholder:'First & last name'});
  await act(async()=>signer().props.onChange({target:{value:'QA TEST ONLY'}}));
  const backdrop=ui.root.findByProps({className:'agreement-modal-backdrop'});
  await act(async()=>backdrop.props.onClick?.());
  assert.equal(closed,0,'Outside clicks must not discard an agreement draft');
  assert.equal(signer().props.value,'QA TEST ONLY');
  await act(async()=>ui.root.findByProps({'aria-label':'Close'}).props.onClick());
  assert.equal(closed,1,'Explicit close remains available');
  await act(async()=>ui.unmount());
  console.log('PASS: outside clicks preserve the agreement draft; explicit close remains available.');
}
