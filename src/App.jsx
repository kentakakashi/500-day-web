import {useEffect,useState} from 'react';
import {ArrowLeft,ArrowRight,Heart,Volume2,VolumeX,X,Music2,Camera,Play} from 'lucide-react';
import {memories} from './data/memories';
import TearTicket from './components/TearTicket';

const sections=['memories','celebration','letter','ending'];

function Petals(){return <div className="petal-field" aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i} style={{'--i':i}}/>)}</div>}
function Curtains({open}){return <div className={'theatre-curtains '+(open?'curtains-open':'')} aria-hidden="true"><div className="curtain left-curtain"/><div className="curtain right-curtain"/><div className="curtain-top"/><div className="stage-light"/></div>}
function MemoryGallery({onSelect}){const featured=memories.slice(0,7);return <div className="gallery-stage"><div className="stage-valance"><span>ACT I</span><b>MEMORIES</b><span>THE LITTLE THINGS</span></div><div className="stage-floor"/><div className="gallery-cards">{featured.map((m,i)=><button key={m.id} className={'gallery-card card-'+i} onClick={()=>onSelect(i)}><span className="gallery-frame"><span className="gallery-photo"><span className="gallery-placeholder"><Camera size={17}/><small>photograph {String(i+1).padStart(2,'0')}</small></span><img src={m.image} alt="" onError={e=>e.currentTarget.style.display='none'}/></span></span><span className="gallery-label"><small>SCENE {String(i+1).padStart(2,'0')}</small><strong>{m.title}</strong></span></button>)}</div><div className="gallery-reel">{memories.slice(7).map((m,i)=><button key={m.id} onClick={()=>onSelect(i+7)} aria-label={'Open memory '+(i+8)}><span/><img src={m.image} alt="" onError={e=>e.currentTarget.style.display='none'}/></button>)}</div><p className="stage-instruction"><Play size={12} fill="currentColor"/> choose a scene from our story</p></div>}
function MemoryModal({index,onClose,onNext,onPrev}){if(index===null)return null;const m=memories[index];return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="memory-modal" role="dialog" aria-modal="true"><button className="modal-close" onClick={onClose} aria-label="Close"><X/></button><button className="modal-arrow prev" onClick={onPrev} aria-label="Previous"><ArrowLeft/></button><div className="modal-photo"><div className="modal-placeholder"><Camera size={25}/><span>Your photograph</span><small>Add the matching image to <b>public/memories</b>.</small><img src={m.image} alt={m.title} onError={e=>e.currentTarget.style.display='none'}/></div></div><div className="modal-copy"><span className="eyebrow">scene {String(index+1).padStart(2,'0')} · {m.date}</span><h3>{m.title}</h3><p>{m.note}</p><span className="modal-rule"/></div><button className="modal-arrow next" onClick={onNext} aria-label="Next"><ArrowRight/></button></div></div>}
export default function App(){
 const [entered,setEntered]=useState(false),[curtainsOpen,setCurtainsOpen]=useState(false),[active,setActive]=useState(0),[selected,setSelected]=useState(null),[musicOn,setMusicOn]=useState(false),[letterOpen,setLetterOpen]=useState(false),[finalOpen,setFinalOpen]=useState(false);
 useEffect(()=>{if(!entered)return;const ob=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const i=sections.indexOf(e.target.id);if(i>=0)setActive(i)}}),{threshold:.3});sections.forEach(id=>{const el=document.getElementById(id);if(el)ob.observe(el)});return()=>ob.disconnect()},[entered]);
 useEffect(()=>{const key=e=>{if(selected!==null){if(e.key==='Escape')setSelected(null);if(e.key==='ArrowRight')setSelected(v=>(v+1)%memories.length);if(e.key==='ArrowLeft')setSelected(v=>(v-1+memories.length)%memories.length)}};addEventListener('keydown',key);return()=>removeEventListener('keydown',key)},[selected]);
 const enter=()=>{setCurtainsOpen(true);setTimeout(()=>setEntered(true),1150)},go=id=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'}),change=n=>setSelected(v=>(v+n+memories.length)%memories.length);
 return <main><Petals/><Curtains open={curtainsOpen}/>
 {!entered?<section className="ticket-entrance"><div className="theatre-noise"/><div className="entrance-lamps"><i/><i/><i/><i/><i/></div><div className="ticket-intro"><span className="eyebrow">THE KENTA &amp; YOU THEATRE</span><h1>Tonight,<br/><em>our story.</em></h1><p>A very small private screening<br/>for one very special person.</p><TearTicket
  onTear={enter}
  width={590}
  height={250}
  stubSize={150}
  radius={16}
  holes={12}
  holeSize={6}
  notch={3}
  roughness={0}
  tearAngle={30}
  stretch={30}
  resistance={0.45}
  rotate={-2}
  tilt
  tiltMax={7}
  tiltReach={260}
  parallax={6}
  perspective={1000}
  background="#e9dece"
  color="#352927"
  border
  borderColor="#8f7d6b55"
  borderWidth={1}
  stubBackground="#e9dece"
  recenter
  ariaLabel="Tear off the entrance ticket"
>
  <div className="ticket-content">
    <div className="ticket-watermark"><Heart size={92}/></div>
    <div className="ticket-topline"><span>OUR LITTLE FOREVER</span><span>500 DAYS</span></div>
    <div className="ticket-main"><span className="ticket-kicker">ADMIT ONE · PRIVATE SCREENING</span><h2>Our story</h2><p>Five hundred days<br/>of us.</p><div className="ticket-meta"><span>ONE NIGHT ONLY</span><span>♥</span><span>2026</span></div></div>
  </div>
  <div className="ticket-stub-content"><span>KEEP THIS</span><span>LITTLE PIECE</span><small>TEAR HERE</small></div>
</TearTicket><span className="entrance-hint">drag the stub and tear it away</span></div><div className="aisle-lights">{Array.from({length:10},(_,i)=><i key={i}/>)}</div></section>:<>
 <header className="site-header theatre-header"><a className="brand" href="#" onClick={e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'})}}>OUR LITTLE FOREVER</a><nav className="top-nav">{sections.map((id,i)=><button key={id} className={active===i?'active':''} onClick={()=>go(id)}>{['Act I','Act II','Act III','Finale'][i]}</button>)}</nav><button className="music-toggle" onClick={()=>setMusicOn(v=>!v)} aria-pressed={musicOn}><span>{musicOn?<Volume2 size={15}/>:<VolumeX size={15}/>}</span><small>{musicOn?'Music on':'Music off'}</small></button></header>
 <section id="memories" className="memory-section section-pad"><div className="section-heading"><span className="eyebrow">ACT I · THE ARCHIVE</span><h2>Scenes from <em>us.</em></h2><p>Every photograph is a little moment worth keeping.</p></div><MemoryGallery onSelect={setSelected}/></section>
 <section id="celebration" className="celebration-section section-pad"><span className="eyebrow">ACT II · THE MILESTONE</span><div className="spotlight-number"><small>DAY</small><strong>500</strong><em>DAYS</em></div><h2>And the story <em>keeps going.</em></h2><p>Five hundred days of ordinary moments that somehow became our favourite ones.</p><div className="curtain-divider"><i/><span>✦</span><i/></div><span className="script-line">intermission is not the end.</span></section>
 <section id="letter" className="letter-section section-pad"><div className="section-heading"><span className="eyebrow">ACT III · THE LETTER</span><h2>Words that don't need a <em>stage.</em></h2><p>One quiet moment, just for you.</p></div><div className={'letter-card '+(letterOpen?'is-open':'')}>{!letterOpen?<button className="letter-cover" onClick={()=>setLetterOpen(true)}><span className="letter-stamp">♥</span><span className="letter-overline">PRIVATE · FOR ONE PERSON ONLY</span><strong>To my favourite<br/><em>person.</em></strong><span className="letter-open">open curtain →</span></button>:<div className="letter-inside"><span className="letter-date">For you,</span><p>Five hundred days. It feels like such a small number for something that has quietly become such a big part of my life.</p><p>Thank you for the laughter, the tiny moments, the conversations that lasted too long, and all the ordinary days that somehow became my favourites.</p><p>There is still so much I want to say and so many memories we have not made yet. For now, I just want you to know how grateful I am that this is our story.</p><p className="letter-signoff">Always,<br/><em>Kenta</em></p><button onClick={()=>setLetterOpen(false)}>← close letter</button></div>}</div></section>
 <section id="ending" className="ending-section section-pad"><span className="eyebrow">FINALE · THE LAST SCENE</span><div className="final-mark">✦</div><h2>Thank you for<br/><em>being here.</em></h2><p>500 days down. Our story is still playing.</p>{!finalOpen?<button className="ending-button" onClick={()=>setFinalOpen(true)}>take your final bow <Heart size={15}/></button>:<div className="final-message"><span>♡</span><p>My favourite place is wherever you are.</p><small>— with all my love, Kenta</small></div>}<div className="ending-curtain-line"><span>OUR LITTLE FOREVER</span><i>✦</i><span>500 DAYS</span></div></section><footer className="site-footer">END OF ACTS · MADE WITH A LITTLE LOVE</footer>
 </>}
 <MemoryModal index={selected} onClose={()=>setSelected(null)} onNext={()=>change(1)} onPrev={()=>change(-1)}/>{musicOn&&<div className="music-hint"><Music2 size={14}/> Add your own audio file to enable the music control.</div>}</main>
}