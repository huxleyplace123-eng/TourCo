import React from 'react';
import {renderToString} from 'react-dom/server';
import OperatorPortal from '../src/admin/OperatorPortal.jsx';
export function smoke(){
 const op={id:'qa',name:'QA Company',type:'tours'};
 const empty=renderToString(<OperatorPortal op={op} initialPortal={{}} assignedBookings={[]}/>);
 const actual=renderToString(<OperatorPortal op={op} initialPortal={{}} assignedBookings={[{id:'x',guest:'QA Guest',pax:3,date:'2026-12-01',time:'08:00',tour:'QA Tour',pickup:'QA meeting',maskedPhone:'Contact TicoWild',status:'Requested',pending:true}]}/>);
 if(!empty||!actual.includes('QA Guest'))throw Error('Operator render failed');
 console.log('Live empty and assigned operator views render successfully.');
}
