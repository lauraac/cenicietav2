const CONFIG = {
  // CAMBIA ESTA FECHA POR LA FECHA REAL DEL EVENTO
  eventDate: '2026-10-31T18:30:00',
  // Si después conectas Google Apps Script, pega aquí tu URL.
  rsvpScriptUrl: ''
};

let audioEnabled = false;
let slideIndex = 0;

// Datos personalizados desde el enlace. Ejemplo:
// index.html?familia=Familia%20Pérez&pases=5
const invitationParams = new URLSearchParams(window.location.search);
const INVITATION = {
  family: (invitationParams.get('familia') || 'Familia Pérez').trim().slice(0, 60),
  passes: Math.min(20, Math.max(1, parseInt(invitationParams.get('pases') || '5', 10) || 5)),
  whatsapp: (invitationParams.get('wa') || '').replace(/\D/g, '').slice(0, 15)
};

document.addEventListener('DOMContentLoaded', () => {
  initPersonalInvitation();
  initIntro();
  initMusic();
  initCountdown();
  initCarousel();
  initReveal();
  initRSVP();
  initCinderellaStars();
});


function initPersonalInvitation() {
  const envelope = document.getElementById('royalEnvelope');
  const openBtn = document.getElementById('openInvitationBtn');
  const intro = document.getElementById('intro');
  const familyName = document.getElementById('familyName');
  const passCount = document.getElementById('passCount');
  const passLabel = document.getElementById('passLabel');
  const tickets = document.getElementById('royalTickets');
  const rsvpFamily = document.getElementById('rsvpFamilyName');
  const rsvpInfo = document.getElementById('rsvpPassInfo');
  const guestCount = document.getElementById('guestCount');

  document.body.classList.add('envelope-open');
  if (familyName) familyName.textContent = INVITATION.family;
  if (passCount) passCount.textContent = INVITATION.passes;
  if (passLabel) passLabel.textContent = INVITATION.passes === 1 ? 'Pase Real' : 'Pases Reales';
  if (rsvpFamily) rsvpFamily.textContent = INVITATION.family;
  if (rsvpInfo) rsvpInfo.textContent = `Tienen ${INVITATION.passes} ${INVITATION.passes === 1 ? 'lugar reservado' : 'lugares reservados'}`;

  if (tickets) {
    tickets.innerHTML = '';
    for (let i = 1; i <= INVITATION.passes; i++) {
      const ticket = document.createElement('span');
      ticket.className = 'royal-ticket';
      ticket.textContent = `✦ ${i}`;
      tickets.appendChild(ticket);
    }
  }

  if (guestCount) {
    for (let i = 1; i <= INVITATION.passes; i++) {
      const option = document.createElement('option');
      option.value = String(i);
      option.textContent = String(i);
      guestCount.appendChild(option);
    }
  }

  openBtn?.addEventListener('click', () => {
    envelope?.classList.add('is-open');
    intro?.classList.remove('intro--waiting');
    document.body.classList.remove('envelope-open');
    const video = document.getElementById('introVideo');
    video?.play().catch(() => {});
    setTimeout(() => envelope?.remove(), 900);
  });
}


function initIntro() {
  const intro = document.getElementById('intro');
  const video = document.getElementById('introVideo');
  const enterBtn = document.getElementById('enterBtn');
  const hint = document.getElementById('audioHint');
  const introContent = document.querySelector('.intro__content');

  if (!intro || !video || !enterBtn) return;

  // Empieza oculto
  introContent?.classList.remove('show');

// Mantener ocultas las letras al iniciar
introContent?.classList.remove('show');

// Revisar el tiempo real del video
const introTextTimer = setInterval(() => {

  if (video.currentTime >= 10) {
    introContent?.classList.add('show');

    // Ya apareció, no necesitamos seguir revisando
    clearInterval(introTextTimer);
  }

}, 200);

  if (!document.body.classList.contains('envelope-open')) video.play().catch(() => {});

  const enableSound = async () => {
    if (audioEnabled) return;

    try {
      audioEnabled = true;
      video.muted = false;
      video.volume = 1;

      if (hint) {
        hint.style.display = 'none';
      }

      await video.play();
    } catch {
      audioEnabled = false;
    }
  };

  intro.addEventListener('click', (e) => {
    if (!e.target.closest('#enterBtn')) {
      enableSound();
    }
  });

  hint?.addEventListener('click', (e) => {
    e.stopPropagation();
    enableSound();
  });

const closeIntro = () => {
  const musicBtn = document.getElementById('musicBtn');

  video.pause();

  intro.classList.add('is-hidden');

  setTimeout(() => {
    intro.style.display = 'none';

    // Mostrar botón de música al entrar a la invitación
    musicBtn?.classList.add('show');
  }, 750);

  // Iniciar música
  window.startMusic?.();
};

  enterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeIntro();
  });

  video.addEventListener('ended', closeIntro);
}

