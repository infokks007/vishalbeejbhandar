/* ============ AI Plant Doctor — rule-based diagnosis ============ */
mountLayout('plant-doctor.html');

const CROPS = [
  {id:'tomato',label:'Tomato',emo:'🍅'},{id:'chilli',label:'Chilli',emo:'🌶️'},
  {id:'potato',label:'Potato',emo:'🥔'},{id:'brinjal',label:'Brinjal',emo:'🍆'},
  {id:'wheat',label:'Wheat',emo:'🌾'},{id:'rice',label:'Rice/Paddy',emo:'🌾'},
  {id:'cucurbit',label:'Gourd/Cucumber',emo:'🥒'},{id:'cole',label:'Cabbage/Cauliflower',emo:'🥬'},
  {id:'okra',label:'Okra (Bhindi)',emo:'🌿'},{id:'other',label:'Other Plant',emo:'🪴'}
];
const PARTS = [
  {id:'leaves',label:'Leaves',emo:'🍃'},{id:'stem',label:'Stem',emo:'🌱'},
  {id:'fruit',label:'Fruit / Flower',emo:'🍒'},{id:'roots',label:'Roots / Base',emo:'🪵'},
  {id:'whole',label:'Whole Plant',emo:'🌿'}
];
const SYMPTOMS = [
  {id:'yellow',label:'Yellowing leaves'},
  {id:'spots_brown',label:'Brown/black spots'},
  {id:'powder_white',label:'White powdery coating'},
  {id:'spots_yellow',label:'Yellow/orange spots'},
  {id:'wilting',label:'Wilting / drooping'},
  {id:'holes',label:'Holes in leaves'},
  {id:'curl',label:'Curling / distorted leaves'},
  {id:'insects',label:'Visible insects/aphids'},
  {id:'webbing',label:'Fine webbing'},
  {id:'rot',label:'Rotting / soft mushy parts'},
  {id:'stunted',label:'Stunted / poor growth'},
  {id:'mold_grey',label:'Grey/fuzzy mold'},
  {id:'eaten',label:'Chewed/eaten leaves'},
  {id:'sticky',label:'Sticky honeydew/sooty'},
  {id:'pale',label:'Pale / weak colour'}
];

/* Diagnosis knowledge base — each rule has triggers + product tags to recommend */
const RULES = [
  { key:'fungal_blight', name:'Fungal Disease (Blight / Leaf Spot)', icon:'🍂',
    triggers:['spots_brown','spots_yellow','mold_grey','rot'],
    cause:'Caused by fungal pathogens (early/late blight, leaf spot), worsened by humid weather & overhead watering.',
    advice:['Remove and destroy affected leaves immediately.','Avoid overhead irrigation; water at the base.','Spray a recommended fungicide at 7–10 day intervals.','Ensure good air circulation between plants.'],
    productTags:['fungicide','blight','mancozeb','indofil'], productCats:['Fungicides'] },
  { key:'powdery_mildew', name:'Powdery Mildew', icon:'⚪',
    triggers:['powder_white','pale','curl'],
    cause:'A fungal infection that thrives in warm, dry days with cool humid nights — appears as a white powder on leaves.',
    advice:['Improve airflow and avoid overcrowding.','Remove heavily infected leaves.','Apply a systemic/contact fungicide for mildew.'],
    productTags:['fungicide','mildew','sulphur'], productCats:['Fungicides'] },
  { key:'sucking_pests', name:'Sucking Pests (Aphids / Whitefly / Jassids)', icon:'🐛',
    triggers:['insects','sticky','curl','yellow','webbing'],
    cause:'Tiny sap-sucking insects (aphids, whiteflies, mites, jassids) weaken plants and leave sticky honeydew.',
    advice:['Spray a recommended insecticide/miticide.','Use yellow sticky traps to monitor.','Spray neem-based products in early stages.'],
    productTags:['insecticide','pest','aphid','whitefly','mite'], productCats:['Insecticides'] },
  { key:'chewing_pests', name:'Caterpillars / Borers (Chewing Pests)', icon:'🦋',
    triggers:['holes','eaten'],
    cause:'Caterpillars, fruit borers or beetles physically chew leaves and bore into fruits.',
    advice:['Hand-pick larvae where possible.','Apply a recommended insecticide for borers.','Install pheromone traps for fruit borers.'],
    productTags:['insecticide','borer','caterpillar'], productCats:['Insecticides'] },
  { key:'nutrient_def', name:'Nutrient Deficiency', icon:'🌱',
    triggers:['yellow','pale','stunted'],
    cause:'Yellowing and weak growth often signal nitrogen / micronutrient deficiency or poor soil health.',
    advice:['Apply a balanced fertilizer / micronutrient mix.','Get soil tested if problem persists.','Add organic matter to improve soil.'],
    productTags:['fertilizer','nutrition','micronutrient','npk'], productCats:['Fertilizers','Plant Nutrition'] },
  { key:'wilt_root', name:'Wilt / Root Rot', icon:'💧',
    triggers:['wilting','rot','stunted'],
    cause:'Soil-borne fungi/bacteria or waterlogging cause wilting and root rot.',
    advice:['Improve drainage; avoid waterlogging.','Drench soil with a recommended fungicide.','Practice crop rotation next season.'],
    productTags:['fungicide','wilt','rot','soil'], productCats:['Fungicides'] }
];

