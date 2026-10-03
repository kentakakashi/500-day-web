import {useState} from 'react';
import {motion} from 'motion/react';
import {Ticket,Scissors,Heart} from 'lucide-react';

export default function TearTicket({onTear}){
  const [torn,setTorn]=useState(false);
  const finish=()=>{if(torn)return;setTorn(true);setTimeout(onTear,850)};
  return <div className="ticket-wrap" aria-label="Entrance ticket">
    <motion.div className="ticket-shell" initial={{opacity:0,y:30,rotate:-2}} animate={{opacity:1,y:0,rotate:-2}} transition={{duration:.7,ease:[.2,.8,.2,1]}}>
      <div className="ticket-body">
        <div className="ticket-watermark"><Heart size={92}/></div>
        <div className="ticket-topline"><span>OUR LITTLE FOREVER</span><span>500 DAYS</span></div>
        <div className="ticket-main">
          <span className="ticket-kicker">ADMIT ONE · PRIVATE SCREENING</span>
          <h2>Our story</h2>
          <p>Five hundred days<br/>of us.</p>
          <div className="ticket-meta"><span>ONE NIGHT ONLY</span><span>♥</span><span>2026</span></div>
        </div>
        <div className="ticket-stub-label">KEEP THIS<br/>LITTLE PIECE</div>
      </div>
      <motion.div className="ticket-stub" drag={torn?false:'x'} dragConstraints={{left:0,right:125}} dragElastic={.08}
        onDragEnd={(_,info)=>{if(info.offset.x>55)finish()}} animate={torn?{x:190,rotate:12,opacity:0}:{x:0,rotate:0,opacity:1}} transition={{type:'spring',stiffness:280,damping:22}}>
        <div className="stub-perforations">{Array.from({length:9},(_,i)=><i key={i}/>)}</div>
        <div className="stub-content"><Ticket size={18}/><strong>TEAR HERE</strong><span>then enter</span><Scissors size={13}/></div>
      </motion.div>
    </motion.div>
    {!torn&&<button className="ticket-tap" onClick={finish}>tap to tear · or drag the stub →</button>}
  </div>
}