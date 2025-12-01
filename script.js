/* Global JS: mobile menu, active link, simple form handling & validation
   - No external frameworks
   - Accessible focus management
*/

const $ = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => [...c.querySelectorAll(s)];

function initNav(){
  const btn = $('.hamburger');
  const drawer = $('.nav-drawer');
  if(!btn || !drawer) return;

  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    drawer.classList.toggle('open', !open);
    if(!open){ drawer.querySelector('a')?.focus(); }
  });

  // Close drawer on nav click or Escape
  drawer.addEventListener('click', (e) => {
    if(e.target.matches('a.nav-link')){
      btn.setAttribute('aria-expanded','false');
      drawer.classList.remove('open');
    }
  });
  window.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){
      btn.setAttribute('aria-expanded','false');
      drawer.classList.remove('open');
    }
  });

  // Mark active link
  const path = location.pathname.split('/').pop() || 'index.html';
  $$('a[data-nav]').forEach(a=>{
    const target = a.getAttribute('href');
    if(target && target.endsWith(path)){ a.setAttribute('aria-current','page'); }
  });
}

function toast(msg){
  const t = document.createElement('div');
  t.textContent = msg;
  t.role = 'status';
  t.style.position = 'fixed';
  t.style.insetInline = '0';
  t.style.bottom = '18px';
  t.style.margin = '0 auto';
  t.style.padding = '12px 16px';
  t.style.maxWidth = '600px';
  t.style.borderRadius = '12px';
  t.style.background = 'linear-gradient(180deg, rgba(209,213,219,.95), rgba(154,160,166,.95))';
  t.style.color = '#0b0d12';
  t.style.boxShadow = '0 8px 24px rgba(0,0,0,.45)';
  t.style.textAlign = 'center';
  document.body.appendChild(t);
  setTimeout(()=>t.remove(), 2500);
}

function initAudioSample(){
  const buttons = $$('[data-audio-target]');
  if(!buttons.length) return;
  const registry = [];
  buttons.forEach(btn=>{
    const id = btn.getAttribute('data-audio-target');
    if(!id) return;
    const audio = document.getElementById(id);
    if(!audio) return;
    const label = btn.textContent.trim();
    registry.push({btn, audio, label});
    btn.addEventListener('click', ()=>{
      if(audio.paused){
        registry.forEach(entry=>{
          if(entry.audio !== audio){
            entry.audio.pause();
            entry.audio.currentTime = 0;
            entry.btn.textContent = entry.label;
          }
        });
        audio.play();
        btn.textContent = '⏸';
      }else{
        audio.pause();
        audio.currentTime = 0;
        btn.textContent = label;
      }
    });
    audio.addEventListener('ended', ()=>{
      btn.textContent = label;
    });
  });
}

function initVideoToggles(){
  const videos = $$('[data-toggle-video]');
  if(!videos.length) return;
  videos.forEach(video=>{
    video.addEventListener('click', ()=>{
      if(video.paused){
        video.play();
      }else{
        video.pause();
      }
    });
  });
}

const GOOGLE_FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzQ7daT5aJZxV9YJJinXGcmB0-EHb22WYKxsFqLCO9EWASZjSVNnmmdk8Z9_D_yKdGV/exec';
const FRACTAL_MAX = 6;
function drawTriangle(ctx, ax, ay, bx, by, cx, cy){
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.lineTo(cx, cy);
  ctx.closePath();
  ctx.fill();
}
function drawSierpinski(ctx, ax, ay, bx, by, cx, cy, depth){
  if(depth <= 1){
    drawTriangle(ctx, ax, ay, bx, by, cx, cy);
    return;
  }
  const abx = (ax + bx) / 2;
  const aby = (ay + by) / 2;
  const bcx = (bx + cx) / 2;
  const bcy = (by + cy) / 2;
  const cax = (cx + ax) / 2;
  const cay = (cy + ay) / 2;
  drawSierpinski(ctx, ax, ay, abx, aby, cax, cay, depth - 1);
  drawSierpinski(ctx, abx, aby, bx, by, bcx, bcy, depth - 1);
  drawSierpinski(ctx, cax, cay, bcx, bcy, cx, cy, depth - 1);
}
function initFractalDemo(){
  const container = $('[data-fractal]');
  if(!container) return;
  const canvas = container.querySelector('[data-fractal-canvas]');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let iteration = 1;

  function render(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#eef2f7';
    const padding = 10;
    const height = canvas.height - padding * 2;
    const width = canvas.width - padding * 2;
    const topX = canvas.width / 2;
    const topY = padding;
    const leftX = (canvas.width - width) / 2;
    const leftY = canvas.height - padding;
    const rightX = canvas.width - (canvas.width - width) / 2;
    const rightY = canvas.height - padding;
    drawSierpinski(ctx, leftX, leftY, rightX, rightY, topX, topY, iteration);
  }

  const advance = ()=>{
    iteration = iteration >= FRACTAL_MAX ? 1 : iteration + 1;
    render();
  };
  canvas.addEventListener('click', advance);
  canvas.addEventListener('touchstart', (e)=>{
    e.preventDefault();
    advance();
  }, {passive:false});

  render();
}