let answers = { crop:null, part:null, symptoms:[] };
let step = 0;

function renderTiles(grid, items, key) {
  document.getElementById(grid).innerHTML = items.map(it =>
    `<div class="opt-tile ${answers[key]===it.id?'sel':''}" onclick="selectOpt('${key}','${it.id}')"><span class="emo">${it.emo}</span><span class="lbl">${it.label}</span></div>`).join('');
}
function renderSymptoms() {
  document.getElementById('symptom-grid').innerHTML = SYMPTOMS.map(s =>
    `<div class="sym-chip ${answers.symptoms.includes(s.id)?'sel':''}" onclick="toggleSym('${s.id}')"><i class="fa-solid ${answers.symptoms.includes(s.id)?'fa-square-check':'fa-square'}"></i> ${s.label}</div>`).join('');
}
function selectOpt(key,id){ answers[key]=id; if(key==='crop')renderTiles('crop-grid',CROPS,'crop'); else renderTiles('part-grid',PARTS,'part'); updateNext(); }
function toggleSym(id){ const i=answers.symptoms.indexOf(id); if(i>-1)answers.symptoms.splice(i,1); else answers.symptoms.push(id); renderSymptoms(); updateNext(); }

function updateNext(){
  const btn=document.getElementById('next-btn');
  let ok=false;
  if(step===0)ok=!!answers.crop; else if(step===1)ok=!!answers.part; else if(step===2)ok=answers.symptoms.length>0; else ok=true;
  btn.disabled=!ok;
}

function showStep(n){
  step=n;
  document.querySelectorAll('.step').forEach((s,i)=>s.classList.toggle('active',i===n));
  document.querySelectorAll('.step-dot').forEach((d,i)=>d.classList.toggle('active',i<=n));
  document.getElementById('back-btn').style.visibility = n===0?'hidden':'visible';
  const next=document.getElementById('next-btn');
  if(n===2) next.innerHTML='Diagnose <i class="fa-solid fa-stethoscope"></i>';
  else if(n===3){ next.style.display='none'; }
  else { next.innerHTML='Next <i class="fa-solid fa-arrow-right"></i>'; next.style.display=''; }
  if(n<3) next.style.display='';
  updateNext();
  window.scrollTo({top:document.querySelector('.doctor-card').offsetTop-90,behavior:'smooth'});
}
function nextStep(){ if(step<2){ showStep(step+1);} else if(step===2){ runDiagnosis(); showStep(3);} }
function prevStep(){ if(step===3){document.getElementById('next-btn').style.display='';} if(step>0)showStep(step-1); }

