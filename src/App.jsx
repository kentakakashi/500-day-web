import {useEffect,useState} from 'react';
import {ArrowLeft,ArrowRight,Heart,Volume2,VolumeX,X,Music2,Camera,Play,Ticket,Clapperboard,ChevronDown} from 'lucide-react';
import {memories} from './data/memories';
import TearTicket from './components/TearTicket';

const acts=['memories','celebration','letter','ending'];

function Petals(){return <div className="petal-field" aria-hidden="true">{Array.from({length:16},(_,i)=><i key={i} style={{'--i':i}}/>)}</div>}
function Curtains({open}){return <div className={'theatre-curtains '+(open?'curtains-open':'')} aria-hidden="true"><div className="curtain left-curtain"/><div className="curtain right-curtain"/><div className="curtain-top"/><div className="stage-light"/></div>}
function HouseLights(){return <div className="house-lights" aria-hidden="true">{Array.from({length:8},(_,i)=><i key={i}/>)}</div>}

function MemoryGallery({onSelect}){
 const featured=memories.slice(0,8);
 return <div className="gallery-stage">
  <div className="stage-proscenium"><span>THE LITTLE THINGS</span><b>ACT I · OUR STORY</b><span>SCENE ONE</span></div>
  <div className="stage-backdrop"><div className="stage-star star-a">✦</div><div className="stage-star star-b">·</div><div className="stage-star star-c">✦</div></div>
  <div className="gallery-cards">{featured.map((m,i)=><button key={m.id} className={'gallery-card card-'+i} onClick={()=>onSelect(i)}>
   <span className="gallery-frame"><span className="gallery-photo"><span className="gallery-placeholder"><Camera size={17}/><small>photograph {String(i+1).padStart(2,'0')}</small></span><img src={m.image} alt="" onError={e=>e.currentTarget.style.display='none'}/></span><span className="frame-caption">SCENE {String(i+1).padStart(2,'0')} · {m.title}</span></span>
  </button>)}</div>
  <div className="gallery-reel">{memories.slice(8).map((m,i)=><button key={m.id} onClick={()=>onSelect(i+8)} aria-label={'Open memory '+(i+9)}><img src={m.image} alt="" onError={e=>e.currentTarget.style.display='none'}/><span/></button>)}</div>
  <p className="stage-instruction"><Play size={12} fill="currentColor"/> choose a scene</p>
 </div>
}

function MemoryModal({index,onClose,onNext,onPrev}){
 if(index===null)return null; const m=memories[index];
 return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="memory-modal" role="dialog" aria-modal="true">
  <button className="modal-close" onClick={onClose} aria-label="Close"><X/></button><button className="modal-arrow prev" onClick={onPrev} aria-label="Previous"><ArrowLeft/></button>
  <div className="modal-photo"><div className="modal-placeholder"><Camera size={25}/><span>Your photograph</span><small>Add the matching image to <b>public/memories</b>.</small><img src={m.image} alt={m.title} onError={e=>e.currentTarget.style.display='none'}/></div></div>
  <div className="modal-copy"><span className="eyebrow">SCENE {String(index+1).padStart(2,'0')} · {m.date}</span><h3>{m.title}</h3><p>{m.note}</p><span className="modal-rule"/><small className="modal-film">FRAME {String(index+1).padStart(2,'0')} / {String(memories.length).padStart(2,'0')}</small></div>
  <button className="modal-arrow next" onClick={onNext} aria-label="Next"><ArrowRight/></button>
 </div></div>
}