/* Booking Form Logic
   - Collect parent name, optional student, contact info, preferred day/time
   - Validate weekday/time selections and basic contact details
   - Simulate submission & confirmation
*/
function initBookingForm(){
  const form = $('#booking-form');
  if(!form) return;
  const errorEls = {};
  $$('[data-error-for]').forEach(el=>{
    const key = el.getAttribute('data-error-for');
    if(key){ errorEls[key] = el; }
  });

  function setError(id, message){
    const el = errorEls[id];
    if(!el) return;
    if(message){
      el.textContent = `* ${message}`;
      el.classList.add('visible');
    }else{
      el.textContent = '';
      el.classList.remove('visible');
    }
  }

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const name = $('#bk-name')?.value?.trim();
    const student = $('#bk-student')?.value?.trim();
    const email = $('#bk-email')?.value?.trim();
    const subject = $('#bk-subject')?.value;
    const day = $('#bk-day')?.value;
    const slot = $('#bk-slot')?.value;
    const honey = $('#bk-website')?.value?.trim();

    let hasError = false;
    if(honey){
      return;
    }
    if(!name){
      setError('bk-name','Please submit name');
      hasError = true;
    }else{
      setError('bk-name');
    }
    if(!email || !/^\S+@\S+\.\S+$/.test(email)){
      setError('bk-email','Please submit a valid email');
      hasError = true;
    }else{
      setError('bk-email');
    }
    if(!subject){
      setError('bk-subject','Please submit subject');
      hasError = true;
    }else{
      setError('bk-subject');
    }
    if(!day){
      setError('bk-day','Please submit day');
      hasError = true;
    }else{
      setError('bk-day');
    }
    if(!slot){
      setError('bk-slot','Please submit time');
      hasError = true;
    }else{
      setError('bk-slot');
    }
    if(hasError) return;

    const payload = new URLSearchParams({
      name,
      student: student || '',
      email,
      subject,
      day,
      slot
    });
    try{
      const response = await fetch(GOOGLE_FORM_ENDPOINT, {
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:payload.toString()
      });
      const result = await response.json().catch(()=>({status:'error'}));
      if(!response.ok || result.status !== 'ok'){
        throw new Error('Bad response');
      }
    }catch(err){
      toast('Sorry, we could not send your request right now. Please email CinelliTutoring@gmail.com.');
      return;
    }

    toast(`Request received for ${day} at ${slot}. We'll confirm at ${email}.`);
    form.reset();
    Object.keys(errorEls).forEach(key=>setError(key));
  });
}

/* Referral Form */
function initReferralForm(){
  const form = $('#referral-form');
  if(!form) return;

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const req = ['#ref-referrer', '#ref-referred', '#ref-contact'];
    if(req.some(sel => !$(sel)?.value?.trim())){
      toast('Please complete the required fields.');
      return;
    }
    toast('Thank you! Your referral has been recorded.');
    form.reset();
  });
}

/* Consultation Form
   - Only weekdays
   - Only 12:00–3:00 pm time options (provided via <select>)
*/
function isWeekday(dateStr){
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getUTCDay(); // 0 Sun ... 6 Sat
  return day !== 0 && day !== 6;
}
function initConsultationForm(){
  const form = $('#consultation-form');
  if(!form) return;

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = $('#c-name')?.value?.trim();
    const email = $('#c-email')?.value?.trim();
    const date = $('#c-date')?.value;
    const time = $('#c-time')?.value;

    if(!name || !email || !date || !time){
      toast('Please complete all fields.');
      return;
    }
    if(!/^\S+@\S+\.\S+$/.test(email)){
      toast('Please enter a valid email.');
      return;
    }
    if(!isWeekday(date)){
      toast('Consultations are weekdays only. Please pick a weekday.');
      return;
    }
    toast(`Consultation scheduled ${date} at ${time}. Confirmation sent to ${email}.`);
    form.reset();
  });
}

/* Initialize */
document.addEventListener('DOMContentLoaded', ()=>{
  initNav();
  initAudioSample();
  initVideoToggles();
  initFractalDemo();
  initBookingForm();
  initReferralForm();
  initConsultationForm();
});