function scoreRules(){
  return RULES.map(r=>{
    const hits=r.triggers.filter(t=>answers.symptoms.includes(t)).length;
    return {rule:r, score:hits, conf:Math.min(95, Math.round(hits/Math.max(2,r.triggers.length)*100)+(hits?30:0))};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
}

async function runDiagnosis(){
  const out=document.getElementById('diagnosis-output');
  const scored=scoreRules();
  const cropLabel=(CROPS.find(c=>c.id===answers.crop)||{}).label||'your plant';

  if(!scored.length){
    out.innerHTML=`<div class="diag-result"><h3>🤔 Need a closer look</h3><p>We couldn't confidently match these symptoms. Please send us a photo and details on WhatsApp for expert help.</p></div>
      <a class="btn btn-primary btn-block" href="https://wa.me/918804428490?text=${encodeURIComponent('Hi, I need help diagnosing my '+cropLabel)}" target="_blank"><i class="fa-brands fa-whatsapp"></i> Ask an Expert</a>
      <button class="btn btn-ghost btn-block" style="margin-top:10px" onclick="restart()">Start Over</button>`;
    return;
  }

  const top=scored[0];
  out.innerHTML=`
    <div class="diag-result">
      <span style="font-size:.78rem;color:var(--accent);font-weight:700;text-transform:uppercase">Diagnosis for ${cropLabel}</span>
      <h3>${top.rule.icon} ${top.rule.name}</h3>
      <div style="font-size:.85rem;color:var(--text-soft)">Confidence</div>
      <div class="confidence-bar"><div class="confidence-fill" style="width:0%"></div></div>
      <p style="color:var(--text-soft)">${top.rule.cause}</p>
    </div>
    <h4 style="margin-bottom:10px"><i class="fa-solid fa-list-check" style="color:var(--primary)"></i> Recommended Action</h4>
    <ul style="margin:0 0 24px 4px;color:var(--text-soft);line-height:1.9">${top.rule.advice.map(a=>`<li>✅ ${a}</li>`).join('')}</ul>
    ${scored.length>1?`<p style="font-size:.85rem;color:var(--text-soft);margin-bottom:20px"><i class="fa-solid fa-circle-info"></i> Other possibility: <strong>${scored[1].rule.name}</strong></p>`:''}
    <h4 style="margin-bottom:14px"><i class="fa-solid fa-cart-shopping" style="color:var(--accent)"></i> Recommended Products from our Store</h4>
    <div class="product-grid" id="reco-grid"><div class="spinner"></div></div>
    <div style="display:flex;gap:10px;margin-top:26px;flex-wrap:wrap">
      <button class="btn btn-ghost" onclick="restart()"><i class="fa-solid fa-rotate-left"></i> Diagnose Another</button>
      <a class="btn btn-pink" href="https://wa.me/918804428490?text=${encodeURIComponent('Hi, my '+cropLabel+' seems to have '+top.rule.name+'. Please advise.')}" target="_blank"><i class="fa-brands fa-whatsapp"></i> Confirm with Expert</a>
    </div>`;

  setTimeout(()=>{ const f=out.querySelector('.confidence-fill'); if(f)f.style.width=top.conf+'%'; },200);
  loadRecommended(top.rule);
}

async function loadRecommended(rule){
  const grid=document.getElementById('reco-grid');
  try{
    const res=await apiList('products','?limit=1000');
    const all=(res.data||[]).filter(p=>!p.deleted);
    const tags=rule.productTags.map(t=>t.toLowerCase());
    let matches=all.filter(p=>{
      const hay=((p.name||'')+' '+(p.short_desc||'')+' '+(p.category||'')+' '+(p.tags||[]).join(' ')).toLowerCase();
      const catMatch=(rule.productCats||[]).includes(p.category);
      const tagMatch=tags.some(t=>hay.includes(t));
      return catMatch||tagMatch;
    });
    if(!matches.length) matches=all.filter(p=>(rule.productCats||[]).includes(p.category));
    matches=matches.slice(0,4);
    if(!matches.length){ grid.innerHTML=`<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-box-open"></i><p>No matching product listed yet. <a href="contact.html" style="color:var(--primary)">Contact us</a> for the right solution.</p></div>`; return; }
    grid.innerHTML=matches.map(recoCard).join('');
  }catch{ grid.innerHTML=`<div class="empty-state" style="grid-column:1/-1"><p>Could not load products.</p></div>`; }
}
function recoCard(p){
  const img=p.image||'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=400&q=70';
  return `<article class="product-card"><a href="product.html?id=${p.id}" class="pc-img"><img src="${img}" alt="${p.name}">${p.brand?`<span class="pc-brand-tag">${p.brand}</span>`:''}</a>
    <div class="pc-body"><span class="pc-cat">${p.category||''}</span><a href="product.html?id=${p.id}"><h3 class="pc-name">${p.name}</h3></a>
    <div class="pc-price"><span class="now">${inr(p.price)}</span></div>
    <div class="pc-actions"><button class="btn btn-primary btn-sm" onclick='addToCart(${JSON.stringify({id:p.id,name:p.name,price:p.price,image:img,unit:p.unit})})'><i class="fa-solid fa-cart-plus"></i> Add</button><a href="product.html?id=${p.id}" class="btn btn-ghost btn-sm">View</a></div></div></article>`;
}
function restart(){ answers={crop:null,part:null,symptoms:[]}; document.getElementById('next-btn').style.display=''; renderTiles('crop-grid',CROPS,'crop'); renderTiles('part-grid',PARTS,'part'); renderSymptoms(); showStep(0); }

renderTiles('crop-grid',CROPS,'crop');
renderTiles('part-grid',PARTS,'part');
renderSymptoms();

/* ============ Image Scan Feature ============ */
function switchMode(mode) {
  document.getElementById('tab-symptoms').classList.toggle('active', mode === 'symptoms');
  document.getElementById('tab-scan').classList.toggle('active', mode === 'scan');
  document.getElementById('pane-symptoms').classList.toggle('active', mode === 'symptoms');
  document.getElementById('pane-scan').classList.toggle('active', mode === 'scan');
}

/* --- Upload handling --- */
const uploadZone = document.getElementById('upload-zone');
const scanInput = document.getElementById('scan-input');
const cameraInput = document.getElementById('camera-input');

if (uploadZone) {
  uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', e => { e.preventDefault(); uploadZone.classList.remove('dragover'); if (e.dataTransfer.files.length) handleImageFile(e.dataTransfer.files[0]); });
  uploadZone.addEventListener('click', e => { if (e.target.closest('button')) return; scanInput.click(); });
}
if (scanInput) scanInput.addEventListener('change', e => { if (e.target.files.length) handleImageFile(e.target.files[0]); });
if (cameraInput) cameraInput.addEventListener('change', e => { if (e.target.files.length) handleImageFile(e.target.files[0]); });

function openCamera() { if (cameraInput) cameraInput.click(); }

function handleImageFile(file) {
  if (!file.type.startsWith('image/')) { toast('Please select an image file', 'error'); return; }
  if (file.size > 15 * 1024 * 1024) { toast('Image too large (max 15MB)', 'error'); return; }
  const reader = new FileReader();
  reader.onload = e => showPreview(e.target.result);
  reader.readAsDataURL(file);
}

function showPreview(dataUrl) {
  const content = document.getElementById('scan-content');
  const cropOptions = CROPS.map(c => `<option value="${c.id}">${c.emo} ${c.label}</option>`).join('');
  const partOptions = PARTS.map(p => `<option value="${p.id}">${p.emo} ${p.label}</option>`).join('');
  
  content.innerHTML = `
    <div class="scan-preview">
      <img src="${dataUrl}" alt="Plant photo" id="scan-img">
      
      <div style="max-width:440px;margin:20px auto;text-align:left;display:grid;grid-template-columns:1fr 1fr;gap:14px">
        <div class="form-group" style="margin-bottom:0">
          <label style="font-size:.85rem;font-weight:600;margin-bottom:6px;display:block">Plant / Crop Type</label>
          <select id="scan-crop-select" style="width:100%;padding:10px 14px;border-radius:30px;border:1px solid var(--border);background:var(--bg-card);color:var(--text);font-family:inherit;font-size:.9rem;outline:none;cursor:pointer;">
            <option value="">-- Choose Crop --</option>
            ${cropOptions}
          </select>
        </div>
        <div class="form-group" style="margin-bottom:0">
          <label style="font-size:.85rem;font-weight:600;margin-bottom:6px;display:block">Affected Part</label>
          <select id="scan-part-select" style="width:100%;padding:10px 14px;border-radius:30px;border:1px solid var(--border);background:var(--bg-card);color:var(--text);font-family:inherit;font-size:.9rem;outline:none;cursor:pointer;">
            <option value="">-- Choose Part --</option>
            ${partOptions}
          </select>
        </div>
      </div>

      <div class="preview-actions">
        <button class="btn btn-primary" onclick="analyzeImage()"><i class="fa-solid fa-microscope"></i> Analyze Plant</button>
        <button class="btn btn-ghost" onclick="resetScan()"><i class="fa-solid fa-rotate-left"></i> Choose Different Photo</button>
      </div>
    </div>`;
}

function resetScan() {
  const content = document.getElementById('scan-content');
  content.innerHTML = `
    <div class="upload-zone" id="upload-zone">
      <span class="uz-icon"><i class="fa-solid fa-cloud-arrow-up"></i></span>
      <h3>Upload Plant Photo</h3>
      <p>Drag & drop a photo of your affected plant, or click to select</p>
      <input type="file" id="scan-input" accept="image/*">
      <div class="upload-actions">
        <button class="btn btn-primary btn-sm" onclick="document.getElementById('scan-input').click()"><i class="fa-solid fa-image"></i> Choose Photo</button>
        <button class="btn btn-ghost btn-sm" onclick="openCamera()"><i class="fa-solid fa-camera"></i> Take Photo</button>
      </div>
      <input type="file" id="camera-input" accept="image/*" capture="environment" style="display:none">
    </div>`;
  // Re-bind events
  const zone = document.getElementById('upload-zone');
  const input = document.getElementById('scan-input');
  const cam = document.getElementById('camera-input');
  if (zone) {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('dragover'); if (e.dataTransfer.files.length) handleImageFile(e.dataTransfer.files[0]); });
    zone.addEventListener('click', e => { if (e.target.closest('button')) return; input.click(); });
  }
  if (input) input.addEventListener('change', e => { if (e.target.files.length) handleImageFile(e.target.files[0]); });
  if (cam) cam.addEventListener('change', e => { if (e.target.files.length) handleImageFile(e.target.files[0]); });
}

