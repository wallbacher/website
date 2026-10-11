// Three stagings of the same story. Each file defines window.THEME for one variant.
/* @@STAGE@@ */
window.THEME=(function(){
  const cyc=['#3a2a7a','#5a1f6e','#1f4f66','#6b3a12','#1d4a7a','#6e1f3f','#6b4a10','#3a1f7a','#16505a'];
  const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  const mix=(a,b,k)=>{const A=hex(a),B=hex(b);return'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(',')+')'};
  const base={bg:'#0b0b12',set:'#30324a',dim:'#4f5373',hero:'#fff3df',light:'rgba(255,224,160,.5)',dust:'rgba(255,240,210,.55)',ghost:'rgba(255,255,255,.06)',a1:'#ffcc4d',a2:'#ff5e57',a3:'#6fe3d0',crowd:'#040409'};
  return{
    ground:.74,groundMobile:.8,heroAt:.4,heroAtWide:.6,heroWeight:6.5,display:'"Syne",sans-serif',body:'"Manrope",sans-serif',greek:'"GFS Didot",serif',
    pal(k){const u=k*(cyc.length-1),i=Math.min(cyc.length-2,Math.floor(u));return Object.assign({cyc:mix(cyc[i],cyc[i+1],u-i)},base)},
    back(x,{W,H,gy,s,cam,t,C}){
      const g=x.createLinearGradient(0,0,0,gy);g.addColorStop(0,C.bg);g.addColorStop(.35,C.cyc);g.addColorStop(1,C.bg);x.fillStyle=g;x.fillRect(0,0,W,gy+2);
      // a soft wash of light drifting on the cyclorama
      const bx=W*.6-((cam*.08)%(W*1.4)),r=Math.max(W,H)*.45,b=x.createRadialGradient(bx,gy*.55,10,bx,gy*.55,r);b.addColorStop(0,'rgba(255,255,255,.10)');b.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=b;x.fillRect(0,0,W,gy);
      // lighting truss with lamps, slower than the stage for depth
      const ty=Math.max(54,H*.11);x.fillStyle='#1b1c28';x.fillRect(0,ty-3,W,6);
      const step=150*s,off=-((cam*.45)%step);
      for(let px=off-step;px<W+step;px+=step){x.fillStyle='#1b1c28';x.fillRect(px-2,ty,4,14*s);x.fillStyle='#2a2c3d';x.beginPath();x.ellipse(px,ty+18*s,9*s,7*s,0,0,7);x.fill();
        const on=.5+.5*Math.sin(t*.8+px*.01);x.fillStyle=`rgba(255,220,150,${.35+.4*on})`;x.beginPath();x.arc(px,ty+22*s,3.5*s,0,7);x.fill()}
      // far flats: tall panels sliding at half speed
      const fs=420*s,fo=-((cam*.5)%fs);x.fillStyle='rgba(255,255,255,.035)';
      for(let px=fo-fs;px<W+fs;px+=fs){x.fillRect(px,gy-250*s,120*s,250*s);x.fillRect(px+180*s,gy-170*s,70*s,170*s)}
    },
    floor(x,{W,H,gy,s,cam,C}){const g=x.createLinearGradient(0,gy,0,H);g.addColorStop(0,'#1a1a26');g.addColorStop(1,'#050508');x.fillStyle=g;x.fillRect(0,gy,W,H-gy);
      x.strokeStyle='rgba(255,255,255,.05)';x.lineWidth=1;for(let i=1;i<8;i++){const yy=gy+Math.pow(i/8,1.8)*(H-gy);x.beginPath();x.moveTo(0,yy);x.lineTo(W,yy);x.stroke()}
      const step=90*s,off=-(cam%step);for(let px=off;px<W+step;px+=step){x.beginPath();x.moveTo(px,gy);x.lineTo(px+(px-W/2)*1.4,H);x.stroke()}
      x.fillStyle='rgba(255,204,77,.5)';x.fillRect(0,gy-1,W,2)},
    post(x,{W,H}){const v=x.createRadialGradient(W/2,H*.45,Math.min(W,H)*.3,W/2,H*.45,Math.max(W,H)*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.6)');x.fillStyle=v;x.fillRect(0,0,W,H);
      const cw=Math.max(10,W*.025);[[0,1],[W-cw,-1]].forEach(([px])=>{const g=x.createLinearGradient(px,0,px+cw,0);g.addColorStop(0,px?'rgba(90,10,24,0)':'#3a0a14');g.addColorStop(1,px?'#3a0a14':'rgba(90,10,24,0)');x.fillStyle=g;x.fillRect(px,0,cw,H)})},
  };
})();
/* @@END@@ */

