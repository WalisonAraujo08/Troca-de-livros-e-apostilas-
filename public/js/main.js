/* TrocaLivros — main.js */

// ============ Hamburger Menu ============
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('open');
  });
}

// ============ Tabs ============
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(tc => tc.classList.remove('active'));
    tab.classList.add('active');
    const target = document.getElementById('tab-' + tab.dataset.tab);
    if (target) target.classList.add('active');
  });
});

// ============ Show/hide password ============
function togglePass(id) {
  const inp = document.getElementById(id);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

// ============ Image preview ============
const capainput = document.getElementById('capa');
const previewImg = document.getElementById('previewImg');
const uploadPlaceholder = document.querySelector('.upload-placeholder');
if (capainput && previewImg) {
  capainput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      previewImg.src = ev.target.result;
      previewImg.style.display = 'block';
      if (uploadPlaceholder) uploadPlaceholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
  });
}

// ============ Form Validation (Login) ============
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    let valid = true;
    const email = document.getElementById('email');
    const senha = document.getElementById('senha');

    clearError('emailErr'); clearError('senhaErr');

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      showError('emailErr', 'E-mail inválido');
      email.classList.add('invalid');
      valid = false;
    }
    if (!senha.value || senha.value.length < 1) {
      showError('senhaErr', 'Senha obrigatória');
      senha.classList.add('invalid');
      valid = false;
    }
    if (!valid) e.preventDefault();
  });
}

// ============ Form Validation (Registro) ============
const regForm = document.getElementById('regForm');
if (regForm) {
  regForm.addEventListener('submit', (e) => {
    let valid = true;
    clearError('nomeErr'); clearError('emailErr');
    clearError('senhaErr'); clearError('confirmErr');

    const nome = document.getElementById('nome');
    const email = document.getElementById('email');
    const senha = document.getElementById('senha');
    const confirmar = document.getElementById('confirmar_senha');

    if (!nome.value || nome.value.trim().length < 3) {
      showError('nomeErr', 'Nome deve ter ao menos 3 caracteres'); valid = false;
    }
    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      showError('emailErr', 'E-mail inválido'); valid = false;
    }
    if (!senha.value || senha.value.length < 6) {
      showError('senhaErr', 'Senha deve ter ao menos 6 caracteres'); valid = false;
    }
    if (confirmar.value !== senha.value) {
      showError('confirmErr', 'As senhas não coincidem'); valid = false;
    }
    if (!valid) e.preventDefault();
  });
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}
function clearError(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = '';
}

// ============ Auto-hide alerts ============
const alerts = document.querySelectorAll('.alert-success');
alerts.forEach(alert => {
  setTimeout(() => {
    alert.style.transition = 'opacity .5s';
    alert.style.opacity = '0';
    setTimeout(() => alert.remove(), 500);
  }, 4000);
});

// ============ Scroll animation ============
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.card-livro, .step').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .4s ease, transform .4s ease';
  observer.observe(el);
});

// Add visible class styling via JS
const style = document.createElement('style');
style.textContent = `.visible { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(style);