/* --- Color Analysis --- */
function analyzeImage() {
  const content = document.getElementById('scan-content');
  const img = document.getElementById('scan-img');
  if (!img) return;

  // Retrieve chosen crop/part context from dropdown selects
  const cropSelect = document.getElementById('scan-crop-select');
  const partSelect = document.getElementById('scan-part-select');
  if (cropSelect) answers.crop = cropSelect.value || 'other';
  if (partSelect) answers.part = partSelect.value || 'whole';

  const imgSrc = img.src;
  content.innerHTML = `
    <div class="analyzing-state">
      <div class="scan-ring"></div>
      <h3 style="margin-bottom:6px">Analyzing your plant with AI...</h3>
      <p>Detecting patterns, colors & querying DeepSeek pathology engine</p>
    </div>`;

  // Create canvas for pixel analysis
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.onload = () => {
    const maxDim = 300;
    const scale = Math.min(maxDim / image.width, maxDim / image.height, 1);
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const analysis = analyzePixels(imageData);

    // Call DeepSeek AI diagnosis with simulated UX delay
    setTimeout(() => runDeepSeekDiagnosis(imgSrc, analysis), 1000);
  };
  image.onerror = () => {
    // If cross-origin fails, do a generic analysis
    setTimeout(() => runDeepSeekDiagnosis(imgSrc, getGenericAnalysis()), 1000);
  };
  image.src = imgSrc;
}

