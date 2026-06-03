/* ============ Auth JS (client-side) ============ */
mountLayout('');



function switchTab(tab){
  document.getElementById('tab-login').classList.toggle('active', tab==='login');
  document.getElementById('tab-signup').classList.toggle('active', tab==='signup');
  document.getElementById('pane-login').classList.toggle('active', tab==='login');
  document.getElementById('pane-signup').classList.toggle('active', tab==='signup');
}

// Already logged in? redirect
if(currentUser()){ toast('You are already logged in','info'); setTimeout(()=>location.href='index.html',900); }

document.getElementById('signup-form').addEventListener('submit', async e=>{
  e.preventDefault();
  const email=document.getElementById('su-email').value.trim().toLowerCase();
  const name=document.getElementById('su-name').value.trim();
  const phone=document.getElementById('su-phone').value.trim();
  const pass=document.getElementById('su-pass').value;
  try{
    const res=await apiList('users', `?search=${encodeURIComponent(email)}&limit=100`);
    const exists=(res.data||[]).find(u=>(u.email||'').toLowerCase()===email && !u.deleted);
    if(exists){ toast('Email already registered. Please login.','error'); switchTab('login'); return; }
    const user=await apiCreate('users',{name,email,phone,password:hashPass(pass),provider:'email',role:'customer'});
    setUser({id:user.id,name,email,phone,role:'customer'});
    toast('Account created! Welcome 🌱');
    setTimeout(()=>location.href='index.html',900);
  }catch{ toast('Signup failed. Please try again.','error'); }
});

document.getElementById('login-form').addEventListener('submit', async e=>{
  e.preventDefault();
  const email=document.getElementById('li-email').value.trim().toLowerCase();
  const pass=document.getElementById('li-pass').value;
  try{
    const res=await apiList('users', `?search=${encodeURIComponent(email)}&limit=100`);
    const user=(res.data||[]).find(u=>(u.email||'').toLowerCase()===email && !u.deleted);
    if(!user){ toast('No account found. Please sign up.','error'); switchTab('signup'); return; }
    if(user.password!==hashPass(pass)){ toast('Incorrect password.','error'); return; }
    setUser({id:user.id,name:user.name,email:user.email,phone:user.phone,role:user.role||'customer'});
    toast('Welcome back, '+user.name.split(' ')[0]+'! 🌿');
    setTimeout(()=>location.href='index.html',900);
  }catch{ toast('Login failed. Please try again.','error'); }
});

// Decodes JWT Web Token returned by Google Client SDK
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse Google JWT ID token', e);
    return null;
  }
}

// Google GSI Credentials Response Callback
async function handleCredentialResponse(response) {
  const payload = parseJwt(response.credential);
  if (!payload || !payload.email) {
    toast('Google authentication failed: Invalid token payload', 'error');
    return;
  }

  const email = payload.email.trim().toLowerCase();
  const name = payload.name || email.split('@')[0];
  
  try {
    // 1. Check if user is already registered in the REST users database table
    const res = await apiList('users', `?search=${encodeURIComponent(email)}&limit=100`);
    let user = (res.data || []).find(u => (u.email || '').toLowerCase() === email && !u.deleted);
    
    // 2. If new user, create their database profile persistently
    if (!user) {
      user = await apiCreate('users', {
        name: name,
        email: email,
        phone: '',
        password: '',
        provider: 'google',
        role: 'customer'
      });
    }

    // 3. Establish customer session
    setUser({
      id: user.id,
      name: user.name || name,
      email: email,
      phone: user.phone || '',
      role: user.role || 'customer'
    });

    toast(`Welcome, ${name.split(' ')[0]}! Signed in with Google 🌱`);
    setTimeout(() => location.href = 'index.html', 900);
  } catch (err) {
    console.error('Google database link failed', err);
    toast('Database connection failed. Please try again.', 'error');
  }
}

// Configures developer's Client ID from Google Cloud Console
function configureGoogleClientId() {
  const current = localStorage.getItem('vbb-google-client-id') || '';
  const input = prompt('Enter your Google Cloud Console Client ID:\n(Format: xxxxx-xxxxx.apps.googleusercontent.com)\n\nTo create one, visit console.cloud.google.com/apis/credentials', current);
  
  if (input === null) return; // Cancelled
  const clean = input.trim();
  if (clean) {
    localStorage.setItem('vbb-google-client-id', clean);
    toast('Google Client ID updated! Reloading...');
    setTimeout(() => location.reload(), 1000);
  } else {
    localStorage.removeItem('vbb-google-client-id');
    toast('Reset to default demo client ID. Reloading...');
    setTimeout(() => location.reload(), 1000);
  }
}

// Initialize Google Sign-in UI
function initGoogleSignIn() {
  const btnContainer = document.getElementById('google-signin-btn');
  if (!btnContainer) return;

  // Use configured Developer Client ID or a standard placeholder demo client ID
  const clientID = localStorage.getItem('vbb-google-client-id') || '307185012374-placeholderdemoclientid.apps.googleusercontent.com';

  try {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: clientID,
        callback: handleCredentialResponse
      });
      google.accounts.id.renderButton(
        btnContainer,
        { theme: 'outline', size: 'large', width: 340, shape: 'pill' }
      );
      google.accounts.id.prompt(); // Trigger Google One Tap where supported
    } else {
      // Retry loading if GSI SDK is still loading asynchronously
      setTimeout(initGoogleSignIn, 150);
    }
  } catch (e) {
    console.error('Error initializing Google Sign-In SDK', e);
  }
}

// Start Google sign-in render cycle
document.addEventListener('DOMContentLoaded', () => {
  initGoogleSignIn();
});