export default function App(){
 const [entered,setEntered]=useState(false),[curtainsOpen,setCurtainsOpen]=useState(false),[active,setActive]=useState(0),[selected,setSelected]=useState(null),[musicOn,setMusicOn]=useState(false),[letterOpen,setLetterOpen]=useState(false),[finalOpen,setFinalOpen]=useState(false);
 useEffect(()=>{if(!entered)return;const ob=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const i=acts.indexOf(e.target.id);if(i>=0)setActive(i)}}),{threshold:.35});acts.forEach(id=>{const el=document.getElementById(id);if(el)ob.observe(el)});return()=>ob.disconnect()},[entered]);
 useEffect(()=>{const key=e=>{if(selected!==null){if(e.key==='Escape')setSelected(null);if(e.key==='ArrowRight')setSelected(v=>(v+1)%memories.length);if(e.key==='ArrowLeft')setSelected(v=>(v-1+memories.length)%memories.length)}};addEventListener('keydown',key);return()=>removeEventListener('keydown',key)},[selected]);
 const enter=()=>{if(curtainsOpen||entered)return;setCurtainsOpen(true);setTimeout(()=>{setCurtainsOpen(false);setEntered(true)},1150)};
 const go=id=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'}), change=n=>setSelected(v=>(v+n+memories.length)%memories.length);
 return <main>
  <Petals/><Curtains open={curtainsOpen}/>
  {!entered?<section className="ticket-entrance">
   <HouseLights/><div className="entrance-lamps"><i/><i/><i/><i/><i/></div>
   <div className="entrance-copy"><span className="eyebrow">A PRIVATE PERFORMANCE</span><h1>Tonight,<br/><em>Kavi's story.</em></h1><p>Please take your seat.<br/>The house lights are about to go down.</p></div>
   <div className="ticket-wrap"><TearTicket onTear={enter} width={590} height={250} stubSize={150} radius={16} holes={12} holeSize={6} notch={3} roughness={0} tearAngle={30} stretch={30} resistance={0.45} rotate={-2} tilt tiltMax={7} tiltReach={260} parallax={6} perspective={1000} background="#e9dece" color="#352927" border borderColor="#8f7d6b55" borderWidth={1} stubBackground="#e9dece" recenter ariaLabel="Tear off the entrance ticket">
    <div className="ticket-content"><div className="ticket-watermark"><Heart size={92}/></div><div className="ticket-topline"><span>OUR LITTLE FOREVER</span><span>500 DAYS</span></div><div className="ticket-main"><span className="ticket-kicker">ADMIT ONE · PRIVATE SCREENING</span><h2>Our story</h2><p>Five hundred days<br/>of us.</p><div className="ticket-meta"><span>ONE NIGHT ONLY</span><span>♥</span><span>2026</span></div></div></div>
    <div className="ticket-stub-content"><span>KEEP THIS</span><span>LITTLE PIECE</span><small>TEAR HERE</small></div>
   </TearTicket></div>
   <span className="entrance-hint">tear the ticket to begin <span>↓</span></span><div className="aisle-lights">{Array.from({length:10},(_,i)=><i key={i}/>)}</div>
  </section>:<>
   <header className="site-header theatre-header"><button className="brand" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}><Clapperboard size={14}/> OUR LITTLE FOREVER</button><nav className="top-nav">{acts.map((id,i)=><button key={id} className={active===i?'active':''} onClick={()=>go(id)}><span>0{i+1}</span>{['Act I','Act II','Act III','Finale'][i]}</button>)}</nav><button className="music-toggle" onClick={()=>setMusicOn(v=>!v)} aria-pressed={musicOn}><span>{musicOn?<Volume2 size={15}/>:<VolumeX size={15}/>}</span><small>{musicOn?'Music on':'Music off'}</small></button></header>
   <div className="chapter-progress" aria-hidden="true"><span style={{width:(active+1)*25+'%'}}/></div>
   <section id="memories" className="memory-section section-pad">
    <div className="section-heading"><span className="eyebrow">ACT I · THE ARCHIVE</span><h2>Lights up on <em>us.</em></h2><p>The first reel is made of tiny moments.</p></div>
    <MemoryGallery onSelect={setSelected}/><div className="scene-note"><span>01</span><p>Some moments are loud. Most of our favourites are not.</p><span>ACT I</span></div>
   </section>
   <section id="celebration" className="celebration-section section-pad">
    <div className="stage-curtain-mark">INTERMISSION</div><div className="celebration-copy"><span className="eyebrow">ACT II · THE MILESTONE</span><div className="spotlight-number"><small>DAY</small><strong>500</strong><em>DAYS</em></div><div className="ornament-line"><i/><span>✦</span><i/></div><h2>Still on <em>the same stage.</em></h2><p>Five hundred days of little jokes, long conversations, ordinary afternoons and moments we decided were worth remembering.</p></div>
    <div className="stage-seats" aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i}/>)}</div>
   </section>
   <section id="letter" className="letter-section section-pad">
    <div className="section-heading"><span className="eyebrow">ACT III · ONE QUIET SCENE</span><h2>A letter, <em>just for you.</em></h2><p>After all the noise, one soft spotlight.</p></div>
    <div className={'letter-card '+(letterOpen?'is-open':'')}><div className="letter-stage-light"/>{!letterOpen?<button className="letter-cover" onClick={()=>setLetterOpen(true)}><span className="letter-stamp">♥</span><span className="letter-overline">PRIVATE · FOR ONE PERSON ONLY</span><strong>To my favourite<br/><em>Kavi.</em></strong><span className="letter-open">open the letter <ChevronDown size={12}/></span></button>:<div className="letter-inside"><span className="letter-date">For you,</span><p>Five hundred days. It feels like such a small number for something that has quietly become such a big part of my life.</p><p>Thank you for the laughter, the tiny moments, the conversations that lasted too long, and all the ordinary days that somehow became my favourites.</p><p>There is still so much I want to say and so many memories we have not made yet. For now, I just want you to know how grateful I am that this is our story.</p><p className="letter-signoff">Always,<br/><em>[Your name]</em></p><button onClick={()=>setLetterOpen(false)}>← fold the letter</button></div>}</div>
   </section>
   <section id="ending" className="ending-section section-pad">
    <div className="final-stage-glow"/><span className="eyebrow">FINALE · LAST SCENE</span><div className="final-mark">✦</div><h2>And now,<br/><em>the next scene.</em></h2><p>500 days down. The house is still open.</p>{!finalOpen?<button className="ending-button" onClick={()=>setFinalOpen(true)}><Ticket size={15}/> take your final bow</button>:<div className="final-message"><span>♡</span><p>My favourite place is wherever you are.</p><small>— with all my love, for Kavi</small></div>}<div className="ending-curtain-line"><span>END OF THIS REEL</span><i>✦</i><span>MORE TO COME</span></div>
   </section>
   <footer className="site-footer">THE END · OR MAYBE JUST THE BEGINNING</footer>
  </>}
  <MemoryModal index={selected} onClose={()=>setSelected(null)} onNext={()=>change(1)} onPrev={()=>change(-1)}/>{musicOn&&<div className="music-hint"><Music2 size={14}/> Add your own audio file to enable the music control.</div>}
 </main>
}