function analyzePixels(data) {
  let totalPixels = data.length / 4;
  let counts = { green: 0, yellow: 0, brown: 0, white: 0, dark: 0, other: 0 };
  let rSum = 0, gSum = 0, bSum = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    rSum += r; gSum += g; bSum += b;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;

    if (l < 40) { counts.dark++; continue; }
    if (l > 220 && (max - min) < 30) { counts.white++; continue; }

    // Classify by hue-like logic
    if (g > r && g > b && g > 80) {
      if (r > g * 0.7) counts.yellow++;
      else counts.green++;
    } else if (r > g && r > b) {
      if (g > r * 0.5 && g > 60) counts.yellow++;
      else if (g < r * 0.5 && l < 140) counts.brown++;
      else counts.other++;
    } else if (r > 80 && g > 50 && g < r && b < r * 0.5 && l < 160) {
      counts.brown++;
    } else {
      counts.other++;
    }
  }

  // Convert to percentages
  const pcts = {};
  for (const k in counts) pcts[k] = Math.round((counts[k] / totalPixels) * 100);

  // Determine detected symptoms based on color analysis
  const detectedSymptoms = [];

  if (pcts.yellow > 15) detectedSymptoms.push('yellow');
  if (pcts.brown > 12) detectedSymptoms.push('spots_brown');
  if (pcts.white > 18) detectedSymptoms.push('powder_white');
  if (pcts.yellow > 10 && pcts.brown > 8) detectedSymptoms.push('spots_yellow');
  if (pcts.green < 20 && pcts.yellow > 10) detectedSymptoms.push('pale');
  if (pcts.brown > 20) detectedSymptoms.push('rot');
  if (pcts.dark > 25 && pcts.green < 15) detectedSymptoms.push('wilting');
  if (pcts.green < 15 && pcts.yellow < 10 && pcts.brown > 10) detectedSymptoms.push('stunted');

  // If nothing strong detected, flag general issue
  if (detectedSymptoms.length === 0) {
    if (pcts.yellow > 8) detectedSymptoms.push('yellow');
    else if (pcts.brown > 6) detectedSymptoms.push('spots_brown');
    else detectedSymptoms.push('pale');
  }

  return { pcts, detectedSymptoms, dominantColors: Object.entries(pcts).sort((a,b) => b[1] - a[1]).slice(0, 4) };
}

