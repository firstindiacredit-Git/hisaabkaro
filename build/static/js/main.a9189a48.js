/*! For license information please see main.a9189a48.js.LICENSE.txt */
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
`,aW=()=>(0,G.jsxs)(H.P.div,{className:"antenna",initial:{rotate:-5},animate:{rotate:5},transition:{duration:2,repeat:1/0,repeatType:"reverse",ease:"easeInOut"},children:[(0,G.jsx)("div",{className:"antenna_shadow"}),(0,G.jsx)("div",{className:"a1"}),(0,G.jsx)("div",{className:"a1d"}),(0,G.jsx)("div",{className:"a2"}),(0,G.jsx)("div",{className:"a2d"}),(0,G.jsx)("div",{className:"a_base"})]}),oW=()=>(0,G.jsx)("div",{className:"display_div",children:(0,G.jsx)("div",{className:"screen_out",children:(0,G.jsx)("div",{className:"screen_out1",children:(0,G.jsx)(H.P.div,{className:"screen",initial:{opacity:0},animate:{opacity:[0,1,.8,1]},transition:{duration:2,times:[0,.5,.75,1],repeat:1/0,repeatDelay:3},children:(0,G.jsx)(H.P.span,{className:"notfound_text",initial:{scale:0},animate:{scale:1},transition:{type:"spring",stiffness:260,damping:20,delay:.3},children:"NOT FOUND"})})})})}),sW=()=>(0,G.jsxs)(G.Fragment,{children:[(0,G.jsxs)("div",{className:"lines",children:[(0,G.jsx)("div",{className:"line1"}),(0,G.jsx)("div",{className:"line2"}),(0,G.jsx)("div",{className:"line3"})]}),(0,G.jsxs)(H.P.div,{className:"buttons_div",whileHover:{scale:1.05},transition:{type:"spring",stiffness:400,damping:10},children:[(0,G.jsx)(H.P.div,{className:"b1",whileTap:{scale:.95},children:(0,G.jsx)("div",{})}),(0,G.jsx)(H.P.div,{className:"b2",whileTap:{scale:.95}}),(0,G.jsxs)("div",{className:"speakers",children:[(0,G.jsxs)("div",{className:"g1",children:[(0,G.jsx)("div",{className:"g11"}),(0,G.jsx)("div",{className:"g12"}),(0,G.jsx)("div",{className:"g13"})]}),(0,G.jsx)("div",{className:"g"}),(0,G.jsx)("div",{className:"g"})]})]})]}),lW=()=>(0,G.jsxs)("div",{className:"bottom",children:[(0,G.jsx)("div",{className:"base1"}),(0,G.jsx)("div",{className:"base2"}),(0,G.jsx)("div",{className:"base3"})]}),cW=()=>(0,G.jsx)(iW,{className:"flex justify-center mt-24 ",children:(0,G.jsx)("div",{className:"main_wrapper",children:(0,G.jsxs)("div",{className:"main",children:[(0,G.jsx)(aW,{}),(0,G.jsxs)("div",{className:"tv",children:[(0,G.jsx)("div",{className:"cruve",children:(0,G.jsx)("svg",{xmlSpace:"preserve",viewBox:"0 0 189.929 189.929",xmlns:"http://www.w3.org/2000/svg",version:"1.1",className:"curve_svg",children:(0,G.jsx)("path",{d:"M70.343,70.343c-30.554,30.553-44.806,72.7-39.102,115.635l-29.738,3.951C-5.442,137.659,11.917,86.34,49.129,49.13\r C86.34,11.918,137.664-5.445,189.928,1.502l-3.95,29.738C143.041,25.54,100.895,39.789,70.343,70.343z"})})}),(0,G.jsx)(oW,{}),(0,G.jsx)(sW,{})]}),(0,G.jsx)(lW,{})]})})}),uW=(0,Vs.A)("House",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"1d0kgt"}]]),dW=(0,Vs.A)("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]),hW={hidden:{opacity:0,y:50},visible:{opacity:.05,y:0,transition:{duration:1,ease:"easeOut"}}},fW=()=>(0,G.jsx)(H.P.div,{className:"absolute inset-0 flex items-center justify-center overflow-hidden select-none pointer-events-none",initial:"hidden",animate:"visible",children:(0,G.jsx)(H.P.div,{className:"text-[40rem] font-bold text-white",style:{fontFamily:"system-ui"},variants:hW,children:"404"})});function gW(){return(0,G.jsxs)("div",{className:"min-h-screen bg-gray-900 text-white relative overflow-hidden",children:[(0,G.jsx)(fW,{}),(0,G.jsxs)("div",{className:"relative z-10 ",children:[(0,G.jsx)(cW,{}),(0,G.jsxs)("div",{className:"flex gap-4 justify-center mt-8",children:[(0,G.jsxs)(p,{to:"/dashboard",className:"group flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg font-medium transition-all hover:bg-gray-200",children:[(0,G.jsx)(uW,{className:"w-4 h-4 transition-transform group-hover:-translate-y-1"}),"Home"]}),(0,G.jsxs)("button",{onClick:()=>window.history.back(),className:"group flex items-center gap-2 border border-white px-6 py-3 rounded-lg font-medium transition-all hover:bg-white/10",children:[(0,G.jsx)(dW,{className:"w-4 h-4 transition-transform group-hover:-translate-x-1"}),"Go Back"]})]})]})]})}function AW(e){return L({tag:"svg",attr:{viewBox:"0 0 1024 1024"},child:[{tag:"path",attr:{d:"M872 474H286.9l350.2-304c5.6-4.9 2.2-14-5.2-14h-88.5c-3.9 0-7.6 1.4-10.5 3.9L155 487.8a31.96 31.96 0 0 0 0 48.3L535.1 866c1.5 1.3 3.3 2 5.2 2h91.5c7.4 0 10.8-9.2 5.2-14L286.9 550H872c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z"},child:[]}]})(e)}function pW(e){return L({tag:"svg",attr:{viewBox:"0 0 1024 1024"},child:[{tag:"path",attr:{d:"M869 487.8L491.2 159.9c-2.9-2.5-6.6-3.9-10.5-3.9h-88.5c-7.4 0-10.8 9.2-5.2 14l350.2 304H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h585.1L386.9 854c-5.6 4.9-2.2 14 5.2 14h91.5c1.9 0 3.8-.7 5.2-2L869 536.2a32.07 32.07 0 0 0 0-48.4z"},child:[]}]})(e)}function mW(e){return L({tag:"svg",attr:{viewBox:"0 0 1024 1024"},child:[{tag:"path",attr:{d:"M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8Z"},child:[]},{tag:"path",attr:{d:"M192 474h672q8 0 8 8v60q0 8-8 8H160q-8 0-8-8v-60q0-8 8-8Z"},child:[]}]})(e)}function yW(e){return L({tag:"svg",attr:{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"},child:[{tag:"polyline",attr:{points:"23 4 23 10 17 10"},child:[]},{tag:"polyline",attr:{points:"1 20 1 14 7 14"},child:[]},{tag:"path",attr:{d:"M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"},child:[]}]})(e)}const vW=()=>{const[e,n]=(0,t.useState)([]),[r,i]=(0,t.useState)(!0),a=(0,s.Zp)(),o=async()=>{i(!0);const e=localStorage.getItem("token");try{const[t,r]=await Promise.all([fetch("https://hisaabkaro.com/api/collab-transactions/client-transactions",{headers:{Authorization:`Bearer ${e}`}}),fetch("https://hisaabkaro.com/api/collab-transactions/transactions",{headers:{Authorization:`Bearer ${e}`}})]),i=await t.json(),a=await r.json(),o=(i.transactions||[]).map((e=>{const t=e.transactionHistory.filter((e=>"you will get"===e.transactionType&&"confirmed"===e.confirmationStatus)).reduce(((e,t)=>e+t.amount),0),n=e.transactionHistory.filter((e=>"you will give"===e.transactionType&&"confirmed"===e.confirmationStatus)).reduce(((e,t)=>e+t.amount),0),r=e.transactionHistory.filter((e=>"you will get"===e.transactionType&&"confirmed"!==e.confirmationStatus)).reduce(((e,t)=>e+t.amount),0),i=e.transactionHistory.filter((e=>"you will give"===e.transactionType&&"confirmed"!==e.confirmationStatus)).reduce(((e,t)=>e+t.amount),0);return{...e,confirmedYouWillGet:t,confirmedYouWillGive:n,unconfirmedYouWillGet:r,unconfirmedYouWillGive:i,source:"client",transactionId:e._id}})),s=(a.transactions||[]).map((e=>{const t=e.transactionHistory.filter((e=>"you will get"===e.transactionType&&"confirmed"===e.confirmationStatus)).reduce(((e,t)=>e+t.amount),0),n=e.transactionHistory.filter((e=>"you will give"===e.transactionType&&"confirmed"===e.confirmationStatus)).reduce(((e,t)=>e+t.amount),0),r=e.transactionHistory.filter((e=>"you will get"===e.transactionType&&"confirmed"!==e.confirmationStatus)).reduce(((e,t)=>e+t.amount),0),i=e.transactionHistory.filter((e=>"you will give"===e.transactionType&&"confirmed"!==e.confirmationStatus)).reduce(((e,t)=>e+t.amount),0);return{...e,confirmedYouWillGet:t,confirmedYouWillGive:n,unconfirmedYouWillGet:r,unconfirmedYouWillGive:i,source:"transaction",transactionId:e._id}}));n([...o,...s])}catch(t){console.error("Error fetching transactions:",t)}finally{i(!1)}};(0,t.useEffect)((()=>{o()}),[]);const l=()=>{a("/addtransaction")};if(r)return(0,G.jsx)("div",{className:"flex items-center justify-center min-h-screen bg-gray-50",children:(0,G.jsxs)("div",{className:"flex flex-col items-center space-y-4",children:[(0,G.jsx)("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"}),(0,G.jsx)("div",{className:"text-lg font-medium text-gray-700",children:"Loading transactions..."})]})});const c=e.filter((e=>"transaction"===e.source)),u=e.filter((e=>"client"===e.source));return(0,G.jsxs)("div",{className:"p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen",children:[(0,G.jsxs)("div",{className:"mb-8 flex justify-between items-center",children:[(0,G.jsx)("h1",{className:"text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600",children:"Transactions Overview"}),(0,G.jsxs)("div",{className:"flex space-x-4",children:[(0,G.jsxs)("button",{onClick:o,className:"flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200",children:[(0,G.jsx)(yW,{className:"text-lg"}),(0,G.jsx)("span",{children:"Refresh"})]}),(0,G.jsxs)("button",{onClick:l,className:"flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]",children:[(0,G.jsx)(mW,{className:"text-xl"}),(0,G.jsx)("span",{children:"Add Transaction"})]})]})]}),0===c.length&&0===u.length?(0,G.jsxs)("div",{className:"flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm",children:[(0,G.jsx)("div",{className:"text-lg text-gray-600 mb-6",children:"No transactions found"}),(0,G.jsxs)("button",{onClick:l,className:"flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]",children:[(0,G.jsx)(mW,{className:"text-xl"}),(0,G.jsx)("span",{children:"Add Your First Transaction"})]})]}):(0,G.jsx)("div",{className:"bg-white rounded-2xl shadow-sm overflow-hidden",children:(0,G.jsx)("div",{className:"overflow-x-auto",children:(0,G.jsxs)("table",{className:"w-full",children:[(0,G.jsx)("thead",{children:(0,G.jsxs)("tr",{className:"bg-gray-50 text-left text-gray-600",children:[(0,G.jsx)("th",{className:"px-6 py-4 font-medium",children:"Name"}),(0,G.jsx)("th",{className:"px-6 py-4 font-medium",children:"Book Name"}),(0,G.jsx)("th",{className:"px-6 py-4 font-medium",children:"You Will Get"}),(0,G.jsx)("th",{className:"px-6 py-4 font-medium",children:"You Will Give"}),(0,G.jsx)("th",{className:"px-6 py-4 font-medium",children:"Outstanding Balance"}),(0,G.jsx)("th",{className:"px-6 py-4 font-medium",children:"Actions"})]})}),(0,G.jsx)("tbody",{className:"divide-y divide-gray-100",children:e.map(((e,t)=>{var n,r,i;return(0,G.jsxs)("tr",{className:"hover:bg-blue-50/50 transition-colors duration-150",children:[(0,G.jsx)("td",{className:"px-6 py-4",children:(0,G.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,G.jsx)("span",{className:"font-medium text-gray-700",children:"client"===e.source?(null===(n=e.userId)||void 0===n?void 0:n.name)||"N/A":(null===(r=e.clientUserId)||void 0===r?void 0:r.name)||"N/A"}),"client"===e.source?(0,G.jsx)(AW,{className:"text-blue-500 text-lg",title:"Client Transaction"}):(0,G.jsx)(pW,{className:"text-orange-500 text-lg",title:"Transaction"})]})}),(0,G.jsx)("td",{className:"px-6 py-4 capitalize text-gray-700",children:(null===(i=e.bookId)||void 0===i?void 0:i.bookname)||"Could Not Find Book Name"}),(0,G.jsx)("td",{className:"px-6 py-4",children:(0,G.jsx)("span",{className:"text-green-600 font-medium",children:e.confirmedYouWillGet||0})}),(0,G.jsx)("td",{className:"px-6 py-4",children:(0,G.jsx)("span",{className:"text-red-600 font-medium",children:e.confirmedYouWillGive||0})}),(0,G.jsx)("td",{className:"px-6 py-4",children:(0,G.jsx)("span",{className:"font-medium "+(e.outstandingBalance>0?"text-green-600":e.outstandingBalance<0?"text-red-600":"text-gray-600"),children:0===e.outstandingBalance?0:e.outstandingBalance||"N/A"})}),(0,G.jsx)("td",{className:"px-6 py-4",children:(0,G.jsx)("button",{onClick:()=>{return t=e.transactionId,n=e.source,void a("client"===n?`/transaction-details/${t}`:`/history/${t}`);var t,n},className:"text-blue-600 hover:text-blue-700 font-medium transition-colors duration-150",children:"View Details"})})]},t)}))})]})})})]})};class bW extends Error{}function xW(e){let t=e.replace(/-/g,"+").replace(/_/g,"/");switch(t.length%4){case 0:break;case 2:t+="==";break;case 3:t+="=";break;default:throw new Error("base64 string is not of the correct length")}try{return function(e){return decodeURIComponent(atob(e).replace(/(.)/g,((e,t)=>{let n=t.charCodeAt(0).toString(16).toUpperCase();return n.length<2&&(n="0"+n),"%"+n})))}(t)}catch(n){return atob(t)}}bW.prototype.name="InvalidTokenError";const wW=e=>{let{onClose:n}=e;const[r,a]=(0,t.useState)(""),[o,l]=(0,t.useState)(!1),[c,u]=(0,t.useState)([]),[d,h]=(0,t.useState)(null),f=(0,s.Zp)(),g=localStorage.getItem("userId");(0,t.useEffect)((()=>{(async()=>{try{const e=await fetch("/country.js"),t=(await e.text()).replace("const data =",""),n=JSON.parse(t);u(n);const r=n.find((e=>"IN"===e.countryCode));h(r)}catch(e){console.error("Error loading countries:",e),i.oR.error("Error loading country data")}})()}),[]);const A=e=>{const t=e.toUpperCase().split("").map((e=>127397+e.charCodeAt()));return String.fromCodePoint(...t)};return(0,G.jsx)("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",children:(0,G.jsxs)("div",{className:"bg-white p-8 rounded-lg shadow-lg w-96 relative",children:[(0,G.jsx)("h2",{className:"text-2xl font-bold mb-6 text-center text-gray-800",children:"Update Phone Number"}),(0,G.jsx)("p",{className:"text-gray-600 mb-4 text-center",children:"Please add your phone number to complete your profile"}),(0,G.jsxs)("form",{onSubmit:async e=>{if(e.preventDefault(),l(!0),!d)return i.oR.error("Please select a country"),void l(!1);if(r.length!==d.numberLength)return i.oR.error(`Phone number must be ${d.numberLength} digits for ${d.countryName}`),void l(!1);const t=r.replace(/\D/g,"");try{(await x.A.patch(`https://hisaabkaro.com/api/v1/auth/update-profile/${g}`,{phone:`${d.callingCode}${t}`,countryCode:d.countryCode},{headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}})).data&&(i.oR.success("Phone number updated successfully"),n(),f("/home"))}catch(s){var a,o;i.oR.error((null===(a=s.response)||void 0===a||null===(o=a.data)||void 0===o?void 0:o.message)||"Failed to update phone number")}finally{l(!1)}},className:"space-y-4",children:[(0,G.jsxs)("div",{children:[(0,G.jsx)("label",{htmlFor:"country",className:"block text-sm font-medium text-gray-700 mb-1",children:"Country"}),(0,G.jsx)("select",{id:"country",value:(null===d||void 0===d?void 0:d.countryCode)||"",onChange:e=>{const t=c.find((t=>t.countryCode===e.target.value));h(t),a("")},className:"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",required:!0,children:c.map((e=>(0,G.jsxs)("option",{value:e.countryCode,children:[A(e.countryCode)," ",e.countryName," (",e.callingCode,")"]},e.countryCode)))})]}),(0,G.jsxs)("div",{className:"relative",children:[(0,G.jsx)("label",{htmlFor:"phone",className:"block text-sm font-medium text-gray-700 mb-1",children:"Phone Number"}),(0,G.jsxs)("div",{className:"flex",children:[(0,G.jsx)("span",{className:"inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md",children:d&&(0,G.jsxs)(G.Fragment,{children:[A(d.countryCode)," ",d.callingCode]})}),(0,G.jsx)("input",{type:"tel",id:"phone",value:r,onChange:e=>a(e.target.value.replace(/\D/g,"")),className:"flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500",placeholder:`${(null===d||void 0===d?void 0:d.numberLength)||""} digits required`,maxLength:(null===d||void 0===d?void 0:d.numberLength)||15,required:!0})]}),d&&(0,G.jsxs)("p",{className:"text-xs text-gray-500 mt-1",children:["Number length: ",d.numberLength," digits"]})]}),(0,G.jsxs)("div",{className:"flex justify-end space-x-3",children:[(0,G.jsx)("button",{type:"button",onClick:n,className:"px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500",children:"Cancel"}),(0,G.jsx)("button",{type:"submit",disabled:o,className:"px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 "+(o?"opacity-50 cursor-not-allowed":""),children:o?"Updating...":"Update Phone"})]})]})]})})},EW=()=>{const e=(0,s.zy)(),n=(0,s.Zp)(),{login:r}=(0,Es.A)(),[a,o]=(0,t.useState)(!1);(0,t.useEffect)((()=>{(async()=>{try{const t=new URLSearchParams(e.search).get("token");if(!t)return i.oR.error("Authentication failed - No token received"),void n("/login");const a=function(e,t){if("string"!==typeof e)throw new bW("Invalid token specified: must be a string");t||(t={});const n=!0===t.header?0:1,r=e.split(".")[n];if("string"!==typeof r)throw new bW(`Invalid token specified: missing part #${n+1}`);let i;try{i=xW(r)}catch(_W){throw new bW(`Invalid token specified: invalid base64 for part #${n+1} (${_W.message})`)}try{return JSON.parse(i)}catch(_W){throw new bW(`Invalid token specified: invalid json for part #${n+1} (${_W.message})`)}}(t);if(!a.id||!a.email)return i.oR.error("Invalid authentication data received"),void n("/login");const s={id:a.id,email:a.email,name:a.name,token:t,profilePicture:a.picture||null,phone:a.phone||null};localStorage.setItem("token",t),localStorage.setItem("userId",s.id),localStorage.setItem("username",s.name),s.profilePicture&&localStorage.setItem("profile",s.profilePicture),await r(s),s.phone?n("/home"):o(!0)}catch(t){console.error("Error during Google callback:",t),i.oR.error("Failed to complete Google authentication"),n("/login")}})()}),[e,n,r]);return(0,G.jsxs)("div",{children:[a&&(0,G.jsx)(wW,{onClose:()=>{o(!1),n("/home")}}),!a&&(0,G.jsx)("div",{className:"flex items-center justify-center min-h-screen bg-gray-100",children:(0,G.jsxs)("div",{className:"text-center p-8 bg-white rounded-lg shadow-md",children:[(0,G.jsx)("div",{className:"animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"}),(0,G.jsx)("p",{className:"mt-4 text-gray-600",children:"Completing authentication..."})]})})]})},CW=e=>{let{children:t}=e;const{isLoggedIn:n,loading:r}=(0,Es.A)();return r?(0,G.jsx)("div",{children:"Loading..."}):n?t:(0,G.jsx)(s.C5,{to:"/",replace:!0})},IW=e=>{let{children:t}=e;const{isLoggedIn:n,loading:r}=(0,Es.A)();return r?(0,G.jsx)("div",{children:"Loading..."}):n?(0,G.jsx)(s.C5,{to:"/home",replace:!0}):t},BW=(function(e){for(var n=[],r=1;r<arguments.length;r++)n[r-1]=arguments[r];var i=$G.apply(void 0,pz([e],n,!1)),a="sc-global-".concat(PH(JSON.stringify(i))),o=new rW(i,a),s=function(e){var n=jG(),r=t.useContext(qG),i=t.useRef(n.styleSheet.allocateGSInstance(a)).current;return n.styleSheet.server&&l(i,e,n.styleSheet,r,n.stylis),t.useLayoutEffect((function(){if(!n.styleSheet.server)return l(i,e,n.styleSheet,r,n.stylis),function(){return o.removeStyles(i,n.styleSheet)}}),[i,e,n.styleSheet,r,n.stylis]),null};function l(e,t,n,r,i){if(o.isStatic)o.renderStyles(e,CH,n,i);else{var a=Az(Az({},t),{theme:kH(t,r,s.defaultProps)});o.renderStyles(e,a,n,i)}}return t.memo(s)})`
  * {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }

  *::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
  }
