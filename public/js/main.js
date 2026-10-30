// Hero: flock of birds
(function(){var h=document.querySelector('.hero'),copy=h.querySelector('.hero-copy'),svg='<svg viewBox="0 0 40 16" fill="#f4f4f4" stroke="#333" stroke-width=".6"><path d="M0 8 Q10 0 20 8 Q30 0 40 8 Q30 6 20 12 Q10 6 0 8Z"/></svg>';
for(var i=0;i<16;i++){var b=document.createElement('div');b.className='bird';b.innerHTML=svg;
b.style.top=(34+Math.random()*28)+'%';b.style.setProperty('--s',(24+Math.random()*34)+'px');
b.style.setProperty('--d',(26+Math.random()*18)+'s');b.style.setProperty('--l',(-Math.random()*40)+'s');h.insertBefore(b,copy)}})();
// Amaltas Tower windows
(function(){var b=document.querySelector('.bldg');for(var i=0;i<48;i++)b.appendChild(document.createElement('i'))})();
// Master plan: highlight the chosen zone
document.getElementById('zones').addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  document.querySelectorAll('#zones li').forEach(function(li){li.classList.remove('on')});
  b.parentNode.classList.add('on');
  document.querySelectorAll('.zone').forEach(function(z){z.classList.toggle('on',z.dataset.z===b.dataset.z)});
});

// EMI calculator
(function(){var $=function(i){return document.getElementById(i)},inr=function(n){return '\u20B9'+Math.round(n).toLocaleString('en-IN')};
function calc(){var P=+$('la').value,r=+$('ra').value/1200,n=+$('ta').value*12,e=P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
$('o1').textContent=inr(P);$('o2').textContent=$('ra').value+'%';$('o3').textContent=$('ta').value;
$('e1').textContent=inr(e);$('e2').textContent=inr(e*n-P);$('e3').textContent=inr(e*n)}
['la','ra','ta'].forEach(function(i){$(i).addEventListener('input',calc)});calc()})();

// Contact form: sends the enquiry to the backend (POST /api/contact)
(function(){
var f=document.getElementById('f'),msg=document.getElementById('msg'),
API=(document.querySelector('meta[name="api-base"]')||{}).content||'';
f.addEventListener('submit',async function(e){
e.preventDefault();
var btn=f.querySelector('button[type=submit]'),d=Object.fromEntries(new FormData(f));
d.newsletter=f.elements.newsletter.checked;
btn.disabled=true;msg.textContent='Sending...';
try{
var r=await fetch(API+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});
var j=await r.json();
if(!r.ok)throw new Error(j.error||'Something went wrong. Please try again.');
msg.textContent='Thanks, we will get back to you soon.';f.reset();
}catch(err){
msg.textContent=err instanceof TypeError?'Could not reach the server. Please call +91-888 111 0909.':err.message;
}
btn.disabled=false;
});
})();