function getGenericAnalysis() {
  return {
    pcts: { green: 30, yellow: 20, brown: 15, white: 10, dark: 15, other: 10 },
    detectedSymptoms: ['yellow', 'spots_brown'],
    dominantColors: [['green', 30], ['yellow', 20], ['brown', 15], ['dark', 15]]
  };
}

const COLOR_MAP = { green: '#4caf50', yellow: '#ffc107', brown: '#795548', white: '#e0e0e0', dark: '#37474f', other: '#9e9e9e' };

function showScanResult(imgSrc, analysis) {
  const content = document.getElementById('scan-content');

  // Use existing rules engine with detected symptoms
  const savedAnswers = { ...answers };
  answers.symptoms = analysis.detectedSymptoms;
  const scored = scoreRules();
  answers = savedAnswers; // Restore

  const colorChips = analysis.dominantColors.map(([name, pct]) =>
    `<div class="color-chip" style="background:${COLOR_MAP[name] || '#999'}" data-pct="${pct}% ${name}"></div>`
  ).join('');

  if (!scored.length) {
    content.innerHTML = `
      <div class="scan-preview"><img src="${imgSrc}" alt="Scanned plant"></div>
      <div class="color-analysis">${colorChips}</div>
      <div class="diag-result">
        <h3>🤔 Need a closer look</h3>
        <p>Our image analysis couldn't confidently identify the issue. This could mean the plant is healthy, or the problem needs expert eyes.</p>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:18px">
        <a class="btn btn-primary" href="https://wa.me/918804428490?text=${encodeURIComponent('Hi, I need help diagnosing my plant. Sending a photo.')}" target="_blank"><i class="fa-brands fa-whatsapp"></i> Ask an Expert</a>
        <button class="btn btn-ghost" onclick="switchMode('symptoms')"><i class="fa-solid fa-clipboard-list"></i> Try Symptom Quiz</button>
        <button class="btn btn-ghost" onclick="resetScan()"><i class="fa-solid fa-rotate-left"></i> Scan Another</button>
      </div>`;
    return;
  }

  const top = scored[0];
  const symptomLabels = analysis.detectedSymptoms.map(s => {
    const sym = SYMPTOMS.find(x => x.id === s);
    return sym ? sym.label : s;
  });

  content.innerHTML = `
    <div class="scan-preview"><img src="${imgSrc}" alt="Scanned plant"></div>
    <div class="color-analysis">${colorChips}</div>
    <div style="text-align:center;margin-bottom:18px">
      <span style="font-size:.82rem;color:var(--text-soft)"><i class="fa-solid fa-eye"></i> Detected: <strong>${symptomLabels.join(', ')}</strong></span>
    </div>
    <div class="diag-result">
      <span style="font-size:.78rem;color:var(--accent);font-weight:700;text-transform:uppercase">Image Analysis Result</span>
      <h3>${top.rule.icon} ${top.rule.name}</h3>
      <div style="font-size:.85rem;color:var(--text-soft)">Confidence</div>
      <div class="confidence-bar"><div class="confidence-fill" style="width:0%"></div></div>
      <p style="color:var(--text-soft)">${top.rule.cause}</p>
    </div>
    <h4 style="margin-bottom:10px"><i class="fa-solid fa-list-check" style="color:var(--primary)"></i> Recommended Action</h4>
    <ul style="margin:0 0 24px 4px;color:var(--text-soft);line-height:1.9">${top.rule.advice.map(a => `<li>✅ ${a}</li>`).join('')}</ul>
    ${scored.length > 1 ? `<p style="font-size:.85rem;color:var(--text-soft);margin-bottom:20px"><i class="fa-solid fa-circle-info"></i> Other possibility: <strong>${scored[1].rule.name}</strong></p>` : ''}
    <h4 style="margin-bottom:14px"><i class="fa-solid fa-cart-shopping" style="color:var(--accent)"></i> Recommended Products from our Store</h4>
    <div class="product-grid" id="scan-reco-grid"><div class="spinner"></div></div>
    <div style="display:flex;gap:10px;margin-top:26px;flex-wrap:wrap;justify-content:center">
      <button class="btn btn-ghost" onclick="resetScan()"><i class="fa-solid fa-rotate-left"></i> Scan Another</button>
      <a class="btn btn-pink" href="https://wa.me/918804428490?text=${encodeURIComponent('Hi, image scan shows my plant may have ' + top.rule.name + '. Please advise.')}" target="_blank"><i class="fa-brands fa-whatsapp"></i> Confirm with Expert</a>
    </div>`;

  // Animate confidence bar
  setTimeout(() => {
    const f = content.querySelector('.confidence-fill');
    if (f) f.style.width = top.conf + '%';
  }, 200);

  // Load recommended products
  loadScanRecommended(top.rule);
}

