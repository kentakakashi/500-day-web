import {useEffect,useState} from 'react';
import {ArrowDown,ArrowLeft,ArrowRight,Heart,Volume2,VolumeX,X,Music2,Flower2,Camera,ChevronDown} from 'lucide-react';
import {memories} from './data/memories';

const sections=['memories','celebration','letter','ending'];
const positions=[[18,27,-7],[31,20,5],[45,29,-4],[59,18,7],[73,28,-6],[25,47,5],[39,42,-7],[56,47,4],[72,45,-5],[12,63,7],[29,65,-5],[46,60,6],[63,67,-7],[80,61,5],[37,79,-4],[57,82,6],[8,43,-5],[88,40,7],[22,12,4],[81,13,-6],[50,8,3],[14,80,6],[72,82,-5],[90,77,6]];

function Petals(){return <div className="petal-field" aria-hidden="true">{Array.from({length:16},(_,i)=><i key={i} style={{'--i':i}}/>)}</div>}

function BlossomTree(){
  const blossoms=[
    [130,175,24],[172,142,29],[220,118,26],[270,132,32],[322,98,28],[376,125,31],[430,100,27],[486,136,30],[542,117,25],
    [112,222,28],[166,202,31],[224,185,27],[284,208,34],[345,178,30],[408,190,32],[470,177,28],[532,204,31],[584,223,25],
    [150,270,29],[208,248,25],[270,264,31],[337,236,27],[405,258,30],[466,242,26],[525,270,29]
  ];
  return <svg viewBox="0 0 700 650" className="tree-svg" role="img" aria-label="Hand illustrated cherry blossom tree">
    <defs>
      <linearGradient id="trunk" x1="0" x2="1"><stop stopColor="#49362f"/><stop offset=".48" stopColor="#775548"/><stop offset="1" stopColor="#3d2d29"/></linearGradient>
      <linearGradient id="branch" x1="0" x2="1"><stop stopColor="#5a4138"/><stop offset=".55" stopColor="#886353"/><stop offset="1" stopColor="#49352f"/></linearGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="8"/></filter>
    </defs>
    <ellipse cx="350" cy="620" rx="150" ry="18" fill="#58463a" opacity=".12" filter="url(#soft)"/>
    <path d="M349 620 C341 535 357 463 333 388 C310 315 259 274 189 235" fill="none" stroke="url(#trunk)" strokeWidth="43" strokeLinecap="round"/>
    <path d="M338 418 C378 337 431 287 500 224" fill="none" stroke="url(#branch)" strokeWidth="25" strokeLinecap="round"/>
    <path d="M344 478 C284 422 223 394 130 374" fill="none" stroke="url(#branch)" strokeWidth="22" strokeLinecap="round"/>
    <path d="M331 358 C330 285 343 219 354 144" fill="none" stroke="url(#branch)" strokeWidth="21" strokeLinecap="round"/>
    <path d="M378 354 C445 381 507 363 583 316" fill="none" stroke="url(#branch)" strokeWidth="20" strokeLinecap="round"/>
    <path d="M319 315 C260 305 211 278 151 222" fill="none" stroke="url(#branch)" strokeWidth="17" strokeLinecap="round"/>
    <path d="M399 301 C433 239 451 184 464 126" fill="none" stroke="url(#branch)" strokeWidth="15" strokeLinecap="round"/>
    <path d="M350 615 C350 550 370 493 361 431" fill="none" stroke="#b2876d" strokeWidth="4" strokeLinecap="round" opacity=".42"/>
    {blossoms.map(([cx,cy,r],i)=><g key={i} transform={`translate(${cx} ${cy})`} opacity=".96">
      <ellipse rx={r} ry={r*.72} fill={i%3===0?'#d98fa5':i%2===0?'#efb5c4':'#e5a3b5'}/>
      <circle cx={-r*.3} cy={-r*.08} r={r*.5} fill="#f8d8df" opacity=".72"/>
      <circle cx={r*.23} cy={r*.18} r={r*.22} fill="#fff6f0" opacity=".8"/>
    </g>)}
    {Array.from({length:34},(_,i)=><circle key={'d'+i} cx={92+(i*83)%510} cy={105+(i*47)%215} r={2+(i%3)} fill="#f8d5df" opacity=".85"/>)}
  </svg>
}