/* @@FLASHBACK@@ */
window.THEME=(function(){
  const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  const mix=(a,b,k)=>{const A=hex(a),B=hex(b);return'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(',')+')'};
  const sep={bg:'#17110b',set:'#5c4630',dim:'#715a40',hero:'#f3e3c3',a1:'#e8c27a',a2:'#b9773f',a3:'#d8b48a',crowd:'#0c0805'};
  const now={bg:'#0d1122',set:'#2d3354',dim:'#4c5479',hero:'#ffffff',a1:'#ffcc4d',a2:'#ff5e57',a3:'#6fe3d0',crowd:'#04050c'};
  let grain=null,N=9;
  function makeGrain(){grain=document.createElement('canvas');grain.width=grain.height=220;const g=grain.getContext('2d'),d=g.createImageData(220,220);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}g.putImageData(d,0,0)}
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  return{
    ground:.7,groundMobile:.74,heroAt:.42,heroWeight:6,cardFade:3.2,display:'"DM Serif Display",serif',body:'"Courier Prime",monospace',greek:'"GFS Didot",serif',
    pal(k){const c=clamp(k*(N-1)-(N-2));const o={light:`rgba(255,225,170,${.42})`,dust:'rgba(255,232,190,.5)',ghost:'rgba(240,220,180,.08)',color:c};for(const key in sep)o[key]=mix(sep[key],now[key],c);return o},
    back(x,{W,H,gy,s,cam,C}){const g=x.createLinearGradient(0,0,0,gy);g.addColorStop(0,C.bg);g.addColorStop(1,C.set);x.fillStyle=g;x.fillRect(0,0,W,gy);
      // painted backdrop: distant hills like an old matte painting, slow parallax
      [[.08,.62,'rgba(255,230,190,.05)'],[.18,.72,'rgba(255,230,190,.07)']].forEach(([f,h,c],li)=>{x.fillStyle=c;x.beginPath();x.moveTo(0,gy);for(let px=0;px<=W;px+=10){const wx=px+cam*f;x.lineTo(px,gy-(h*gy*.35)*(.55+.45*Math.sin(wx*.004+li*2)*Math.sin(wx*.0017)))}x.lineTo(W,gy);x.fill()})},
    floor(x,{W,H,gy,C}){x.fillStyle=C.bg;x.fillRect(0,gy,W,H-gy);x.strokeStyle=C.dim;x.lineWidth=2;x.beginPath();x.moveTo(0,gy);x.lineTo(W,gy);x.stroke()},
    post(x,{W,H,t,C,idx,fw,walking,cards}){
      const c=C.color;
      // iris between acts, with a silent-film intertitle at the black point
      if(walking){const r=Math.hypot(W,H)*.6*Math.abs(1-2*fw);x.save();x.fillStyle='#000';x.beginPath();x.rect(0,0,W,H);x.moveTo(W*.45+r,H*.5);x.arc(W*.45,H*.5,r,0,Math.PI*2,true);x.fill('evenodd');x.restore();
        const al=clamp(1-Math.abs(fw-.5)*4.5);if(al>0){const nx=cards[idx+1];const act=nx.dataset.act,ttl=nx.dataset.short;x.save();x.globalAlpha=al;x.fillStyle='#f3e3c3';x.textAlign='center';x.textBaseline='middle';
          x.font=`${Math.min(18,W*.04)}px "Courier Prime",monospace`;x.fillText(act.toUpperCase(),W/2,H*.43);
          x.font=`${Math.min(54,W*.085)}px "DM Serif Display",serif`;x.fillText(ttl,W/2,H*.52);
          x.strokeStyle='#f3e3c3';x.lineWidth=1;x.beginPath();x.moveTo(W/2-80,H*.6);x.lineTo(W/2+80,H*.6);x.stroke();x.restore()}}
      // film: grain, flicker, scratches, vignette; fades as we reach the present
      if(!grain)makeGrain();const f=1-c;
      if(f>0){x.save();x.globalAlpha=.07*f;x.globalCompositeOperation='overlay';const ox=-Math.random()*220,oy=-Math.random()*220;for(let px=ox;px<W;px+=220)for(let py=oy;py<H;py+=220)x.drawImage(grain,px,py);x.restore();
        x.fillStyle=`rgba(0,0,0,${(Math.random()*.06)*f})`;x.fillRect(0,0,W,H);
        if(Math.random()<.25){x.strokeStyle=`rgba(255,240,210,${.15*f})`;x.lineWidth=1;const sx=Math.random()*W;x.beginPath();x.moveTo(sx,0);x.lineTo(sx+Math.random()*6-3,H);x.stroke()}}
      const v=x.createRadialGradient(W/2,H/2,Math.min(W,H)*.25,W/2,H/2,Math.max(W,H)*.72);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,`rgba(0,0,0,${.75-.35*c})`);x.fillStyle=v;x.fillRect(0,0,W,H);
      const lb=H*.07*(1-c*.6);x.fillStyle='#000';x.fillRect(0,0,W,lb);x.fillRect(0,H-lb,W,lb);
      if(c>0){x.save();x.globalAlpha=clamp(c*2)*clamp(2-c*2+.6);x.fillStyle='#fff';x.font=`${Math.min(14,W*.032)}px "Courier Prime",monospace`;x.textAlign='right';x.fillText('PRESENT DAY',W-24,H-lb-22);x.restore()}},
  };
})();
/* @@END@@ */

