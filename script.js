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

/* Booking Form Logic
   - Only allow fixed slots (4–5, 5:30–6:30, 7–8)
   - Simulate submission & confirmation
*/
function initBookingForm(){
  const form = $('#booking-form');
  if(!form) return;

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = $('#bk-name')?.value?.trim();
    const email = $('#bk-email')?.value?.trim();
    const slot = $('#bk-slot')?.value;

    if(!name || !email || !slot){
      toast('Please complete all fields.');
      return;
    }
    // rudimentary email check
    if(!/^\S+@\S+\.\S+$/.test(email)){
      toast('Please enter a valid email.');
      return;
    }

    toast(`Booked: ${slot}. Confirmation sent to ${email}.`);
    form.reset();
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
  initBookingForm();
  initReferralForm();
  initConsultationForm();
});