function PhotoCard({index,onClick}){
  const [x,y,r]=positions[index%positions.length];
  return <button className="photo-pin" style={{'--x':x+'%','--y':y+'%','--r':r+'deg','--delay':(index%8)*.08+'s'}} onClick={onClick} aria-label={'Open memory '+(index+1)}>
    <span className="photo-thread"/>
    <span className="photo-pin-dot"/>
    <span className="photo-paper">
      <span className="photo-image">
        <span className="photo-placeholder"><Camera size={16}/><small>add photo</small></span>
        <img className="memory-thumb" src={memories[index].image} alt="" onError={e=>e.currentTarget.style.display='none'}/>
      </span>
      <span className="photo-caption">{String(index+1).padStart(2,'0')} · little memory</span>
    </span>
  </button>
}

function MemoryModal({index,onClose,onNext,onPrev}){
  if(index===null)return null;
  const m=memories[index];
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <div className="memory-modal" role="dialog" aria-modal="true" aria-label={m.title}>
      <button className="icon-button modal-close" onClick={onClose} aria-label="Close"><X/></button>
      <button className="modal-arrow prev" onClick={onPrev} aria-label="Previous memory"><ArrowLeft/></button>
      <div className="modal-photo"><div className="modal-placeholder">
        <Camera size={28}/>
        <span>Your photograph</span>
        <small>Add the matching image to <b>public/memories</b>.</small>
        <img className="modal-memory-image" src={m.image} alt={m.title} onError={e=>e.currentTarget.style.display='none'}/>
      </div></div>
      <div className="modal-copy">
        <span className="eyebrow">memory {String(index+1).padStart(2,'0')}</span>
        <h3>{m.title}</h3><p>{m.note}</p><span className="modal-date">{m.date}</span>
      </div>
      <button className="modal-arrow next" onClick={onNext} aria-label="Next memory"><ArrowRight/></button>
    </div>
  </div>
}