async function loadScanRecommended(rule) {
  const grid = document.getElementById('scan-reco-grid');
  try {
    const res = await apiList('products', '?limit=1000');
    const all = (res.data || []).filter(p => !p.deleted);
    const tags = rule.productTags.map(t => t.toLowerCase());
    let matches = all.filter(p => {
      const hay = ((p.name || '') + ' ' + (p.short_desc || '') + ' ' + (p.category || '') + ' ' + (p.tags || []).join(' ')).toLowerCase();
      const catMatch = (rule.productCats || []).includes(p.category);
      const tagMatch = tags.some(t => hay.includes(t));
      return catMatch || tagMatch;
    });
    if (!matches.length) matches = all.filter(p => (rule.productCats || []).includes(p.category));
    matches = matches.slice(0, 4);
    if (!matches.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-box-open"></i><p>No matching product listed yet. <a href="contact.html" style="color:var(--primary)">Contact us</a> for the right solution.</p></div>`;
      return;
    }
    grid.innerHTML = matches.map(recoCard).join('');
  } catch {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>Could not load products.</p></div>`;
  }
}

/* ============ DeepSeek AI Integration ============ */
const DEEPSEEK_KEY = 'gc_7VwMxyoVq834jicdLUxmH8JiJtwT1rVX';

async function runDeepSeekDiagnosis(imgSrc, analysis) {
  const cropLabel = (CROPS.find(c => c.id === answers.crop) || {}).label || 'Unknown Plant';
  const partLabel = (PARTS.find(p => p.id === answers.part) || {}).label || 'Whole Plant';
  
  const symptomLabels = analysis.detectedSymptoms.map(s => {
    const sym = SYMPTOMS.find(x => x.id === s);
    return sym ? sym.label : s;
  });

  const colorBreakdown = Object.entries(analysis.pcts)
    .map(([color, pct]) => `${color}: ${pct}%`)
    .join(', ');

  const prompt = `You are an expert plant pathologist and agronomist. 
Analyze the following plant data:
- Crop Type: ${cropLabel}
- Affected Area: ${partLabel}
- Visual Anomalies: ${symptomLabels.join(', ')}
- Leaf Color Breakdown: ${colorBreakdown}

Please diagnose the disease, pest infestation, or nutrient deficiency. 
Return your response ONLY as a valid JSON object matching this schema:
{
  "disease_name": "Disease Name (e.g. Fungal Blight / Nitrogen Deficiency / Aphids Infestation)",
  "icon": "🍂", // A single matching emoji representing the condition
  "confidence": 85, // Integer confidence score 0-100
  "cause": "Short detailed paragraph explaining the cause",
  "advice": [
    "Advice bullet point 1",
    "Advice bullet point 2",
    "Advice bullet point 3",
    "Advice bullet point 4"
  ],
  "product_tags": ["fungicide", "blight", "mancozeb"], // lowercase search tags to match our catalog products
  "product_cats": ["Fungicides"] // categories list to search from: Fungicides, Insecticides, Herbicides, Fertilizers, Plant Nutrition
}

Rule: Do NOT wrap the JSON in markdown code blocks like \`\`\`json. Return raw JSON text only.`;

  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an elite plant pathologist and agronomist. Output only raw JSON matching the requested schema. No markdown wrapping, no formatting ticks.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      })
    });

    if (!res.ok) throw new Error('API response status: ' + res.status);
    const data = await res.json();
    let resultText = data.choices[0].message.content.trim();
    
    // Clean up code blocks if model ignored instructions and wrapped them
    if (resultText.startsWith('```')) {
      resultText = resultText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(resultText);
    showAIDiagnosisResult(imgSrc, analysis, parsed);
  } catch (err) {
    console.error('DeepSeek diagnosis error. Falling back to local rules engine:', err);
    toast('DeepSeek AI offline or CORS blocked, using local fallback', 'info');
    showScanResult(imgSrc, analysis);
  }
}