`;const kW=function(){return(0,G.jsx)(Bs,{children:(0,G.jsx)(G.Fragment,{children:(0,G.jsxs)(f,{children:[(0,G.jsx)(BW,{}),(0,G.jsx)(i.N9,{position:"top-right",autoClose:3e3,hideProgressBar:!0}),(0,G.jsxs)(s.BV,{children:[(0,G.jsx)(s.qh,{path:"/",element:(0,G.jsx)(IW,{children:(0,G.jsx)(Ll,{})})}),(0,G.jsx)(s.qh,{path:"/login",element:(0,G.jsx)(IW,{children:(0,G.jsx)(Ll,{})})}),(0,G.jsx)(s.qh,{path:"/signup",element:(0,G.jsx)(IW,{children:(0,G.jsx)(Ll,{})})}),(0,G.jsx)(s.qh,{path:"/auth/callback",element:(0,G.jsx)(EW,{})}),(0,G.jsxs)(s.qh,{path:"/",element:(0,G.jsx)(CW,{children:(0,G.jsx)(Fs,{})}),children:[(0,G.jsx)(s.qh,{path:"home",element:(0,G.jsx)(Lo,{})}),(0,G.jsx)(s.qh,{path:"dashboard",element:(0,G.jsx)(vW,{})}),(0,G.jsx)(s.qh,{path:"your-books",element:(0,G.jsx)(oc,{})}),(0,G.jsx)(s.qh,{path:"/your-books/:bookId",element:(0,G.jsx)(lc,{})}),(0,G.jsx)(s.qh,{path:"transaction-history/:transactionId",element:(0,G.jsx)(gz,{})}),(0,G.jsx)(s.qh,{path:"users",element:(0,G.jsx)(Ms,{})}),(0,G.jsx)(s.qh,{path:"book",element:(0,G.jsx)(Ts,{})}),(0,G.jsx)(s.qh,{path:"profile",element:(0,G.jsx)(Gs,{})}),(0,G.jsx)(s.qh,{path:"loans",element:(0,G.jsx)(Ol,{})}),(0,G.jsx)(s.qh,{path:"invoice",element:(0,G.jsx)(Ul,{})}),(0,G.jsx)(s.qh,{path:"/history/:transactionId",element:(0,G.jsx)(rc,{})}),(0,G.jsx)(s.qh,{path:"/addtransaction",element:(0,G.jsx)(ac,{})}),(0,G.jsx)(s.qh,{path:"/transaction-details/:transactionId",element:(0,G.jsx)(Zl,{})})]}),(0,G.jsx)(s.qh,{path:"*",element:(0,G.jsx)(gW,{})})]})]})})})},DW=e=>{e&&e instanceof Function&&__webpack_require__.e(206).then(__webpack_require__.bind(__webpack_require__,8206)).then((t=>{let{getCLS:n,getFID:r,getFCP:i,getLCP:a,getTTFB:o}=t;n(e),r(e),i(e),a(e),o(e)}))};r.createRoot(document.getElementById("root")).render((0,G.jsx)(Es.O,{children:(0,G.jsx)(kW,{})})),DW()})()})();