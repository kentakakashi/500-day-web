'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionTemplate, useReducedMotion, useSpring, useTransform } from 'motion/react';
import './TearTicket.css';

const TILT_SPRING = { stiffness: 220, damping: 24, mass: 0.6 };
const GRAVITY = 2400;
const ART_INSET = 8;
const ART_SPAN = 0.78;
const RETRACT = 0.17;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const rad = deg => (deg * Math.PI) / 180;
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
const noise = seed => { let s = seed | 0; return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const f = n => n.toFixed(2);

const buildGeometry = (W,H,S,R,holes,hole,notch,rough,vertical) => {
  const main=vertical?H:W,cross=vertical?W:H,x=main-S,hr=hole/2,n=Math.max(1,Math.round(holes)),span=cross-2*notch,bridge=Math.max(2,(span-n*hole)/(n+1)),random=noise(n*7919+Math.round(cross));
  const at=(u,v)=>vertical?{x:v,y:u}:{x:u,y:v}; const pt=(u,v)=>vertical?\`${f(v)},${f(u)}\`:\`${f(u)},${f(v)}\`;
  const arc=(r,sweep,u,v)=>\`A${f(r)},${f(r)} 0 0 ${vertical?1-sweep:sweep} ${pt(u,v)}\`;
  const bridges=[];
  for(let i=0;i<=n;i++){const y0=notch+i*(bridge+hole),y1=y0+bridge,steps=Math.max(2,Math.round(bridge/2.2)),pts=[];for(let k=1;k<steps;k++)pts.push([x+(random()-.5)*2*rough,y0+(bridge*k)/steps]);bridges.push({y0,y1,mid:(y0+y1)/2,pts,...at(x,(y0+y1)/2)});}
  let body=\`M${pt(R,0)}L${pt(x-notch,0)}${arc(notch,0,x,notch)}\`;
  bridges.forEach((b,i)=>{b.pts.forEach(p=>body+=\`L${pt(p[0],p[1])}\`);body+=\`L${pt(x,b.y1)}\`;if(i<n)body+=arc(hr,0,x,b.y1+hole);});
  body+=\`${arc(notch,0,x-notch,cross)}L${pt(R,cross)}${arc(R,1,0,cross-R)}L${pt(0,R)}${arc(R,1,R,0)}Z\`;
  let stub=\`M${pt(x+notch,0)}L${pt(main-R,0)}${arc(R,1,main,R)}L${pt(main,cross-R)}${arc(R,1,main-R,cross)}L${pt(x+notch,cross)}${arc(notch,0,x,cross-notch)}\`;
  for(let i=n;i>=0;i--){const b=bridges[i];for(let k=b.pts.length-1;k>=0;k--)stub+=\`L${pt(b.pts[k][0],b.pts[k][1])}\`;stub+=\`L${pt(x,b.y0)}\`;if(i>0)stub+=arc(hr,0,x,b.y0-hole);}
  stub+=\`${arc(notch,0,x+notch,0)}Z\`;
  const ends=[{...at(x,notch),v:notch},{...at(x,cross-notch),v:cross-notch}];
  const bodyOutline=\`M${pt(x,cross-notch)}${arc(notch,0,x-notch,cross)}L${pt(R,cross)}${arc(R,1,0,cross-R)}L${pt(0,R)}${arc(R,1,R,0)}L${pt(x-notch,0)}${arc(notch,0,x,notch)}\`;
  const stubOutline=\`M${pt(x,notch)}${arc(notch,0,x+notch,0)}L${pt(main-R,0)}${arc(R,1,main,R)}L${pt(main,cross-R)}${arc(R,1,main-R,cross)}L${pt(x+notch,cross)}${arc(notch,0,x,cross-notch)}\`;
  return {vertical,cross,body,stub,bridges,ends,bodyOutline,stubOutline};
};

export default function TearTicket({
  children=null,stub=null,image='',imageAlt='',scrim=true,imageRadius=8,orientation='horizontal',torn,defaultTorn=false,onTear,width=460,height=250,stubSize=150,radius=16,holes=12,holeSize=6,notch=3,roughness=0,tearAngle=30,stretch=30,resistance=.45,rotate=4,tilt=true,tiltMax=9,tiltReach=260,parallax=6,perspective=1000,background='#27272a',color='#f5f5f5',border=true,borderColor='',borderWidth=1,stubBackground='',recenter=true,disabled=false,ariaLabel='Tear off the stub',className=''
}) {
  const reduce=useReducedMotion(),controlled=torn!==undefined,[inner,setInner]=useState(defaultTorn),used=controlled?torn:inner,[grabbing,setGrabbing]=useState(false),[instant,setInstant]=useState(used),[fit,setFit]=useState(1);
  const rootRef=useRef(null),stageRef=useRef(null),bodyRef=useRef(null),stubRef=useRef(null),fibres=useRef([]);
  const vertical=orientation==='vertical';
  const geo=useMemo(()=>buildGeometry(width,height,stubSize,radius,holes,holeSize,notch,roughness,vertical),[width,height,stubSize,radius,holes,holeSize,notch,roughness,vertical]);
  const cfg=useRef({}); cfg.current={geo,tearAngle,stretch,resistance,height,notch,reduce,onTear,controlled};
  const sim=useRef({raf:0,last:0,phase:'idle',id:null,sign:1,hinge:{x:0,y:0},hingeV:0,grab:{x:0,y:0},start:{x:0,y:0},point:{x:0,y:0},a0:0,theta:0,thetaV:0,sx:0,sy:0,vx:0,vy:0,spin:0,pvx:0,pvy:0,pt:0,fade:1,age:0,bx:0,bv:0,snapped:[],snapAt:[],span:[]});
  const tiltX=useSpring(0,TILT_SPRING),tiltY=useSpring(0,TILT_SPRING);
  const plane=useMotionTemplate\`perspective(${perspective}px) rotate(${rotate}deg) rotateX(${tiltX}deg) rotateY(${tiltY}deg)\`;
  const depth=tiltMax>0?parallax/tiltMax:0,artX=useTransform(tiltY,v=>-v*depth),artY=useTransform(tiltX,v=>v*depth),art=useMotionTemplate\`translate(${artX}px, ${artY}px)\`,inkX=useTransform(tiltY,v=>v*depth*.22),inkY=useTransform(tiltX,v=>-v*depth*.22),ink=useMotionTemplate\`translate(${inkX}px, ${inkY}px)\`;

  useLayoutEffect(()=>{const el=rootRef.current;if(!el)return;const measure=()=>setFit(Math.min(1,el.clientWidth/width)||1);measure();const ro=new ResizeObserver(measure);ro.observe(el);return()=>ro.disconnect();},[width]);

  const paint=now=>{const s=sim.current,c=cfg.current,stubEl=stubRef.current,bodyEl=bodyRef.current;if(stubEl){stubEl.style.transform=\`translate(${s.sx.toFixed(2)}px, ${s.sy.toFixed(2)}px) rotate(${((s.theta*s.sign*180)/Math.PI).toFixed(3)}deg)\`;stubEl.style.opacity=s.fade.toFixed(3);}const up=c.geo.vertical;if(bodyEl)bodyEl.style.transform=\`translate${up?'Y':'X'}(${s.bx.toFixed(2)}px)\`;const cos=Math.cos(s.theta*s.sign),sin=Math.sin(s.theta*s.sign),lx=up?1.6:0,ly=up?0:1.6;let busy=false;
    c.geo.bridges.forEach((b,i)=>{const dx=b.x-s.hinge.x,dy=b.y-s.hinge.y,tx=s.hinge.x+dx*cos-dy*sin+s.sx,ty=s.hinge.y+dx*sin+dy*cos+s.sy,ox=b.x+(up?0:s.bx),oy=b.y+(up?s.bx:0),gx=tx-ox,gy=ty-oy,gap=Math.hypot(gx,gy),near=fibres.current[i*2],far=fibres.current[i*2+1];if(!near||!far)return;const live=s.phase!=='idle'&&!c.reduce;if(!s.snapped[i]){if(!live||gap<.35){near.style.opacity='0';far.style.opacity='0';return;}const k=clamp(gap/c.stretch,0,1),sag=gap*.18,w=(1.7-1.15*k).toFixed(2),sx=(up?sag:0)+gx/2,sy=(up?0:sag)+gy/2;near.setAttribute('d',\`M${f(ox-lx)},${f(oy-ly)}Q${f(ox-lx+sx)},${f(oy-ly+sy)} ${f(tx-lx)},${f(ty-ly)}\`);far.setAttribute('d',\`M${f(ox+lx)},${f(oy+ly)}Q${f(ox+lx+gx-sx)},${f(oy+ly+gy-sy)} ${f(tx+lx)},${f(ty+ly)}\`);near.style.strokeWidth=w;far.style.strokeWidth=w;near.style.opacity='1';far.style.opacity='1';s.span[i]=gap;return;}const t=(now-s.snapAt[i])/1000/RETRACT;if(!live||t>=1||!s.snapAt[i]){near.style.opacity='0';far.style.opacity='0';return;}busy=true;const left=(1-t)*(1-t),len=(s.span[i]||c.stretch)*.5*left,ux=gap>.01?gx/gap:1,uy=gap>.01?gy/gap:0;near.setAttribute('d',\`M${f(ox)},${f(oy)}L${f(ox+ux*len)},${f(oy+uy*len)}\`);far.setAttribute('d',\`M${f(tx)},${f(ty)}L${f(tx-ux*len)},${f(ty-uy*len)}\`);near.style.strokeWidth='.9';far.style.strokeWidth='.9';near.style.opacity=left.toFixed(2);far.style.opacity=left.toFixed(2);});return busy;};

  const finish=()=>{const c=cfg.current;if(stubRef.current)stubRef.current.style.visibility='hidden';if(!c.controlled)setInner(true);c.onTear?.();};
  const step=now=>{const s=sim.current,c=cfg.current,dt=clamp((now-s.last)/1000,.001,.034),limit=rad(c.tearAngle);
    if(s.phase==='held'){const count=c.geo.bridges.length;let intact=0;for(let i=0;i<count;i++)if(!s.snapped[i])intact++;const hold=count?intact/count:0,follow=.92*(1-clamp(c.resistance,0,.95)*hold),a=Math.atan2(s.point.y-s.hinge.y,s.point.x-s.hinge.x),want=clamp(wrap(a-s.a0)*s.sign*follow,0,limit+.1);s.theta+=(want-s.theta)*(1-Math.exp(-dt/.035));const up=c.geo.vertical,away=clamp(((up?s.point.y-s.start.y:s.point.x-s.start.x)||0)*.05,-2,4),side=clamp(((up?s.point.x-s.start.x:s.point.y-s.start.y)||0)*.05,-3,3),px=up?side:away,py=up?away:side;s.sx+=(px-s.sx)*(1-Math.exp(-dt/.05));s.sy+=(py-s.sy)*(1-Math.exp(-dt/.05));const slack=Math.hypot(s.sx,s.sy);let left=0;c.geo.bridges.forEach((b,i)=>{if(s.snapped[i])return;const d=Math.abs(b.mid-s.hingeV);if(2*d*Math.sin(s.theta/2)+slack>c.stretch||s.theta>=limit){s.snapped[i]=true;s.snapAt[i]=now;s.bv-=560/c.geo.bridges.length;}else left++;});if(left===0){s.phase='free';s.bv-=150;}}
    else if(s.phase==='free'){const cos=Math.cos(s.theta*s.sign),sin=Math.sin(s.theta*s.sign),gx=s.grab.x-s.hinge.x,gy=s.grab.y-s.hinge.y,wx=s.point.x-s.hinge.x-(gx*cos-gy*sin),wy=s.point.y-s.hinge.y-(gx*sin+gy*cos);s.sx+=(wx-s.sx)*(1-Math.exp(-dt/.045));s.sy+=(wy-s.sy)*(1-Math.exp(-dt/.045));const hang=limit*.55+clamp(s.pvx*.0009*s.sign,-.3,.3);s.theta+=(hang-s.theta)*(1-Math.exp(-dt/.12));}
    else if(s.phase==='drop'){s.age+=dt;s.vy+=GRAVITY*dt;s.sx+=s.vx*dt;s.sy+=s.vy*dt;s.theta+=s.spin*dt;if(s.age>.16)s.fade=clamp(1-(s.age-.16)/.42,0,1);if(s.fade<=0){s.phase='idle';finish();}}
    else if(s.phase==='return'){s.thetaV+=(-300*s.theta-24*s.thetaV)*dt;s.theta+=s.thetaV*dt;s.sx+=(0-s.sx)*(1-Math.exp(-dt/.07));s.sy+=(0-s.sy)*(1-Math.exp(-dt/.07));if(Math.abs(s.theta)<.0008&&Math.abs(s.thetaV)<.01&&Math.hypot(s.sx,s.sy)<.05){s.theta=0;s.thetaV=0;s.sx=0;s.sy=0;s.phase='idle';}}
    s.bv+=(-520*s.bx-30*s.bv)*dt;s.bx+=s.bv*dt;const busy=paint(now),moving=Math.abs(s.bx)>.02||Math.abs(s.bv)>.5;if(s.phase!=='idle'||moving||busy)s.raf=requestAnimationFrame(step);else{s.bx=0;s.bv=0;paint(now);s.raf=0;}};
  const run=()=>{const s=sim.current;if(s.raf)return;s.last=performance.now();s.raf=requestAnimationFrame(step);};
  const reset=()=>{const s=sim.current;cancelAnimationFrame(s.raf);Object.assign(s,{raf:0,phase:'idle',id:null,theta:0,thetaV:0,sx:0,sy:0,fade:1,age:0,bx:0,bv:0});s.snapped=[];s.snapAt=[];s.span=[];if(stubRef.current)stubRef.current.style.visibility='';paint(performance.now());};
  useEffect(()=>{if(used){const s=sim.current;if(s.phase==='idle'&&stubRef.current)stubRef.current.style.visibility='hidden';return;}setInstant(false);reset();},[used]);
  useEffect(()=>{reset();},[geo]);
  useEffect(()=>()=>cancelAnimationFrame(sim.current.raf),[]);
  const local=e=>{const r=stageRef.current.getBoundingClientRect(),k=r.width/width||1;return{x:(e.clientX-r.left)/k,y:(e.clientY-r.top)/k};};
  const tearNow=()=>{const s=sim.current;cancelAnimationFrame(s.raf);s.raf=0;s.phase='idle';setInstant(true);finish();};
  const onStubDown=e=>{const s=sim.current;if(disabled||used||e.button!==0||s.id!==null||s.phase==='drop')return;try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}const p=local(e);s.id=e.pointerId;s.start=p;s.point=p;s.pt=performance.now();s.pvx=0;s.pvy=0;if(s.theta<.01){const far=(geo.vertical?p.x:p.y)<geo.cross/2,end=geo.ends[far?1:0];s.sign=(far?1:-1)*(geo.vertical?-1:1);s.hinge={x:end.x,y:end.y};s.hingeV=end.v;if(stubRef.current)stubRef.current.style.transformOrigin=\`${s.hinge.x}px ${s.hinge.y}px\`;}const cos=Math.cos(-s.theta*s.sign),sin=Math.sin(-s.theta*s.sign),ux=p.x-s.sx-s.hinge.x,uy=p.y-s.sy-s.hinge.y;s.grab={x:s.hinge.x+ux*cos-uy*sin,y:s.hinge.y+ux*sin+uy*cos};s.a0=Math.atan2(s.grab.y-s.hinge.y,s.grab.x-s.hinge.x)-(s.theta*s.sign)/.92;s.phase='held';s.thetaV=0;tiltX.set(0);tiltY.set(0);setGrabbing(true);run();};
  const onStubMove=e=>{const s=sim.current;if(s.id!==e.pointerId)return;const p=local(e),now=performance.now(),dt=Math.max(.004,(now-s.pt)/1000);s.pvx+=((p.x-s.point.x)/dt-s.pvx)*.35;s.pvy+=((p.y-s.point.y)/dt-s.pvy)*.35;s.pt=now;s.point=p;if(cfg.current.reduce&&Math.hypot(p.x-s.start.x,p.y-s.start.y)>28){s.id=null;setGrabbing(false);tearNow();}};
  const onStubUp=e=>{const s=sim.current;if(s.id!==e.pointerId)return;s.id=null;try{if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}catch{}setGrabbing(false);if(s.phase==='free'){const still=performance.now()-s.pt>80;s.vx=still?0:clamp(s.pvx,-1600,1600);s.vy=still?0:clamp(s.pvy,-1600,1200);s.spin=clamp(s.vx*.004,-6,6)+1.2*s.sign;s.age=0;s.phase='drop';}else if(s.phase==='held')s.phase='return';run();};
  const onStubKey=e=>{if(disabled||used||(e.key!=='Enter'&&e.key!==' '))return;e.preventDefault();if(!e.repeat)tearNow();};
  useEffect(()=>{if(!tilt||reduce||disabled)return;const move=e=>{const el=rootRef.current;if(!el||e.pointerType==='touch'||sim.current.id!==null)return;const r=el.getBoundingClientRect(),nx=clamp((e.clientX-(r.left+r.width/2))/(r.width/2+tiltReach),-1,1),ny=clamp((e.clientY-(r.top+r.height/2))/(r.height/2+tiltReach),-1,1);tiltY.set(nx*tiltMax);tiltX.set(-ny*tiltMax);};window.addEventListener('pointermove',move);return()=>window.removeEventListener('pointermove',move);},[tilt,reduce,disabled,tiltMax,tiltReach,tiltX,tiltY]);

  return <div ref={rootRef} className={\`tear-ticket${className?\` ${className}\`:''}\`} data-used={used?'':undefined} data-orientation={orientation} data-shift={used&&recenter?(vertical?'y':'x'):undefined} data-instant={instant?'':undefined} data-grabbing={grabbing?'':undefined} data-disabled={disabled?'':undefined} style={{'--tt-w':\`${width}px\`,'--tt-h':\`${height}px\`,'--tt-stub':\`${stubSize}px\`,'--tt-bg':background,'--tt-stub-bg':stubBackground||background,'--tt-ink':color,'--tt-edge':borderColor||\`color-mix(in srgb, ${color} 16%, transparent)\`,'--tt-edge-w':borderWidth,'--tt-parallax':\`${parallax}px\`,'--tt-body-w':\`${vertical?width:width-stubSize}px\`,'--tt-body-h':\`${vertical?height-stubSize:height}px\`,'--tt-inset':\`${ART_INSET}px\`,'--tt-span':ART_SPAN,'--tt-art-radius':\`${imageRadius}px\`,'--tt-fit':fit,height:\`${height*fit}px\`}}>
    <div ref={stageRef} className="tear-ticket__stage"><motion.div className="tear-ticket__plane" style={{transform:plane}}>
      <div ref={bodyRef} className="tear-ticket__piece">{border?<svg className="tear-ticket__edge" viewBox={\`0 0 ${width} ${height}\`} aria-hidden="true"><path d={geo.bodyOutline}/></svg>:null}
        <div className="tear-ticket__paper" style={{clipPath:\`path('${geo.body}')\`}}>{image?<div className="tear-ticket__art"><motion.img className="tear-ticket__image" src={image} alt={imageAlt} draggable={false} style={reduce?undefined:{transform:art}}/>{scrim?<div className="tear-ticket__scrim"/>:null}</div>:null}<motion.div className="tear-ticket__content" style={reduce?undefined:{transform:ink}}>{children}</motion.div></div>
      </div>
      <svg className="tear-ticket__fibres" aria-hidden="true">{geo.bridges.map((b,i)=><g key={i}><path ref={el=>{fibres.current[i*2]=el;}}/><path ref={el=>{fibres.current[i*2+1]=el;}}/></g>)}</svg>
      <div ref={stubRef} className="tear-ticket__piece tear-ticket__piece--stub" role="button" tabIndex={disabled||used?-1:0} aria-label={ariaLabel} aria-hidden={used||undefined} aria-disabled={disabled||undefined} onPointerDown={onStubDown} onPointerMove={onStubMove} onPointerUp={onStubUp} onPointerCancel={onStubUp} onLostPointerCapture={onStubUp} onKeyDown={onStubKey} onDragStart={e=>e.preventDefault()}>
        {border?<svg className="tear-ticket__edge" viewBox={\`0 0 ${width} ${height}\`} aria-hidden="true"><path d={geo.stubOutline}/></svg>:null}
        <div className="tear-ticket__paper tear-ticket__paper--stub" style={{clipPath:\`path('${geo.stub}')\`}}><div className="tear-ticket__stub">{stub}</div></div>
      </div>
    </motion.div></div><span className="tear-ticket__sr" role="status">{used?'Used':''}</span>
  </div>;
}