/* @@POPUP@@ */
window.THEME=(function(){
  const base={bg:'#e8edfb',set:'#16161c',dim:'#9aa4cc',hero:'#111116',light:'rgba(255,205,70,.55)',dust:'rgba(255,255,255,.85)',ghost:'rgba(47,75,255,.13)',a1:'#ffb81f',a2:'#ff4f38',a3:'#13c29a',crowd:'#1d2fc4'};
  return{
    ground:.72,groundMobile:.78,heroAt:.4,heroAtWide:.6,heroWeight:7,popup:true,display:'"Bricolage Grotesque",sans-serif',body:'"DM Sans",sans-serif',greek:'"GFS Didot",serif',
    pal(){return base},
    back(x,{W,H,gy,s,cam,t,C}){x.fillStyle=C.bg;x.fillRect(0,0,W,gy);
      x.save();x.shadowColor='rgba(16,24,90,.22)';x.shadowOffsetX=5*s;x.shadowOffsetY=6*s;
      const sx=W*.78-((cam*.04)%(W*1.6));x.fillStyle=C.a1;x.beginPath();x.arc(sx,gy*.32,52*s,0,7);x.fill();
      // three cut-paper layers: further back = slower and paler
      [[.15,'#c9d3fa',.5],[.3,'#9fb0f5',.32],[.5,'#6d84f0',.18]].forEach(([f,c,h],li)=>{x.fillStyle=c;x.beginPath();x.moveTo(0,gy);
        for(let px=-10;px<=W+10;px+=8){const wx=px+cam*f;const yy=gy-h*gy*(.6+.4*Math.sin(wx*.0035+li*1.7))-(li===2?Math.max(0,Math.sin(wx*.011))*30*s:0);x.lineTo(px,yy)}x.lineTo(W,gy);x.fill()});
      // little marquee bulbs on a string, front-most backdrop layer
      const step=46*s,off=-((cam*.7)%step);x.strokeStyle='#16161c';x.lineWidth=1.5;x.beginPath();x.moveTo(0,H*.14);x.lineTo(W,H*.14);x.stroke();
      for(let px=off;px<W+step;px+=step){const on=Math.sin(t*3+px*.05)>0;x.fillStyle=on?C.a1:'#fff';x.beginPath();x.arc(px,H*.14+8*s,5*s,0,7);x.fill()}
      x.restore()},
    floor(x,{W,H,gy,s,C}){x.save();x.shadowColor='rgba(16,24,90,.25)';x.shadowOffsetY=-4*s;x.fillStyle='#2f4bff';x.fillRect(0,gy,W,H-gy);x.restore();
      x.fillStyle='#2440e6';for(let i=0;i<4;i++){x.fillRect(0,gy+(i*2+1)*(H-gy)/9,W,(H-gy)/18)}},
    layer(x,on){if(on){x.shadowColor='rgba(16,24,90,.28)';x.shadowOffsetX=4;x.shadowOffsetY=5;x.shadowBlur=0}else{x.shadowColor='transparent';x.shadowOffsetX=0;x.shadowOffsetY=0}},
    post(){},
  };
})();
/* @@END@@ */