export default function App(){
  const [entered,setEntered]=useState(false),[active,setActive]=useState(0),[selected,setSelected]=useState(null),[musicOn,setMusicOn]=useState(false),[letterOpen,setLetterOpen]=useState(false),[finalOpen,setFinalOpen]=useState(false);
  useEffect(()=>{if(!entered)return;const ob=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){const i=sections.indexOf(e.target.id);if(i>=0)setActive(i)}}),{threshold:.3});sections.forEach(id=>{const el=document.getElementById(id);if(el)ob.observe(el)});return()=>ob.disconnect()},[entered]);
  useEffect(()=>{const onKey=e=>{if(selected!==null){if(e.key==='Escape')setSelected(null);if(e.key==='ArrowRight')setSelected(v=>(v+1)%memories.length);if(e.key==='ArrowLeft')setSelected(v=>(v-1+memories.length)%memories.length)}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[selected]);
  const go=id=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'});
  const change=step=>setSelected(v=>(v+step+memories.length)%memories.length);
  return <main>
    <Petals/>
    <header className="site-header">
      <a className="brand" href="#" onClick={e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'})}}><span className="brand-mark"><Flower2 size={15}/></span> our little forever</a>
      {entered&&<nav className="top-nav">{sections.map((id,i)=><button key={id} className={active===i?'active':''} onClick={()=>go(id)}>{['Memories','500 days','Letter','For you'][i]}</button>)}</nav>}
      <button className="music-toggle" onClick={()=>setMusicOn(v=>!v)} aria-pressed={musicOn}><span>{musicOn?<Volume2 size={15}/>:<VolumeX size={15}/>}</span><small>{musicOn?'Music on':'Music off'}</small></button>
    </header>

    {!entered?<section className="entrance">
      <div className="entrance-orbit orbit-one"/><div className="entrance-orbit orbit-two"/>
      <div className="entrance-content"><span className="eyebrow entrance-kicker"><i/> a little world, just for us <i/></span>
        <div className="entrance-flower">❀</div>
        <h1>For my <em>favourite</em><br/>person <span className="heart-inline">♡</span></h1>
        <p>Five hundred days of little things, big feelings,<br className="desktop-break"/> and a love that keeps blooming.</p>
        <button className="enter-button" onClick={()=>{setEntered(true);setTimeout(()=>go('memories'),150)}}>Step inside <ArrowRight size={16}/></button>
        <span className="entrance-note">made slowly, with love</span>
      </div>
      <div className="entrance-vine vine-left"><span>❀</span><i/><b>❀</b></div><div className="entrance-vine vine-right"><span>❀</span><i/><b>❀</b></div>
      <div className="scroll-hint">open our little world <ChevronDown size={14}/></div>
    </section>:<>
      <section id="memories" className="memory-section section-pad">
        <div className="section-heading"><span className="eyebrow">chapter one · all the little things</span><h2>Our story, in <em>bloom.</em></h2><p>Photographs from the days that became our favourite memories.</p></div>
        <div className="tree-stage"><div className="sun-halo"/><div className="tree-art"><BlossomTree/></div><div className="photo-layer">{memories.map((m,i)=><PhotoCard key={m.id} index={i} onClick={()=>setSelected(i)}/>)}</div><div className="tree-caption"><span>✿</span> choose a photograph <span>✿</span></div></div>
        <div className="section-footnote"><span className="tiny-line"/> 24 little windows into our world <span className="tiny-line"/></div>
      </section>

      <section id="celebration" className="celebration-section section-pad">
        <div className="celebration-paper"/>
        <div className="celebration-content"><span className="eyebrow">chapter two · a little milestone</span>
          <div className="number-wrap"><span className="number-side">day</span><div className="big-number">500</div><span className="days-word">days</span></div>
          <h2>Five hundred days of <em>us.</em></h2>
          <p>Not a grand declaration. Just five hundred ordinary days made softer, funnier and more meaningful because we shared them.</p>
          <div className="celebration-rule"><span>✿</span><i/><span>✿</span></div><p className="small-script">and there are still so many pages left to write.</p>
        </div>
        <div className="paper-edge edge-left"/><div className="paper-edge edge-right"/>
      </section>

      <section id="letter" className="letter-section section-pad">
        <div className="section-heading"><span className="eyebrow">chapter three · words from my heart</span><h2>A letter, <em>just for you.</em></h2><p>Some things deserve more than a passing moment.</p></div>
        <div className={'letter-card '+(letterOpen?'is-open':'')}>
          <div className="letter-seal">K<span>♥</span></div>
          {!letterOpen?<button className="letter-cover" onClick={()=>setLetterOpen(true)}><span className="letter-overline">a private little note</span><span className="letter-title">To my favourite<br/><em>person</em></span><span className="letter-open">open the envelope <ArrowRight size={14}/></span></button>:<div className="letter-inside">
            <span className="letter-date">For you,</span>
            <p>Five hundred days. It feels like such a small number for something that has quietly become such a big part of my life.</p>
            <p>Thank you for the laughter, the tiny moments, the conversations that lasted too long, and all the ordinary days that somehow became my favourites.</p>
            <p>There is still so much I want to say and so many memories we have not made yet. For now, I just want you to know how grateful I am that this is our story.</p>
            <p className="letter-signoff">Always,<br/><span>Kenta</span></p>
            <button className="text-button" onClick={()=>setLetterOpen(false)}><ArrowLeft size={13}/> fold the letter</button>
          </div>}
        </div>
        <p className="edit-reminder">Replace the starter letter with your own words before sharing.</p>
      </section>

      <section id="ending" className="ending-section section-pad">
        <div className="ending-sun"/><span className="eyebrow">one last thing</span><div className="ending-flower">❀</div>
        <h2>My favourite place<br/>is <em>wherever you are.</em></h2><p>Thank you for making these 500 days ours.</p>
        {!finalOpen?<button className="ending-button" onClick={()=>setFinalOpen(true)}>One more little thing <Heart size={15}/></button>:<div className="final-message"><span>♡</span><p>Out of all the beautiful things in this world, I am happiest that our paths crossed.</p><small>— with all my love, Kenta</small></div>}
        <div className="ending-bottom">our little forever <span>✧</span> 500 days and counting</div>
      </section>
    </>}

    <footer className="site-footer"><span>made with a little love</span><Heart size={11} fill="currentColor"/><span>our little forever</span></footer>
    <MemoryModal index={selected} onClose={()=>setSelected(null)} onNext={()=>change(1)} onPrev={()=>change(-1)}/>
    {musicOn&&<div className="music-hint"><Music2 size={14}/> Add your own audio file to enable the music control.</div>}
  </main>
}