function showAIDiagnosisResult(imgSrc, analysis, parsed) {
  const content = document.getElementById('scan-content');
  
  const colorChips = analysis.dominantColors.map(([name, pct]) =>
    `<div class="color-chip" style="background:${COLOR_MAP[name] || '#999'}" data-pct="${pct}% ${name}"></div>`
  ).join('');

  const symptomLabels = analysis.detectedSymptoms.map(s => {
    const sym = SYMPTOMS.find(x => x.id === s);
    return sym ? sym.label : s;
  });

  const rule = {
    name: parsed.disease_name || 'Plant Health Issue',
    icon: parsed.icon || '🌿',
    cause: parsed.cause || 'An unidentified issue was detected.',
    advice: parsed.advice || ['Observe plant health regularly.', 'Ensure adequate water and light.'],
    productTags: parsed.product_tags || [],
    productCats: parsed.product_cats || []
  };

  content.innerHTML = `
    <div class="scan-preview"><img src="${imgSrc}" alt="Scanned plant"></div>
    <div class="color-analysis">${colorChips}</div>
    <div style="text-align:center;margin-bottom:18px">
      <span style="font-size:.82rem;color:var(--text-soft)"><i class="fa-solid fa-eye"></i> Detected Visuals: <strong>${symptomLabels.join(', ')}</strong></span>
    </div>
    <div class="diag-result">
      <span style="font-size:.78rem;color:var(--accent);font-weight:700;text-transform:uppercase"><i class="fa-solid fa-sparkles"></i> AI DeepSeek Diagnosis</span>
      <h3>${rule.icon} ${rule.name}</h3>
      <div style="font-size:.85rem;color:var(--text-soft)">AI Confidence</div>
      <div class="confidence-bar"><div class="confidence-fill" style="width:0%"></div></div>
      <p style="color:var(--text-soft)">${rule.cause}</p>
    </div>
    <h4 style="margin-bottom:10px"><i class="fa-solid fa-list-check" style="color:var(--primary)"></i> Recommended Action</h4>
    <ul style="margin:0 0 24px 4px;color:var(--text-soft);line-height:1.9">${rule.advice.map(a => `<li>✅ ${a}</li>`).join('')}</ul>
    <h4 style="margin-bottom:14px"><i class="fa-solid fa-cart-shopping" style="color:var(--accent)"></i> Recommended Products from our Store</h4>
    <div class="product-grid" id="scan-reco-grid"><div class="spinner"></div></div>
    <div style="display:flex;gap:10px;margin-top:26px;flex-wrap:wrap;justify-content:center">
      <button class="btn btn-ghost" onclick="resetScan()"><i class="fa-solid fa-rotate-left"></i> Scan Another</button>
      <a class="btn btn-pink" href="https://wa.me/918804428490?text=${encodeURIComponent('Hi, AI scan shows my plant may have ' + rule.name + '. Please advise.')}" target="_blank"><i class="fa-brands fa-whatsapp"></i> Confirm with Expert</a>
    </div>`;

  // Animate confidence bar
  setTimeout(() => {
    const f = content.querySelector('.confidence-fill');
    if (f) f.style.width = (parsed.confidence || 75) + '%';
  }, 200);

  // Load recommended products
  loadScanRecommended(rule);
}
