import { useEffect, useRef } from 'react'

export default function Rain(){const ref=useRef();useEffect(()=>{
if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
const cv=ref.current,cx=cv.getContext('2d'),dpr=Math.min(devicePixelRatio||1,2);let W,H,ps=[],raf;
const ch=['#7a3a1d','#5a2410','#9a5230','#b8794a'],fl=['#d4a24c','#ff9db1','#ffddd4'];
const pick=a=>a[Math.random()*a.length|0];
const mk=(x,y,burst)=>{const t=Math.random(),type=t<.3?'drop':t<.6?'curl':t<.85?'nib':'flake';
const p={type,c:type==='flake'?pick(fl):pick(ch),x:x??Math.random()*W,y:y??Math.random()*H,s:4+Math.random()*7,vy:.5+Math.random()*1.1,vx:0,r:Math.random()*6,vr:(Math.random()-.5)*.05,sw:Math.random()*6};
if(burst){p.g=1;p.life=70;p.vx=(Math.random()-.5)*8;p.vy=-2-Math.random()*6;p.type=t<.6?'drop':'nib'}p.a=.55+p.s/16;return p};
const size=()=>{W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);const N=W<600?20:36;while(ps.filter(p=>!p.g).length<N)ps.push(mk())};
size();
const draw=p=>{cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillStyle=cx.strokeStyle=p.c;const s=p.s;
if(p.type==='drop'){cx.beginPath();cx.moveTo(0,-s);cx.bezierCurveTo(s*.9,0,s*.8,s*.9,0,s*.9);cx.bezierCurveTo(-s*.8,s*.9,-s*.9,0,0,-s);cx.fill();cx.fillStyle='rgba(255,255,255,.3)';cx.fillRect(-s*.4,-s*.1,s*.15,s*.4)}
else if(p.type==='curl'){cx.lineWidth=s*.45;cx.lineCap='round';cx.beginPath();cx.arc(0,0,s,0,Math.PI*1.5);cx.stroke()}
else if(p.type==='nib'){cx.beginPath();cx.roundRect?cx.roundRect(-s*.6,-s*.6,s*1.2,s*1.2,s*.3):cx.rect(-s*.6,-s*.6,s*1.2,s*1.2);cx.fill()}
else{cx.beginPath();cx.moveTo(0,-s*.9);cx.lineTo(s*.55,0);cx.lineTo(0,s*.9);cx.lineTo(-s*.55,0);cx.fill()}
cx.restore()};
const loop=()=>{cx.clearRect(0,0,W,H);
ps=ps.filter(p=>{if(p.g){p.vy+=.28;p.life--;if(p.life<=0)return false;cx.globalAlpha=Math.min(1,p.life/25)}else{cx.globalAlpha=Math.min(1,p.a);p.sw+=.015;p.x+=Math.sin(p.sw)*.35;if(p.y>H+20){p.y=-20;p.x=Math.random()*W}}
p.x+=p.vx;p.vx*=.985;p.y+=p.vy;p.r+=p.vr;draw(p);return true});cx.globalAlpha=1;raf=requestAnimationFrame(loop)};
loop();
const tap=e=>{for(let i=0;i<12;i++)ps.push(mk(e.clientX,e.clientY,1))};
addEventListener('pointerdown',tap);addEventListener('resize',size);
return()=>{cancelAnimationFrame(raf);removeEventListener('pointerdown',tap);removeEventListener('resize',size)}},[]);
return <canvas className="rain" ref={ref} aria-hidden="true" />
}

