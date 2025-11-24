// Animaciones de aparición
const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
        if (e.isIntersecting) {
            e.target.classList.add('show');
            io.unobserve(e.target);
        }
    }
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

// Envío de formulario (Netlify Function)
function sendMailto(ev){
    ev.preventDefault();

    const form = ev.target;
    const n = form.nombre.value.trim();
    const em = form.email.value.trim();
    const t = form.telefono.value.trim();
    const s = form.servicio.value.trim();
    const m = form.mensaje.value.trim();

    if (!n || !em) {
        alert('Por favor llena al menos nombre y email.');
        return;
    }

    fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ nombre: n, email: em, telefono: t, servicio: s, mensaje: m })
    })
    .then(res => {
        if (!res.ok) throw new Error('Error en la respuesta del servidor');
        return res.json().catch(() => ({}));
    })
    .then(() => {
        alert('Mensaje enviado correctamente. En breve nos pondremos en contacto.');
        form.reset();
    })
    .catch(() => {
        alert('Hubo un problema al enviar el mensaje. Intenta de nuevo más tarde.');
    });
}

// Año en footer y aviso de privacidad
document.getElementById('y').textContent = new Date().getFullYear();
document.getElementById('y-priv').textContent = new Date().getFullYear();

// Modal de aviso de privacidad
const privBtn = document.getElementById('open-priv');
const privDialog = document.getElementById('privDialog');
if (privBtn && privDialog) {
    privBtn.addEventListener('click', (e) => {
        e.preventDefault();
        try { privDialog.showModal(); } catch { privDialog.show(); }
    });
}

// Auto-ocultar header por inactividad cuando el usuario está scrolleado
const navBar = document.querySelector('.nav');
let navHideTimeout = null;

function showNavBar(){
    if(!navBar) return;
    navBar.classList.remove('nav-hidden');
}

function scheduleNavHide(){
    if(!navBar) return;

    // Si estamos cerca del inicio, no ocultar
    if(window.scrollY < 120){
        navBar.classList.remove('nav-hidden');
        if(navHideTimeout) clearTimeout(navHideTimeout);
        return;
    }

    if(navHideTimeout) clearTimeout(navHideTimeout);
    navHideTimeout = setTimeout(() => {
        if(window.scrollY >= 120){
            navBar.classList.add('nav-hidden');
        }
    }, 3000); // 3s de inactividad
}

const navActivityHandler = () => {
    showNavBar();
    scheduleNavHide();
};

['mousemove','wheel','touchstart','keydown'].forEach(evt => {
    window.addEventListener(evt, navActivityHandler, { passive:true });
});

window.addEventListener('scroll', navActivityHandler, { passive:true });

scheduleNavHide();
