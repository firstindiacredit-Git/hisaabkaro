/*! For license information please see main.42f566ed.js.LICENSE.txt */
  .main_wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30em;
    height: 30em;
  }

  .main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 5em;
  }

  .antenna {
    width: 5em;
    height: 5em;
    border-radius: 50%;
    border: 2px solid black;
    background-color: #f27405;
    margin-bottom: -6em;
    margin-left: 0em;
    z-index: -1;
  }
  .antenna_shadow {
    position: absolute;
    background-color: transparent;
    width: 50px;
    height: 56px;
    margin-left: 1.68em;
    border-radius: 45%;
    transform: rotate(140deg);
    border: 4px solid transparent;
    box-shadow: inset 0px 16px #a85103, inset 0px 16px 1px 1px #a85103;
    -moz-box-shadow: inset 0px 16px #a85103, inset 0px 16px 1px 1px #a85103;
  }
  .antenna::after {
    content: "";
    position: absolute;
    margin-top: -9.4em;
    margin-left: 0.4em;
    transform: rotate(-25deg);
    width: 1em;
    height: 0.5em;
    border-radius: 50%;
    background-color: #f69e50;
  }
  .antenna::before {
    content: "";
    position: absolute;
    margin-top: 0.2em;
    margin-left: 1.25em;
    transform: rotate(-20deg);
    width: 1.5em;
    height: 0.8em;
    border-radius: 50%;
    background-color: #f69e50;
  }
  .a1 {
    position: relative;
    top: -102%;
    left: -130%;
    width: 12em;
    height: 5.5em;
    border-radius: 50px;
    background-image: linear-gradient(
      #171717,
      #171717,
      #353535,
      #353535,
      #171717
    );
    transform: rotate(-29deg);
    clip-path: polygon(50% 0%, 49% 100%, 52% 100%);
  }
  .a1d {
    position: relative;
    top: -211%;
    left: -35%;
    transform: rotate(45deg);
    width: 0.5em;
    height: 0.5em;
    border-radius: 50%;
    border: 2px solid black;
    background-color: #979797;
    z-index: 99;
  }
  .a2 {
    position: relative;
    top: -210%;
    left: -10%;
    width: 12em;
    height: 4em;
    border-radius: 50px;
    background-color: #171717;
    background-image: linear-gradient(
      #171717,
      #171717,
      #353535,
      #353535,
      #171717
    );
    margin-right: 5em;
    clip-path: polygon(
      47% 0,
      47% 0,
      34% 34%,
      54% 25%,
      32% 100%,
      29% 96%,
      49% 32%,
      30% 38%
    );
    transform: rotate(-8deg);
  }
  .a2d {
    position: relative;
    top: -294%;
    left: 94%;
    width: 0.5em;
    height: 0.5em;
    border-radius: 50%;
    border: 2px solid black;
    background-color: #979797;
    z-index: 99;
  }

  .notfound_text {
    background-color: black;
    padding-left: 0.3em;
    padding-right: 0.3em;
    font-size: 0.75em;
    color: white;
    letter-spacing: 0;
    border-radius: 5px;
    z-index: 10;
  }
  .tv {
    width: 17em;
    height: 9em;
    margin-top: 3em;
    border-radius: 15px;
    background-color: #d36604;
    display: flex;
    justify-content: center;
    border: 2px solid #1d0e01;
    box-shadow: inset 0.2em 0.2em #e69635;
  }
  .tv::after {
    content: "";
    position: absolute;
    width: 17em;
    height: 9em;
    border-radius: 15px;
    background: repeating-radial-gradient(
          #d36604 0 0.0001%,
          #00000070 0 0.0002%
        )
        50% 0/2500px 2500px,
      repeating-conic-gradient(#d36604 0 0.0001%, #00000070 0 0.0002%) 60% 60%/2500px
        2500px;
    background-blend-mode: difference;
    opacity: 0.09;
  }
  .curve_svg {
    position: absolute;
    margin-top: 0.25em;
    margin-left: -0.25em;
    height: 12px;
    width: 12px;
  }
  .display_div {
    display: flex;
    align-items: center;
    align-self: center;
    justify-content: center;
    border-radius: 15px;
    box-shadow: 3.5px 3.5px 0px #e69635;
  }
  .screen_out {
    width: auto;
    height: auto;
    border-radius: 10px;
  }
  .screen_out1 {
    width: 11em;
    height: 7.75em;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
  }
  .screen {
    width: 13em;
    height: 7.85em;
    font-family: Montserrat;
    border: 2px solid #1d0e01;
    background: repeating-radial-gradient(#000 0 0.0001%, #ffffff 0 0.0002%) 50%
        0/2500px 2500px,
      repeating-conic-gradient(#000 0 0.0001%, #ffffff 0 0.0002%) 60% 60%/2500px
        2500px;
    background-blend-mode: difference;
    animation: b 0.2s infinite alternate;
    border-radius: 10px;
    z-index: 99;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #252525;
    letter-spacing: 0.15em;
    text-align: center;
  }
  @keyframes b {
    100% {
      background-position: 50% 0, 60% 50%;
    }
  }

  .lines {
    display: flex;
    column-gap: 0.1em;
    align-self: flex-end;
  }
  .line1,
  .line3 {
    width: 2px;
    height: 0.5em;
    background-color: black;
    border-radius: 25px 25px 0px 0px;
    margin-top: 0.5em;
  }
  .line2 {
    flex-grow: 1;
    width: 2px;
    height: 1em;
    background-color: black;
    border-radius: 25px 25px 0px 0px;
  }

  .buttons_div {
    width: 4.25em;
    align-self: center;
    height: 8em;
    background-color: #e69635;
    border: 2px solid #1d0e01;
    padding: 0.6em;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    row-gap: 0.75em;
    box-shadow: 3px 3px 0px #e69635;
  }
  .b1 {
    width: 1.65em;
    height: 1.65em;
    border-radius: 50%;
    background-color: #7f5934;
    border: 2px solid black;
    box-shadow: inset 2px 2px 1px #b49577, -2px 0px #513721,
      -2px 0px 0px 1px black;
  }
  .b1::before {
    content: "";
    position: absolute;
    margin-top: 1em;
    margin-left: 0.5em;
    transform: rotate(47deg);
    border-radius: 5px;
    width: 0.1em;
    height: 0.4em;
    background-color: #000000;
  }
  .b1::after {
    content: "";
    position: absolute;
    margin-top: 0.9em;
    margin-left: 0.8em;
    transform: rotate(47deg);
    border-radius: 5px;
    width: 0.1em;
    height: 0.55em;
    background-color: #000000;
  }
  .b1 div {
    content: "";
    position: absolute;
    margin-top: -0.1em;
    margin-left: 0.65em;
    transform: rotate(45deg);
    width: 0.15em;
    height: 1.5em;
    background-color: #000000;
  }
  .b2 {
    width: 1.65em;
    height: 1.65em;
    border-radius: 50%;
    background-color: #7f5934;
    border: 2px solid black;
    box-shadow: inset 2px 2px 1px #b49577, -2px 0px #513721,
      -2px 0px 0px 1px black;
  }
  .b2::before {
    content: "";
    position: absolute;
    margin-top: 1.05em;
    margin-left: 0.8em;
    transform: rotate(-45deg);
    border-radius: 5px;
    width: 0.15em;
    height: 0.4em;
    background-color: #000000;
  }
  .b2::after {
    content: "";
    position: absolute;
    margin-top: -0.1em;
    margin-left: 0.65em;
    transform: rotate(-45deg);
    width: 0.15em;
    height: 1.5em;
    background-color: #000000;
  }
  .speakers {
    display: flex;
    flex-direction: column;
    row-gap: 0.5em;
  }
  .speakers .g1 {
    display: flex;
    column-gap: 0.25em;
  }
  .speakers .g1 .g11,
  .g12,
  .g13 {
    width: 0.65em;
    height: 0.65em;
    border-radius: 50%;
    background-color: #7f5934;
    border: 2px solid black;
    box-shadow: inset 1.25px 1.25px 1px #b49577;
  }
  .speakers .g {
    width: auto;
    height: 2px;
    background-color: #171717;
  }

  .bottom {
    width: 100%;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 8.7em;
  }
  .base1 {
    height: 1em;
    width: 2em;
    border: 2px solid #171717;
    background-color: #4d4d4d;
    margin-top: -0.15em;
    z-index: -1;
  }
  .base2 {
    height: 1em;
    width: 2em;
    border: 2px solid #171717;
    background-color: #4d4d4d;
    margin-top: -0.15em;
    z-index: -1;
  }
  .base3 {
    position: absolute;
    height: 0.15em;
    width: 17.5em;
    background-color: #171717;
    margin-top: 0.8em;
  }

  .text_404 {
    position: absolute;
    display: flex;
    flex-direction: row;
    column-gap: 6em;
    z-index: -5;
    margin-bottom: 2em;
    align-items: center;
    justify-content: center;
    opacity: 0.5;
    font-family: Montserrat;
  }
  .text_4041 {
    transform: scaleY(24.5) scaleX(9);
  }
  .text_4042 {
    transform: scaleY(24.5) scaleX(9);
  }
  .text_4043 {
    transform: scaleY(24.5) scaleX(9);
  }
`,$1=()=>(0,bi.jsxs)(_y.div,{className:"antenna",initial:{rotate:-5},animate:{rotate:5},transition:{duration:2,repeat:1/0,repeatType:"reverse",ease:"easeInOut"},children:[(0,bi.jsx)("div",{className:"antenna_shadow"}),(0,bi.jsx)("div",{className:"a1"}),(0,bi.jsx)("div",{className:"a1d"}),(0,bi.jsx)("div",{className:"a2"}),(0,bi.jsx)("div",{className:"a2d"}),(0,bi.jsx)("div",{className:"a_base"})]}),e2=()=>(0,bi.jsx)("div",{className:"display_div",children:(0,bi.jsx)("div",{className:"screen_out",children:(0,bi.jsx)("div",{className:"screen_out1",children:(0,bi.jsx)(_y.div,{className:"screen",initial:{opacity:0},animate:{opacity:[0,1,.8,1]},transition:{duration:2,times:[0,.5,.75,1],repeat:1/0,repeatDelay:3},children:(0,bi.jsx)(_y.span,{className:"notfound_text",initial:{scale:0},animate:{scale:1},transition:{type:"spring",stiffness:260,damping:20,delay:.3},children:"NOT FOUND"})})})})}),t2=()=>(0,bi.jsxs)(bi.Fragment,{children:[(0,bi.jsxs)("div",{className:"lines",children:[(0,bi.jsx)("div",{className:"line1"}),(0,bi.jsx)("div",{className:"line2"}),(0,bi.jsx)("div",{className:"line3"})]}),(0,bi.jsxs)(_y.div,{className:"buttons_div",whileHover:{scale:1.05},transition:{type:"spring",stiffness:400,damping:10},children:[(0,bi.jsx)(_y.div,{className:"b1",whileTap:{scale:.95},children:(0,bi.jsx)("div",{})}),(0,bi.jsx)(_y.div,{className:"b2",whileTap:{scale:.95}}),(0,bi.jsxs)("div",{className:"speakers",children:[(0,bi.jsxs)("div",{className:"g1",children:[(0,bi.jsx)("div",{className:"g11"}),(0,bi.jsx)("div",{className:"g12"}),(0,bi.jsx)("div",{className:"g13"})]}),(0,bi.jsx)("div",{className:"g"}),(0,bi.jsx)("div",{className:"g"})]})]})]}),n2=()=>(0,bi.jsxs)("div",{className:"bottom",children:[(0,bi.jsx)("div",{className:"base1"}),(0,bi.jsx)("div",{className:"base2"}),(0,bi.jsx)("div",{className:"base3"})]}),r2=()=>(0,bi.jsx)(X1,{className:"flex justify-center mt-24 ",children:(0,bi.jsx)("div",{className:"main_wrapper",children:(0,bi.jsxs)("div",{className:"main",children:[(0,bi.jsx)($1,{}),(0,bi.jsxs)("div",{className:"tv",children:[(0,bi.jsx)("div",{className:"cruve",children:(0,bi.jsx)("svg",{xmlSpace:"preserve",viewBox:"0 0 189.929 189.929",xmlns:"http://www.w3.org/2000/svg",version:"1.1",className:"curve_svg",children:(0,bi.jsx)("path",{d:"M70.343,70.343c-30.554,30.553-44.806,72.7-39.102,115.635l-29.738,3.951C-5.442,137.659,11.917,86.34,49.129,49.13\r C86.34,11.918,137.664-5.445,189.928,1.502l-3.95,29.738C143.041,25.54,100.895,39.789,70.343,70.343z"})})}),(0,bi.jsx)(e2,{}),(0,bi.jsx)(t2,{})]}),(0,bi.jsx)(n2,{})]})})}),i2=db("House",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"1d0kgt"}]]),a2=db("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]),o2={hidden:{opacity:0,y:50},visible:{opacity:.05,y:0,transition:{duration:1,ease:"easeOut"}}},s2=()=>(0,bi.jsx)(_y.div,{className:"absolute inset-0 flex items-center justify-center overflow-hidden select-none pointer-events-none",initial:"hidden",animate:"visible",children:(0,bi.jsx)(_y.div,{className:"text-[40rem] font-bold text-white",style:{fontFamily:"system-ui"},variants:o2,children:"404"})});function l2(){return(0,bi.jsxs)("div",{className:"min-h-screen bg-gray-900 text-white relative overflow-hidden",children:[(0,bi.jsx)(s2,{}),(0,bi.jsxs)("div",{className:"relative z-10 ",children:[(0,bi.jsx)(r2,{}),(0,bi.jsxs)("div",{className:"flex gap-4 justify-center mt-8",children:[(0,bi.jsxs)(ht,{to:"/dashboard",className:"group flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg font-medium transition-all hover:bg-gray-200",children:[(0,bi.jsx)(i2,{className:"w-4 h-4 transition-transform group-hover:-translate-y-1"}),"Home"]}),(0,bi.jsxs)("button",{onClick:()=>window.history.back(),className:"group flex items-center gap-2 border border-white px-6 py-3 rounded-lg font-medium transition-all hover:bg-white/10",children:[(0,bi.jsx)(a2,{className:"w-4 h-4 transition-transform group-hover:-translate-x-1"}),"Go Back"]})]})]})]})}function c2(e){return Gr({tag:"svg",attr:{viewBox:"0 0 1024 1024"},child:[{tag:"path",attr:{d:"M872 474H286.9l350.2-304c5.6-4.9 2.2-14-5.2-14h-88.5c-3.9 0-7.6 1.4-10.5 3.9L155 487.8a31.96 31.96 0 0 0 0 48.3L535.1 866c1.5 1.3 3.3 2 5.2 2h91.5c7.4 0 10.8-9.2 5.2-14L286.9 550H872c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z"},child:[]}]})(e)}function u2(e){return Gr({tag:"svg",attr:{viewBox:"0 0 1024 1024"},child:[{tag:"path",attr:{d:"M869 487.8L491.2 159.9c-2.9-2.5-6.6-3.9-10.5-3.9h-88.5c-7.4 0-10.8 9.2-5.2 14l350.2 304H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h585.1L386.9 854c-5.6 4.9-2.2 14 5.2 14h91.5c1.9 0 3.8-.7 5.2-2L869 536.2a32.07 32.07 0 0 0 0-48.4z"},child:[]}]})(e)}function d2(e){return Gr({tag:"svg",attr:{viewBox:"0 0 1024 1024"},child:[{tag:"path",attr:{d:"M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8Z"},child:[]},{tag:"path",attr:{d:"M192 474h672q8 0 8 8v60q0 8-8 8H160q-8 0-8-8v-60q0-8 8-8Z"},child:[]}]})(e)}function h2(e){return Gr({tag:"svg",attr:{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"},child:[{tag:"polyline",attr:{points:"23 4 23 10 17 10"},child:[]},{tag:"polyline",attr:{points:"1 20 1 14 7 14"},child:[]},{tag:"path",attr:{d:"M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"},child:[]}]})(e)}const f2=()=>{const[e,t]=(0,r.useState)([]),[n,i]=(0,r.useState)(!0),a=je(),o=async()=>{i(!0);const e=localStorage.getItem("token");try{const[n,r]=await Promise.all([fetch("https://www.hisaabkaro.com/api/collab-transactions/client-transactions",{headers:{Authorization:`Bearer ${e}`}}),fetch("https://www.hisaabkaro.com/api/collab-transactions/transactions",{headers:{Authorization:`Bearer ${e}`}})]),i=await n.json(),a=await r.json(),o=(i.transactions||[]).map((e=>{const t=e.transactionHistory.filter((e=>"you will get"===e.transactionType&&"confirmed"===e.confirmationStatus)).reduce(((e,t)=>e+t.amount),0),n=e.transactionHistory.filter((e=>"you will give"===e.transactionType&&"confirmed"===e.confirmationStatus)).reduce(((e,t)=>e+t.amount),0),r=e.transactionHistory.filter((e=>"you will get"===e.transactionType&&"confirmed"!==e.confirmationStatus)).reduce(((e,t)=>e+t.amount),0),i=e.transactionHistory.filter((e=>"you will give"===e.transactionType&&"confirmed"!==e.confirmationStatus)).reduce(((e,t)=>e+t.amount),0);return{...e,confirmedYouWillGet:t,confirmedYouWillGive:n,unconfirmedYouWillGet:r,unconfirmedYouWillGive:i,source:"client",transactionId:e._id}})),s=(a.transactions||[]).map((e=>{const t=e.transactionHistory.filter((e=>"you will get"===e.transactionType&&"confirmed"===e.confirmationStatus)).reduce(((e,t)=>e+t.amount),0),n=e.transactionHistory.filter((e=>"you will give"===e.transactionType&&"confirmed"===e.confirmationStatus)).reduce(((e,t)=>e+t.amount),0),r=e.transactionHistory.filter((e=>"you will get"===e.transactionType&&"confirmed"!==e.confirmationStatus)).reduce(((e,t)=>e+t.amount),0),i=e.transactionHistory.filter((e=>"you will give"===e.transactionType&&"confirmed"!==e.confirmationStatus)).reduce(((e,t)=>e+t.amount),0);return{...e,confirmedYouWillGet:t,confirmedYouWillGive:n,unconfirmedYouWillGet:r,unconfirmedYouWillGive:i,source:"transaction",transactionId:e._id}}));t([...o,...s])}catch(n){console.error("Error fetching transactions:",n)}finally{i(!1)}};(0,r.useEffect)((()=>{o()}),[]);const s=()=>{a("/addtransaction")};if(n)return(0,bi.jsx)("div",{className:"flex items-center justify-center min-h-screen bg-gray-50",children:(0,bi.jsxs)("div",{className:"flex flex-col items-center space-y-4",children:[(0,bi.jsx)("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"}),(0,bi.jsx)("div",{className:"text-lg font-medium text-gray-700",children:"Loading transactions..."})]})});const l=e.filter((e=>"transaction"===e.source)),c=e.filter((e=>"client"===e.source));return(0,bi.jsxs)("div",{className:"p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen",children:[(0,bi.jsxs)("div",{className:"mb-8 flex justify-between items-center",children:[(0,bi.jsx)("h1",{className:"text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600",children:"Transactions Overview"}),(0,bi.jsxs)("div",{className:"flex space-x-4",children:[(0,bi.jsxs)("button",{onClick:o,className:"flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200",children:[(0,bi.jsx)(h2,{className:"text-lg"}),(0,bi.jsx)("span",{children:"Refresh"})]}),(0,bi.jsxs)("button",{onClick:s,className:"flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]",children:[(0,bi.jsx)(d2,{className:"text-xl"}),(0,bi.jsx)("span",{children:"Add Transaction"})]})]})]}),0===l.length&&0===c.length?(0,bi.jsxs)("div",{className:"flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm",children:[(0,bi.jsx)("div",{className:"text-lg text-gray-600 mb-6",children:"No transactions found"}),(0,bi.jsxs)("button",{onClick:s,className:"flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]",children:[(0,bi.jsx)(d2,{className:"text-xl"}),(0,bi.jsx)("span",{children:"Add Your First Transaction"})]})]}):(0,bi.jsx)("div",{className:"bg-white rounded-2xl shadow-sm overflow-hidden",children:(0,bi.jsx)("div",{className:"overflow-x-auto",children:(0,bi.jsxs)("table",{className:"w-full",children:[(0,bi.jsx)("thead",{children:(0,bi.jsxs)("tr",{className:"bg-gray-50 text-left text-gray-600",children:[(0,bi.jsx)("th",{className:"px-6 py-4 font-medium",children:"Name"}),(0,bi.jsx)("th",{className:"px-6 py-4 font-medium",children:"Book Name"}),(0,bi.jsx)("th",{className:"px-6 py-4 font-medium",children:"You Will Get"}),(0,bi.jsx)("th",{className:"px-6 py-4 font-medium",children:"You Will Give"}),(0,bi.jsx)("th",{className:"px-6 py-4 font-medium",children:"Outstanding Balance"}),(0,bi.jsx)("th",{className:"px-6 py-4 font-medium",children:"Actions"})]})}),(0,bi.jsx)("tbody",{className:"divide-y divide-gray-100",children:e.map(((e,t)=>{var n,r,i;return(0,bi.jsxs)("tr",{className:"hover:bg-blue-50/50 transition-colors duration-150",children:[(0,bi.jsx)("td",{className:"px-6 py-4",children:(0,bi.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,bi.jsx)("span",{className:"font-medium text-gray-700",children:"client"===e.source?(null===(n=e.userId)||void 0===n?void 0:n.name)||"N/A":(null===(r=e.clientUserId)||void 0===r?void 0:r.name)||"N/A"}),"client"===e.source?(0,bi.jsx)(c2,{className:"text-blue-500 text-lg",title:"Client Transaction"}):(0,bi.jsx)(u2,{className:"text-orange-500 text-lg",title:"Transaction"})]})}),(0,bi.jsx)("td",{className:"px-6 py-4 capitalize text-gray-700",children:(null===(i=e.bookId)||void 0===i?void 0:i.bookname)||"Could Not Find Book Name"}),(0,bi.jsx)("td",{className:"px-6 py-4",children:(0,bi.jsx)("span",{className:"text-green-600 font-medium",children:e.confirmedYouWillGet||0})}),(0,bi.jsx)("td",{className:"px-6 py-4",children:(0,bi.jsx)("span",{className:"text-red-600 font-medium",children:e.confirmedYouWillGive||0})}),(0,bi.jsx)("td",{className:"px-6 py-4",children:(0,bi.jsx)("span",{className:"font-medium "+(e.outstandingBalance>0?"text-green-600":e.outstandingBalance<0?"text-red-600":"text-gray-600"),children:0===e.outstandingBalance?0:e.outstandingBalance||"N/A"})}),(0,bi.jsx)("td",{className:"px-6 py-4",children:(0,bi.jsx)("button",{onClick:()=>{return t=e.transactionId,n=e.source,void a("client"===n?`/transaction-details/${t}`:`/history/${t}`);var t,n},className:"text-blue-600 hover:text-blue-700 font-medium transition-colors duration-150",children:"View Details"})})]},t)}))})]})})})]})};class g2 extends Error{}function A2(e){let t=e.replace(/-/g,"+").replace(/_/g,"/");switch(t.length%4){case 0:break;case 2:t+="==";break;case 3:t+="=";break;default:throw new Error("base64 string is not of the correct length")}try{return function(e){return decodeURIComponent(atob(e).replace(/(.)/g,((e,t)=>{let n=t.charCodeAt(0).toString(16).toUpperCase();return n.length<2&&(n="0"+n),"%"+n})))}(t)}catch(YM){return atob(t)}}g2.prototype.name="InvalidTokenError";const p2=()=>{const e=Re(),t=je(),{login:n}=wi(),[i,a]=(0,r.useState)(!1);(0,r.useEffect)((()=>{(async()=>{try{const r=new URLSearchParams(e.search).get("token");if(!r)return N.error("Authentication failed - No token received"),void t("/login");const i=function(e,t){if("string"!==typeof e)throw new g2("Invalid token specified: must be a string");t||(t={});const n=!0===t.header?0:1,r=e.split(".")[n];if("string"!==typeof r)throw new g2(`Invalid token specified: missing part #${n+1}`);let i;try{i=A2(r)}catch(x2){throw new g2(`Invalid token specified: invalid base64 for part #${n+1} (${x2.message})`)}try{return JSON.parse(i)}catch(x2){throw new g2(`Invalid token specified: invalid json for part #${n+1} (${x2.message})`)}}(r);if(!i.id||!i.email)return N.error("Invalid authentication data received"),void t("/login");const o={id:i.id,email:i.email,name:i.name,token:r,profilePicture:i.picture||null};localStorage.setItem("token",r),localStorage.setItem("userId",o.id),localStorage.setItem("username",o.name),o.profilePicture&&localStorage.setItem("profile",o.profilePicture),await n(o),i.phone?t("/home"):a(!0)}catch(r){console.error("Error in Google callback:",r),N.error("Failed to complete authentication"),t("/login")}})()}),[e,t,n]);return(0,bi.jsxs)(bi.Fragment,{children:[(0,bi.jsx)("div",{className:"flex items-center justify-center min-h-screen bg-gray-100",children:(0,bi.jsxs)("div",{className:"text-center p-8 bg-white rounded-lg shadow-md",children:[(0,bi.jsx)("div",{className:"animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"}),(0,bi.jsx)("p",{className:"mt-4 text-gray-600",children:"Completing your sign-in..."})]})}),i&&(0,bi.jsx)(Nd,{onClose:()=>{t("/home")}})]})},m2=e=>{let{children:t}=e;const{isLoggedIn:n,loading:r}=wi();return r?(0,bi.jsx)("div",{children:"Loading..."}):n?t:(0,bi.jsx)($e,{to:"/",replace:!0})},y2=e=>{let{children:t}=e;const{isLoggedIn:n,loading:r}=wi();return r?(0,bi.jsx)("div",{children:"Loading..."}):n?(0,bi.jsx)($e,{to:"/home",replace:!0}):t},b2=(function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];var i=Y1.apply(void 0,c$([e],t,!1)),a="sc-global-".concat(N0(JSON.stringify(i))),o=new Z1(i,a),s=function(e){var t=_1(),n=r.useContext(z1),i=r.useRef(t.styleSheet.allocateGSInstance(a)).current;return t.styleSheet.server&&l(i,e,t.styleSheet,n,t.stylis),r.useLayoutEffect((function(){if(!t.styleSheet.server)return l(i,e,t.styleSheet,n,t.stylis),function(){return o.removeStyles(i,t.styleSheet)}}),[i,e,t.styleSheet,n,t.stylis]),null};function l(e,t,n,r,i){if(o.isStatic)o.renderStyles(e,y0,n,i);else{var a=l$(l$({},t),{theme:w0(t,r,s.defaultProps)});o.renderStyles(e,a,n,i)}}return r.memo(s)})`
  * {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }

  *::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
  }
`;const v2=function(){return(0,bi.jsx)(bi.Fragment,{children:(0,bi.jsxs)(ct,{children:[(0,bi.jsx)(b2,{}),(0,bi.jsx)(O,{position:"top-right",autoClose:3e3,hideProgressBar:!0}),(0,bi.jsxs)(rt,{children:[(0,bi.jsx)(tt,{path:"/",element:(0,bi.jsx)(y2,{children:(0,bi.jsx)(Eb,{})})}),(0,bi.jsx)(tt,{path:"/login",element:(0,bi.jsx)(y2,{children:(0,bi.jsx)(Eb,{})})}),(0,bi.jsx)(tt,{path:"/signup",element:(0,bi.jsx)(y2,{children:(0,bi.jsx)(Eb,{})})}),(0,bi.jsx)(tt,{path:"/auth/callback",element:(0,bi.jsx)(p2,{})}),(0,bi.jsxs)(tt,{path:"/",element:(0,bi.jsx)(m2,{children:(0,bi.jsx)(qy,{})}),children:[(0,bi.jsx)(tt,{path:"home",element:(0,bi.jsx)(Fd,{})}),(0,bi.jsx)(tt,{path:"dashboard",element:(0,bi.jsx)(f2,{})}),(0,bi.jsx)(tt,{path:"your-books",element:(0,bi.jsx)(Wb,{})}),(0,bi.jsx)(tt,{path:"/your-books/:bookId",element:(0,bi.jsx)(Yb,{})}),(0,bi.jsx)(tt,{path:"transaction-history/:transactionId",element:(0,bi.jsx)(s$,{})}),(0,bi.jsx)(tt,{path:"users",element:(0,bi.jsx)(Xy,{})}),(0,bi.jsx)(tt,{path:"book",element:(0,bi.jsx)(Jy,{})}),(0,bi.jsx)(tt,{path:"profile",element:(0,bi.jsx)(ob,{})}),(0,bi.jsx)(tt,{path:"loans",element:(0,bi.jsx)(Ib,{})}),(0,bi.jsx)(tt,{path:"invoice",element:(0,bi.jsx)(Bb,{})}),(0,bi.jsx)(tt,{path:"/history/:transactionId",element:(0,bi.jsx)(zb,{})}),(0,bi.jsx)(tt,{path:"/addtransaction",element:(0,bi.jsx)(Gb,{})}),(0,bi.jsx)(tt,{path:"/transaction-details/:transactionId",element:(0,bi.jsx)(Mb,{})})]}),(0,bi.jsx)(tt,{path:"*",element:(0,bi.jsx)(l2,{})})]})]})})},w2=e=>{e&&e instanceof Function&&n.e(206).then(n.bind(n,8206)).then((t=>{let{getCLS:n,getFID:r,getFCP:i,getLCP:a,getTTFB:o}=t;n(e),r(e),i(e),a(e),o(e)}))};a.createRoot(document.getElementById("root")).render((0,bi.jsx)(xi,{children:(0,bi.jsx)(v2,{})})),w2()})()})();