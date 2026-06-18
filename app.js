// Main interactions for the birthday page
(function(){
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));

  // Background music control (play when user interacts)
  const music = qs('#bg-music');
  function tryPlayMusic(){
    if(!music) return;
    const p = music.play();
    if(p && p.catch){p.catch(()=>{});} // ignore autoplay block
    window.removeEventListener('pointerdown', tryPlayMusic);
  }
  window.addEventListener('pointerdown', tryPlayMusic);

  // Typing effect
  qsa('.typing').forEach(el=>{
    const txt = el.dataset.text || '';
    let i=0;
    function step(){
      if(i<=txt.length){
        el.textContent = txt.slice(0,i);
        i++;
        setTimeout(step, 40 + Math.random()*40);
      }
    }
    step();
  });

  // Intersection reveal
  const io = new IntersectionObserver((entries)=>{
    for(const e of entries){
      if(e.isIntersecting){
        e.target.classList.add('reveal');
      }
    }
  },{threshold:0.15});

  qsa('.reason, .timeline-item, .wish, .polaroid, .letter-lines p').forEach(el=>io.observe(el));

  // Reveal letter lines sequentially
  const letterLines = qsa('.letter-lines p');
  const letterIO = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        letterLines.forEach((p,i)=>setTimeout(()=>{p.style.opacity=1;p.style.transform='none'}, i*350));
        letterIO.disconnect();
      }
    })
  },{threshold:0.4});
  const letterEl = qs('.letter-lines'); if(letterEl) letterIO.observe(letterEl);

  // Polaroid parallax based on mouse and scroll
  const polaroids = qsa('.polaroid');
  window.addEventListener('mousemove', (e)=>{
    const cx = window.innerWidth/2;
    const cy = window.innerHeight/2;
    const dx = (e.clientX - cx)/cx;
    const dy = (e.clientY - cy)/cy;
    polaroids.forEach((p,i)=>{
      const depth = 8 + i*6;
      p.style.transform = `translate3d(${dx*depth}px, ${dy*depth}px, 0) rotate(${(i-1.5)*4}deg)`;
    });
  });

  // Small parallax on scroll
  window.addEventListener('scroll', ()=>{
    const t = window.scrollY;
    polaroids.forEach((p,i)=>{
      p.style.transform = `translateY(${Math.sin((t+i*120)/300)*8}px) rotate(${(i-1.5)*4}deg)`;
    });
  });

  // Hero canvas: soft clouds and twinkling stars
  function heroCanvas(){
    const c = qs('#hero-canvas');
    if(!c) return; const ctx=c.getContext('2d');
    function resize(){c.width=c.clientWidth;c.height=c.clientHeight}
    resize(); window.addEventListener('resize', resize);
    // generate clouds
    const clouds = Array.from({length:6},(_,i)=>({x:Math.random()*c.width,y:Math.random()*c.height*0.6,scale:0.6+Math.random()*1.4,dx:(0.2+Math.random()*0.6)}));
    const stars = Array.from({length:80},()=>({x:Math.random()*c.width,y:Math.random()*c.height*0.8,r:Math.random()*1.2,alpha:Math.random()}));
    function draw(){
      ctx.clearRect(0,0,c.width,c.height);
      // gradient sky
      const g = ctx.createLinearGradient(0,0,0,c.height);
      g.addColorStop(0,'#bfe8ff');g.addColorStop(1,'#9fdfff');ctx.fillStyle=g;ctx.fillRect(0,0,c.width,c.height);
      // stars
      stars.forEach(s=>{s.alpha += (Math.random()-0.5)*0.04; s.alpha = Math.max(0.1,Math.min(1,s.alpha)); ctx.beginPath(); ctx.fillStyle=`rgba(255,255,255,${s.alpha})`; ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();});
      // clouds
      clouds.forEach(cl=>{
        cl.x += cl.dx*0.3;
        if(cl.x - 300 > c.width) cl.x = -300;
        const rad = 80*cl.scale;
        const grd = ctx.createRadialGradient(cl.x,cl.y,rad*0.2,cl.x,cl.y,rad);
        grd.addColorStop(0,'rgba(255,255,255,0.9)'); grd.addColorStop(1,'rgba(255,255,255,0.05)');
        ctx.fillStyle = grd; ctx.beginPath(); ctx.ellipse(cl.x,cl.y,rad*1.8,rad,0,0,Math.PI*2); ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }
  heroCanvas();

  // Starfield canvas with connect-to-heart formation
  function starfield(){
    const c = qs('#star-canvas'); if(!c) return; const ctx=c.getContext('2d');
    function resize(){
      c.width = c.clientWidth; c.height = c.clientHeight;
      generateStars();
      heart = drawHeartPath();
    }
    window.addEventListener('resize', resize);

    const stars = [];
    function generateStars(){
      stars.length = 0; const w = c.width, h = c.height;
      const count = Math.max(200, Math.floor((w*h)/1400));
      for(let i=0;i<count;i++){ stars.push({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.2,ox:0,oy:0}); }
    }

    function drawHeartPath(){
      const path=[]; // sample heart points centered
      const w = c.width, h = c.height; const cx = w/2, cy = h/2; const scale = Math.min(w,h)/35;
      for(let t=0;t<Math.PI*2;t+=0.09){
        const x = 16*Math.pow(Math.sin(t),3);
        const y = -(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t));
        path.push([cx + x*scale, cy + y*scale]);
      }
      return path;
    }

    generateStars();
    let heart = drawHeartPath();

    function animate(){
      ctx.clearRect(0,0,c.width,c.height);
      // draw stars
      stars.forEach(s=>{ s.x += (Math.random()-0.5)*0.6; s.y += (Math.random()-0.5)*0.6; if(s.x<0) s.x=c.width; if(s.x>c.width) s.x=0; if(s.y<0) s.y=c.height; if(s.y>c.height) s.y=0; ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.fillRect(s.x,s.y,s.r,s.r); });
      // connect nearby stars
      for(let i=0;i<stars.length;i++){
        for(let j=i+1;j<i+6 && j<stars.length;j++){
          const a=stars[i], b=stars[j]; const dx=a.x-b.x, dy=a.y-b.y; const d = Math.sqrt(dx*dx+dy*dy);
          if(d<60){ ctx.beginPath(); ctx.strokeStyle='rgba(200,180,255,'+(0.12 - d/120)+')'; ctx.lineWidth=0.7; ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
        }
      }
      // draw heart by connecting points
      if(heart && heart.length){ ctx.beginPath(); ctx.strokeStyle='rgba(200,170,255,0.16)'; ctx.lineWidth=1.2; for(let i=0;i<heart.length;i++){ const p=heart[i]; if(i===0) ctx.moveTo(p[0],p[1]); else ctx.lineTo(p[0],p[1]); } ctx.stroke(); }
      requestAnimationFrame(animate);
    }

    resize();
    animate();
  }
  starfield();

  // Confetti simple particle system
  function confetti(){
    const c = qs('#confetti-canvas'); if(!c) return; const ctx=c.getContext('2d'); function resize(){c.width=c.clientWidth;c.height=c.clientHeight} resize(); window.addEventListener('resize', resize);
    const pieces=[]; function burst(){ for(let i=0;i<160;i++){pieces.push({x:c.width/2,y:c.height/3+40,vx:(Math.random()-0.5)*8,vy:Math.random()*-9-2,rot:Math.random()*360,vr:Math.random()*6+2,color:['#bce1ff','#dfefff','#fff1f8','#cfe9ff'][Math.floor(Math.random()*4)]}) } }
    function draw(){ ctx.clearRect(0,0,c.width,c.height); pieces.forEach((p,idx)=>{ p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.rot += p.vr; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180); ctx.fillStyle=p.color; ctx.fillRect(-6,-3,12,6); ctx.restore(); if(p.y>c.height+50) pieces.splice(idx,1); }); requestAnimationFrame(draw); }
    burst(); draw();
  }

  // Launch confetti when surprise section is visible
  const surpriseEl = qs('#surprise');
  if(surpriseEl){
    const confIO = new IntersectionObserver((entries)=>{ entries.forEach(e=>{ if(e.isIntersecting){ confetti(); } }) },{threshold:0.4});
    confIO.observe(surpriseEl);
  }

})();
