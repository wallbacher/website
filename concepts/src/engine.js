// Kleos story engine: a scroll-driven stage on which one hero walks through the acts.
// A theme (window.THEME) supplies the palette, background, floor and post effects.
(function(){
const T=window.THEME;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const story=document.getElementById('story');
const cv=document.getElementById('world'),x=cv.getContext('2d');
const cards=[...document.querySelectorAll('.card')];
const bar=document.getElementById('bar');
const N=cards.length, WALK=.6;
let W=0,H=0,gy=0,s=1,S=600,t=0,pos=0,act=0,idx=0,walking=false,fw=0,cam=0;

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=v=>v<.5?2*v*v:1-Math.pow(-2*v+2,2)/2;
const back=v=>{const c1=1.7,c3=c1+1;return 1+c3*Math.pow(v-1,3)+c1*Math.pow(v-1,2)};
const lerp=(a,b,k)=>a+(b-a)*k;

function resize(){
  const d=Math.min(2,devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;
  cv.width=Math.round(W*d);cv.height=Math.round(H*d);x.setTransform(d,0,0,d,0,0);
  gy=H*(W<640?T.groundMobile:T.ground);s=clamp(Math.min(H/640,W/420),.62,1.45);S=Math.max(W*.85,520*s);
  story.style.setProperty('--len',(N*95)+'vh');
}

function read(){
  const top=-story.getBoundingClientRect().top,total=Math.max(1,story.offsetHeight-innerHeight);
  const Q=clamp(top/total)*(N-1+WALK);
  idx=Math.min(N-1,Math.floor(Q));const f=Q-idx;
  if(idx===N-1){act=clamp(f/WALK);pos=N-1;walking=false;fw=0}
  else if(f<WALK){act=f/WALK;pos=idx;walking=false;fw=0}
  else{act=1;fw=(f-WALK)/(1-WALK);pos=idx+ease(fw);walking=true}
}
const actOf=j=>j<idx?1:j>idx?0:(walking?1:act);

/* ---------- drawing helpers ---------- */
const P=()=>T.pal(pos/(N-1));
function circ(cx,cy,r,c){x.fillStyle=c;x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.fill()}
function line(pts,c,w){x.strokeStyle=c;x.lineWidth=w;x.lineCap='round';x.lineJoin='round';x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.stroke()}
function heart(cx,cy,r,c){x.fillStyle=c;x.beginPath();x.moveTo(cx,cy+r*.9);x.bezierCurveTo(cx-r*1.6,cy-r*.2,cx-r*.7,cy-r*1.4,cx,cy-r*.4);x.bezierCurveTo(cx+r*.7,cy-r*1.4,cx+r*1.6,cy-r*.2,cx,cy+r*.9);x.fill()}
function star(cx,cy,r,c,rot=0){x.fillStyle=c;x.beginPath();for(let i=0;i<10;i++){const a=rot+i*Math.PI/5-Math.PI/2,rr=i%2?r*.45:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}x.fill()}
function rrect(px,py,w,h,r,c,stroke){x.beginPath();x.roundRect?x.roundRect(px,py,w,h,r):x.rect(px,py,w,h);if(stroke){x.strokeStyle=c;x.lineWidth=stroke;x.stroke()}else{x.fillStyle=c;x.fill()}}
function txt(str,px,py,size,c,font,align='center',alpha=1){x.save();x.globalAlpha*=alpha;x.fillStyle=c;x.font=`${size}px ${font}`;x.textAlign=align;x.textBaseline='middle';x.fillText(str,px,py);x.restore()}
function rnd(i){const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v)}

/* ---------- the hero ---------- */
function limb(o,a,b,L){const e=[o[0]+Math.sin(a)*L,o[1]+Math.cos(a)*L];return [e,[e[0]+Math.sin(b)*L,e[1]+Math.cos(b)*L]]}
const POSE={
  stand:()=>({legs:[[.07,0],[-.07,0]],arms:[[.15,.1],[-.15,-.1]],lean:0}),
  walk:ph=>({legs:[[Math.sin(ph)*.5,Math.max(0,-Math.cos(ph))*.9],[-Math.sin(ph)*.5,Math.max(0,Math.cos(ph))*.9]],arms:[[-Math.sin(ph)*.45,-Math.sin(ph)*.45+.35],[Math.sin(ph)*.45,Math.sin(ph)*.45+.35]],lean:.08,bob:Math.abs(Math.cos(ph))*2}),
  open:()=>({legs:[[.18,0],[-.18,0]],arms:[[.9,1.2],[-.9,-1.2]],lean:0}),
  ear:t=>({legs:[[.1,0],[-.05,0]],arms:[[2.25,4.15],[.1,.05]],lean:.16+Math.sin(t*2)*.03}),
  dig:t=>{const k=Math.sin(t*4);return{legs:[[.35,.2],[-.25,.1]],arms:[[.95+k*.35,.45+k*.35],[.75+k*.35,.25+k*.35]],lean:.5+k*.12,dig:k}},
  mic:t=>({legs:[[.15,0],[-.15,0]],arms:[[1.0,2.65],[-2.2-Math.sin(t*3)*.2,-2.6]],lean:-.04}),
  cheer:t=>({legs:[[.2,0],[-.2,0]],arms:[[2.6+Math.sin(t*9)*.15,3.0],[-2.6-Math.sin(t*9)*.15,-3.0]],lean:0,bob:Math.abs(Math.sin(t*6))*6}),
  wave:t=>({legs:[[.12,0],[-.12,0]],arms:[[2.5,2.9+Math.sin(t*7)*.45],[-.2,-.1]],lean:0}),
  board:t=>({legs:[[.1,0],[-.1,0]],arms:[[1.25,2.2],[.6+Math.sin(t*5)*.15,1.9]],lean:.05}),
  bounce:t=>({legs:[[Math.sin(t*6)*.25,0],[-Math.sin(t*6)*.25,0]],arms:[[1.65,1.9+Math.sin(t*6)*.3],[-1.65,-1.9-Math.sin(t*6)*.3]],lean:0,bob:Math.abs(Math.sin(t*6))*8}),
  front:t=>({legs:[[.22,0],[-.22,0]],arms:[[2.55,2.95+Math.sin(t*7)*.4],[-.45,-.3]],lean:0}),
};
function mixPose(a,b,k){const m=(p,q)=>p.map((v,i)=>Array.isArray(v)?m(v,q[i]):lerp(v,q[i],k));return{legs:m(a.legs,b.legs),arms:m(a.arms,b.arms),lean:lerp(a.lean||0,b.lean||0,k),bob:lerp(a.bob||0,b.bob||0,k),dig:b.dig}}
function drawHero(hx,p,col,w){
  const L=23*s,A=17*s,hip=[hx,gy-2*L-(p.bob||0)*s+1*s];
  const ln=p.lean||0,neck=[hip[0]+Math.sin(ln)*36*s,hip[1]-Math.cos(ln)*36*s];
  const head=[neck[0]+Math.sin(ln)*13*s,neck[1]-Math.cos(ln)*13*s];
  const sh=[lerp(neck[0],hip[0],.08),lerp(neck[1],hip[1],.08)];
  const lw=(w||6)*s;
  p.legs.forEach(([a,b])=>{const [k,f]=limb(hip,a,a-b,L);line([hip,k,f],col,lw)});
  line([hip,neck],col,lw*1.25);
  const hands=p.arms.map(([a,b])=>{const [e,h]=limb(sh,a,b,A);line([sh,e,h],col,lw*.9);return h});
  circ(head[0],head[1],10.5*s,col);
  return{hip,neck,head,sh,hands,L};
}

/* ---------- acts: props drawn around the hero's mark (cx) ---------- */
const SC=[
 // 0 Prologue: a spotlight finds the hero, the word hangs in the dark
 {pose:(a,t)=>mixPose(POSE.stand(),POSE.open(),ease(a)),
  draw(cx,a,C){const k=.45+.55*a;
    const g=x.createRadialGradient(cx,gy,4,cx,gy,170*s);g.addColorStop(0,C.light);g.addColorStop(1,'transparent');
    x.save();x.globalAlpha=k;x.fillStyle=g;x.beginPath();x.moveTo(cx-24*s,-10);x.lineTo(cx+24*s,-10);x.lineTo(cx+95*s,gy+8*s);x.lineTo(cx-95*s,gy+8*s);x.fill();
    x.globalAlpha=k*.6;x.fillStyle=C.light;x.beginPath();x.ellipse(cx,gy+2*s,90*s,12*s,0,0,7);x.fill();x.restore();
    for(let i=0;i<26;i++){const px=cx+(rnd(i)-.5)*150*s,py=gy-((t*14*(.4+rnd(i+9))+rnd(i+3)*H)%(gy));circ(px,py,1.4*s,C.dust)}
    txt('κλέος',cx+(W<640?0:250*s),gy-(W<640?260:200)*s,(W<640?90:150)*s,C.ghost,T.greek,'center',.9);}},
 // 1 Act I: three heroes on plinths light up, theatre masks above
 {pose:(a,t)=>POSE.stand(),
  draw(cx,a,C){const xs=[cx+95*s,cx+175*s,cx+255*s];
    xs.forEach((px,i)=>{const on=clamp(a*3.2-i*.9);const py=gy-26*s;
      rrect(px-26*s,py,52*s,26*s,3*s,C.set);
      if(on>0){const g=x.createLinearGradient(px,0,px,py);g.addColorStop(0,'transparent');g.addColorStop(1,C.light);x.save();x.globalAlpha=on*.7;x.fillStyle=g;x.beginPath();x.moveTo(px-8*s,0);x.lineTo(px+8*s,0);x.lineTo(px+34*s,py);x.lineTo(px-34*s,py);x.fill();x.restore()}
      x.save();x.translate(px,py);x.scale(.62,.62);x.translate(-px,-gy);
      const col=on>.5?C.hero:C.dim;
      const h=drawHero(px,[POSE.stand(),POSE.cheer(t),POSE.mic(t)][i],col,6);
      if(i===0){circ(h.hands[1][0]-8*s,h.hands[1][1],15*s,col);line([[h.hands[0][0],h.hands[0][1]+30*s],[h.hands[0][0]+4*s,h.hands[0][1]-70*s]],col,4*s)}
      if(i===1){x.strokeStyle=col;x.lineWidth=4*s;x.beginPath();x.arc(h.head[0],h.head[1]-22*s,16*s,Math.PI,0);x.stroke()}
      if(i===2){x.strokeStyle=col;x.lineWidth=4*s;x.beginPath();x.moveTo(h.hands[0][0]-12*s,h.hands[0][1]-14*s);x.quadraticCurveTo(h.hands[0][0],h.hands[0][1]+18*s,h.hands[0][0]+12*s,h.hands[0][1]-14*s);x.stroke()}
      x.restore();});
    const my=gy-235*s,mx=cx+175*s,ma=.25+.75*a;
    [[-34,1],[34,-1]].forEach(([o,sm],i)=>{x.save();x.globalAlpha=ma;x.translate(mx+o*s,my);x.rotate(o*.004);
      x.fillStyle=i?C.a2:C.a1;x.beginPath();x.ellipse(0,0,28*s,36*s,0,0,7);x.fill();
      x.fillStyle=C.bg;x.beginPath();x.ellipse(-10*s,-6*s,6*s,4*s,sm*.3,0,7);x.ellipse(10*s,-6*s,6*s,4*s,-sm*.3,0,7);x.fill();
      x.strokeStyle=C.bg;x.lineWidth=4*s;x.beginPath();x.arc(0,sm>0?8*s:22*s,12*s,sm>0?.2:Math.PI+.2,sm>0?Math.PI-.2:-.2);x.stroke();x.restore()});}},
 // 2 Act II: a row of identical cookie-cutter figures topples, only the hero stays
 {pose:(a,t)=>mixPose(POSE.stand(),POSE.open(),clamp(a*1.6-.6)),
  draw(cx,a,C){for(let i=0;i<6;i++){const px=cx+(70+i*44)*s,fall=ease(clamp(a*2.2-i*.18));
      x.save();x.translate(px+16*s,gy);x.rotate(fall*Math.PI/2);x.translate(-px-16*s,-gy);
      const c=C.dim,u=s*.95;x.fillStyle=c;x.beginPath();
      x.arc(px,gy-62*u,11*u,0,7);x.rect(px-10*u,gy-52*u,20*u,30*u);x.rect(px-20*u,gy-50*u,40*u,8*u);x.rect(px-10*u,gy-24*u,8*u,24*u);x.rect(px+2*u,gy-24*u,8*u,24*u);x.fill();
      x.fillStyle=C.bg;x.beginPath();x.arc(px,gy-46*u,1.8*u,0,7);x.arc(px,gy-38*u,1.8*u,0,7);x.fill();x.restore()}
    if(a>.4){x.save();x.globalAlpha=clamp((a-.4)*2);const g=x.createRadialGradient(cx,gy-50*s,4,cx,gy-50*s,90*s);g.addColorStop(0,C.light);g.addColorStop(1,'transparent');x.fillStyle=g;x.fillRect(cx-100*s,gy-150*s,200*s,160*s);x.restore()}}},
 // 3 Act III: the hero leans in and listens; the crowd's voices travel to him
 {pose:(a,t)=>POSE.ear(t),
  draw(cx,a,C){const sym=['♥','?','!','★','♪'];
    for(let i=0;i<5;i++){const px=cx+(120+i*38)*s,u=.6+rnd(i)*.15;x.save();x.translate(px,gy);x.scale(u,u);x.translate(-px,-gy);drawHero(px,POSE.wave(t+i),C.dim,6);x.restore();
      for(let k=0;k<2;k++){const ph=((t*.35+rnd(i*7+k))%1),qx=lerp(px,cx+10*s,ph),qy=lerp(gy-70*s*u,gy-95*s,ph)-Math.sin(ph*Math.PI)*40*s;
        txt(sym[(i+k)%5],qx,qy,(14+6*a)*s,[C.a1,C.a2,C.a3][(i+k)%3],T.body,'center',Math.sin(ph*Math.PI)*(.5+.5*a))}}
    x.strokeStyle=C.light;x.lineWidth=2*s;for(let r=0;r<3;r++){const rr=((t*30+r*22)%66)*s+12*s;x.save();x.globalAlpha=(1-rr/(80*s))*a;x.beginPath();x.arc(cx+12*s,gy-100*s,rr,-.8,.8);x.stroke();x.restore()}}},
 // 4 Act IV: the hero digs; under the floor there is depth, and the USP rises out of it
 {pose:(a,t)=>POSE.dig(t),
  draw(cx,a,C){const hx=cx+55*s;
    for(let l=0;l<4;l++){x.fillStyle=[C.set,C.dim,C.set,C.dim][l];x.globalAlpha=.35+.12*l;x.fillRect(cx-140*s,gy+l*18*s,320*s,18*s)}x.globalAlpha=1;
    x.fillStyle=C.bg;x.beginPath();x.ellipse(hx,gy+2*s,30*s,10*s+a*40*s,0,0,Math.PI);x.fill();
    for(let i=0;i<6;i++){const ph=(t*1.6+rnd(i))%1;circ(hx-10*s-ph*50*s,gy-Math.sin(ph*Math.PI)*45*s,(2+rnd(i+2)*3)*s,C.dim)}
    const gyA=gy+60*s-ease(a)*150*s,gx=hx;
    const g=x.createRadialGradient(gx,gyA,2,gx,gyA,60*s);g.addColorStop(0,C.a1);g.addColorStop(1,'transparent');x.save();x.globalAlpha=.25+.6*a;x.fillStyle=g;x.fillRect(gx-60*s,gyA-60*s,120*s,120*s);x.restore();
    x.fillStyle=C.a1;x.beginPath();x.moveTo(gx,gyA-22*s);x.lineTo(gx+18*s,gyA-4*s);x.lineTo(gx,gyA+22*s);x.lineTo(gx-18*s,gyA-4*s);x.fill();
    x.fillStyle=C.light;x.beginPath();x.moveTo(gx,gyA-22*s);x.lineTo(gx+7*s,gyA-4*s);x.lineTo(gx-7*s,gyA-4*s);x.fill();
    if(a>.65)txt('USP',gx,gyA-42*s,16*s,C.a1,T.display,'center',clamp((a-.65)*3))},
  over(h,C){const [p1,p2]=h.hands,dx=p2[0]-p1[0],dy=p2[1]-p1[1],d=Math.hypot(dx,dy)||1,ex=p2[0]+dx/d*44*s,ey=p2[1]+dy/d*44*s;line([[p1[0]-dx/d*16*s,p1[1]-dy/d*16*s],[ex,ey]],C.set,4*s);x.fillStyle=C.set;x.beginPath();x.ellipse(ex,ey,7*s,11*s,Math.atan2(dy,dx)-Math.PI/2,0,7);x.fill()}},
 // 5 Act V: the curtain opens, the hero takes the mic, hearts rise from the crowd
 {pose:(a,t)=>mixPose(POSE.stand(),POSE.mic(t),clamp(a*2)),
  draw(cx,a,C){rrect(cx-110*s,gy-12*s,220*s,12*s,2*s,C.set);
    const open=ease(clamp(a*1.5));const top=gy-280*s;
    [-1,1].forEach(sd=>{const inner=cx+sd*lerp(8,150,open)*s,outer=cx+sd*190*s;x.fillStyle=C.a2;x.beginPath();x.moveTo(outer,top);x.lineTo(inner,top);
      for(let k=0;k<=8;k++){const yy=lerp(top,gy-12*s,k/8);x.lineTo(inner+sd*Math.sin(k*1.7+t*.8)*4*s+sd*(k/8)*open*30*s,yy)}x.lineTo(outer,gy-12*s);x.fill();
      x.strokeStyle=C.bg;x.globalAlpha=.25;x.lineWidth=2*s;for(let k=1;k<5;k++){const xx=lerp(inner,outer,k/5);x.beginPath();x.moveTo(xx,top);x.lineTo(xx,gy-12*s);x.stroke()}x.globalAlpha=1});
    rrect(cx-200*s,top-16*s,400*s,22*s,3*s,C.a2)},
  over(h,C){const m=h.hands[0];line([[m[0],m[1]],[m[0]+3*s,m[1]+12*s]],C.set,4*s);circ(m[0]-1*s,m[1]-5*s,6*s,C.set)},
  front(cx,a,C){const by=H;for(let i=-9;i<10;i++){const px=cx+i*34*s+((i%2)*10*s),py=by-(i%2?18:8)*s;circ(px,py,19*s,C.crowd);x.fillStyle=C.crowd;x.fillRect(px-22*s,py,44*s,40*s)}
    for(let i=0;i<9;i++){const ph=(t*.3+rnd(i))%1;heart(cx+(rnd(i+4)-.5)*360*s,by-30*s-ph*240*s*(.5+a*.6),(6+rnd(i)*5)*s,[C.a1,C.a2,C.a3][i%3]);}}},
 // 6 Orangina Switzerland: the hero steps into a big round costume and goes viral
 {pose:(a,t)=>a<.25?POSE.stand():POSE.bounce(t),
  draw(cx,a,C){const ph=[[-120,-150],[110,-190],[190,-110]];
    ph.forEach(([ox,oy],i)=>{const on=back(clamp(a*2.4-i*.35));if(on<=0)return;const px=cx+ox*s,py=gy+oy*s,fl=Math.sin(t*1.5+i)*5*s;
      x.save();x.translate(px,py+fl);x.scale(on,on);rrect(-26*s,-46*s,52*s,92*s,8*s,C.set);rrect(-21*s,-38*s,42*s,72*s,3*s,C.bg);
      x.fillStyle=C.a2;x.beginPath();x.arc(0,-2*s,13*s,0,7);x.fill();x.fillStyle=C.bg;x.beginPath();x.moveTo(-4*s,-9*s);x.lineTo(7*s,-2*s);x.lineTo(-4*s,5*s);x.fill();
      txt('♥ '+(12+Math.floor((t*3+i*7)%88))+'k',0,26*s,9*s,C.a1,T.body);x.restore()})},
  over(h,C,cx,a){const k=back(clamp((a-.15)*2.5));if(k<=0)return;const cy=h.hip[1]-14*s;
    x.save();x.translate(h.hip[0],cy);x.scale(k,k);circ(0,0,34*s,C.a2);x.fillStyle=C.a1;x.beginPath();x.ellipse(-4*s,-38*s,6*s,10*s,-.5,0,7);x.fill();
    circ(-10*s,-8*s,3.6*s,C.bg);circ(10*s,-8*s,3.6*s,C.bg);x.strokeStyle=C.bg;x.lineWidth=3*s;x.beginPath();x.arc(0,2*s,10*s,.25,Math.PI-.25);x.stroke();x.restore()}},
 // 7 Eurovision: hard hat and clipboard for the briefing, then the show kicks in
 {pose:(a,t)=>a<.55?POSE.board(t):mixPose(POSE.board(t),POSE.cheer(t),clamp((a-.55)*4)),
  draw(cx,a,C){const wx=cx-30*s,wy=gy-250*s,cols=16,rows=7,cw=22*s;const live=clamp((a-.5)*3);
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const v=Math.sin(c*.6+r*.9+t*4)*.5+.5;x.fillStyle=live>0&&v>.55?[C.a1,C.a2,C.a3][(r+c)%3]:C.set;x.globalAlpha=.25+.55*(live*v+(1-live)*.3);x.fillRect(wx+c*cw-cols*cw/2+120*s,wy+r*cw,cw-3*s,cw-3*s)}
    x.globalAlpha=1;
    for(let k=0;k<4;k++){const sx=cx+(-120+k*110)*s,ang=Math.sin(t*1.1+k*1.7)*.5;x.save();x.globalAlpha=.12+.25*live;x.fillStyle=[C.a1,C.a3,C.a2,C.a1][k];x.beginPath();x.moveTo(sx,0);x.lineTo(sx+Math.sin(ang)*gy-30*s,gy);x.lineTo(sx+Math.sin(ang)*gy+30*s,gy);x.fill();x.restore()}
    if(live>0)for(let i=0;i<40;i++){const ph=(t*.25+rnd(i))%1;x.save();x.globalAlpha=live;x.fillStyle=[C.a1,C.a2,C.a3][i%3];x.translate(cx+(rnd(i+1)-.5)*500*s+Math.sin(t*2+i)*14*s,ph*gy);x.rotate(t*3+i);x.fillRect(-4*s,-2*s,8*s,4*s);x.restore()}},
  over(h,C,cx,a){x.fillStyle=C.a1;x.beginPath();x.arc(h.head[0],h.head[1]-3*s,13*s,Math.PI,0);x.fill();x.fillRect(h.head[0]-16*s,h.head[1]-4*s,32*s,4*s);
    if(a<.7){const b=h.hands[0];x.save();x.globalAlpha=clamp((.7-a)*5);x.translate(b[0]+4*s,b[1]);x.rotate(-.2);rrect(-12*s,-16*s,24*s,32*s,2*s,C.set);x.strokeStyle=C.bg;x.lineWidth=2*s;for(let k=0;k<3;k++){x.beginPath();x.moveTo(-7*s,(-6+k*7)*s);x.lineTo(7*s,(-6+k*7)*s);x.stroke()}x.restore()}}},
 // 8 Finale: the hero turns to the audience and waves you closer
 {pose:(a,t)=>POSE.front(t),
  draw(cx,a,C){const g=x.createRadialGradient(cx,gy-60*s,6,cx,gy-60*s,200*s);g.addColorStop(0,C.light);g.addColorStop(1,'transparent');x.save();x.globalAlpha=.5+.4*a;x.fillStyle=g;x.fillRect(cx-220*s,gy-260*s,440*s,280*s);x.restore();
    for(let i=0;i<3;i++){const yy=gy+16*s+((t*20+i*12)%36)*s;txt('↓',cx,yy,18*s,C.a1,T.body,'center',(1-((t*20+i*12)%36)/36)*a)}}},
];

function frame(){
  if(!reduce)t+=1/60;
  read();
  const C=P();
  const heroX=pos*S;cam=heroX-W*(W<640?.32:W>900?(T.heroAtWide||T.heroAt):T.heroAt);
  x.clearRect(0,0,W,H);
  T.back(x,{W,H,gy,s,cam,pos,t,C,N,S,idx,fw,walking});
  T.floor(x,{W,H,gy,s,cam,C});
  T.layer&&T.layer(x,true);
  const vis=[];for(let j=0;j<N;j++){const cx=j*S-cam;if(cx>-S&&cx<W+S)vis.push([j,cx])}
  vis.forEach(([j,cx])=>{const a=actOf(j);x.save();if(T.popup){const k=back(clamp(1-Math.abs(pos-j)*1.35));x.globalAlpha=clamp(k*1.4);x.translate(cx,gy);x.scale(1,Math.max(.001,k));x.translate(-cx,-gy)}SC[j].draw(cx,a,C);x.restore()});
  const scn=SC[idx];let pose;
  if(walking)pose=POSE.walk(heroX/(19*s));else pose=scn.pose(act,t);
  const hx=heroX-cam;
  const h=drawHero(hx,pose,C.hero,T.heroWeight||6);
  if(!walking&&scn.over)scn.over(h,C,hx,act);
  if(walking&&idx===6)SC[6].over(h,C,hx,1-clamp(fw*3));
  if(walking&&idx===7)SC[7].over(h,C,hx,1);
  T.layer&&T.layer(x,false);
  vis.forEach(([j,cx])=>{if(SC[j].front){x.save();if(T.popup){const k=back(clamp(1-Math.abs(pos-j)*1.35));x.globalAlpha=clamp(k*1.4)}SC[j].front(cx,actOf(j),C);x.restore()}});
  T.post(x,{W,H,gy,s,cam,pos,t,C,N,idx,fw,walking,cards});
  cards.forEach((c,j)=>{const o=clamp(1-Math.abs(pos-j)*(T.cardFade||2.4));c.style.opacity=o;c.style.visibility=o>0?'visible':'hidden';c.style.setProperty('--o',o)});
  if(bar)bar.style.transform=`scaleX(${(pos+(idx===N-1?act*.6:0))/(N-1+.6)})`;
  requestAnimationFrame(frame);
}
addEventListener('resize',resize);
(document.fonts?document.fonts.ready:Promise.resolve()).then(resize);
resize();requestAnimationFrame(frame);

const L=k=>{try{return window.I18N[window.LANG].ui[k]}catch(e){return k}};
/* ---------- contact form: sent through FormSubmit to the inbox; falls back to the visitor's mail app ---------- */
const form=document.getElementById('contact-form');
if(form){form.addEventListener('submit',async e=>{e.preventDefault();
  const d=new FormData(form),to=form.dataset.to,note=document.getElementById('form-note'),btn=form.querySelector('.send');
  const name=(d.get('name')||'').trim(),email=(d.get('email')||'').trim(),msg=(d.get('message')||'').trim();
  if(!name||!email||!msg||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){note.textContent=L('missing');(!name?form.elements.name:!email||!/@/.test(email)?form.elements.email:form.elements.message).focus();return}
  if(d.get('_honey'))return;
  btn.disabled=true;btn.textContent=L('sending');note.textContent='';
  const mailto=()=>{const subj=encodeURIComponent('Kleos · '+name),body=encodeURIComponent(msg+'\n\n— '+name+' · '+email);location.href=`mailto:${to}?subject=${subj}&body=${body}`;note.textContent=L('note').replace('{to}',to)};
  try{const r=await fetch('https://formsubmit.co/ajax/'+to,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},
      body:JSON.stringify({name,email,message:msg,_subject:'Kleos Website · '+name,_replyto:email,_template:'table',_captcha:'false',language:window.LANG})});
    const j=await r.json().catch(()=>({}));
    if(r.ok&&String(j.success)!=='false'){form.reset();note.textContent=L('thanks')}else throw new Error(j.message||r.status)}
  catch(err){mailto()}
  finally{btn.disabled=false;btn.textContent=L('send')}});}
const copy=document.getElementById('copy-mail');
if(copy)copy.addEventListener('click',async()=>{const v=copy.dataset.mail;try{await navigator.clipboard.writeText(v);copy.textContent=L('copied')}catch(e){const r=document.createRange();r.selectNodeContents(document.getElementById('mail-text'));const sel=getSelection();sel.removeAllRanges();sel.addRange(r);copy.textContent=L('selected')}setTimeout(()=>copy.textContent=L('copy'),1800)});
})();
