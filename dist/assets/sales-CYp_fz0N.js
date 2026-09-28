import{c as v,B as y,p as e}from"./index-vXdEAztJ.js";import{s as i}from"./salesService-BjDsnLfu.js";/**
 * @license lucide-vue-next v0.447.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=v("PrinterIcon",[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]),g=y("sales",()=>{const t=e([]),c=e({current_page:1,last_page:1,total:0,per_page:20}),s=e(!1),r=e(!1),l=e(null);async function u(n={}){s.value=!0,l.value=null;try{const a=await i.getSales(n);Array.isArray(a)?t.value=a:(t.value=a.data||[],a.meta&&(c.value=a.meta))}catch(a){l.value=a.message}finally{s.value=!1}}async function f(n){r.value=!0;try{const a=await i.createSale(n),o=a.data||a;return t.value.unshift(o),o}finally{r.value=!1}}return{sales:t,pagination:c,loading:s,saving:r,error:l,fetchSales:u,createSale:f}});export{p as P,g as u};