function initMusic() {
  const btn = document.getElementById('musicBtn');
  const music = document.getElementById('bgMusic');
  if (!btn || !music) return;

  const sync = () => {
    const playing = !music.paused;
    btn.classList.toggle('playing', playing);
    btn.textContent = playing ? '♫' : '♪';
    btn.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
  };

  window.startMusic = async () => { try { await music.play(); } catch {} sync(); };
  btn.addEventListener('click', async () => {
    if (music.paused) { try { await music.play(); } catch {} }
    else music.pause();
    sync();
  });
  music.addEventListener('play', sync);
  music.addEventListener('pause', sync);
  sync();
}

function initCountdown() {
  const target = new Date(CONFIG.eventDate).getTime();
  const ids = ['days','hours','minutes','seconds'];
  if (ids.some(id => !document.getElementById(id))) return;

  const update = () => {
    const diff = Math.max(0, target - Date.now());
    const total = Math.floor(diff / 1000);
    const values = [
      Math.floor(total / 86400),
      Math.floor((total % 86400) / 3600),
      Math.floor((total % 3600) / 60),
      total % 60
    ];
    ids.forEach((id, i) => document.getElementById(id).textContent = String(values[i]).padStart(2,'0'));
  };
  update(); setInterval(update, 1000);
}

function initCarousel() {
  const track = document.getElementById('track');
  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');
  const dots = document.getElementById('dots');
  if (!track || !prev || !next || !dots) return;
  const slides = [...track.children];
  let timer;

  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.className = 'dot' + (i === 0 ? ' active' : '');
    b.addEventListener('click', () => { slideIndex = i; render(); restart(); });
    dots.appendChild(b);
  });

  function render() {
    track.style.transform = `translateX(-${slideIndex * 100}%)`;
    dots.querySelectorAll('.dot').forEach((d,i) => d.classList.toggle('active', i === slideIndex));
  }
  function go(delta) { slideIndex = (slideIndex + delta + slides.length) % slides.length; render(); }
  function restart() { clearInterval(timer); timer = setInterval(() => go(1), 4500); }
  prev.addEventListener('click', () => { go(-1); restart(); });
  next.addEventListener('click', () => { go(1); restart(); });

  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, {passive:true});
  track.addEventListener('touchend', e => {
    const endX = e.changedTouches[0].clientX;
    if (Math.abs(startX - endX) > 45) go(startX > endX ? 1 : -1);
    restart();
  }, {passive:true});

  render(); restart();
}

function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('visible'));
  }, {threshold:.13});
  document.querySelectorAll('.section-reveal').forEach(el => observer.observe(el));
}

function initRSVP() {
  const button = document.getElementById('confirmWhatsappBtn');
  const msg = document.getElementById('formMsg');
  if (!button) return;

  button.addEventListener('click', () => {
    if (!INVITATION.whatsapp) {
      if (msg) msg.textContent = 'Esta invitación todavía no tiene configurado el WhatsApp para confirmar.';
      return;
    }

    const text = [
      '👑 Confirmación XV María Luciana',
      '',
      `Somos ${INVITATION.family}.`,
      'Confirmamos nuestra asistencia ✨',
      `Pases reservados: ${INVITATION.passes}`
    ].join('\n');

    window.open(`https://wa.me/${INVITATION.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });
}
function initCinderellaStars() {

  // Cantidad de estrellas visibles/reutilizadas
  const totalStars = 10;

  for (let i = 0; i < totalStars; i++) {

    const star = document.createElement("img");

    star.src = "./img/estrellass.png";
    star.className = "magic-star-img";
    star.alt = "";

    document.body.appendChild(star);

    moveStar(star);

    // Cada estrella tendrá una velocidad diferente
    star.style.animationDuration =
      `${4 + Math.random() * 4}s`;

    // Evita que todas aparezcan al mismo tiempo
    star.style.animationDelay =
      `${Math.random() * 6}s`;

    // Cuando termina un brillo,
    // cambia a otro lugar
    star.addEventListener(
      "animationiteration",
      () => {
        moveStar(star);
      }
    );
  }
}


function moveStar(star) {

  // Nueva posición
  star.style.left =
    `${3 + Math.random() * 94}vw`;

  star.style.top =
    `${3 + Math.random() * 90}vh`;

  // Algunas grandes y otras pequeñas
  const size =
    18 + Math.random() * 35;

  star.style.width =
    `${size}px`;
}