/* ============================================================
   METRO SUL — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ========== PRELUDE ==========
    const prelude = document.getElementById('prelude');
    if (prelude && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setTimeout(() => {
            prelude.classList.add('hidden');
        }, 2800);
    } else if (prelude) {
        prelude.style.display = 'none';
    }

    // ========== MOBILE MENU ==========
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            const expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', !expanded);
            nav.classList.toggle('open');
        });

        // Close on link click
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                toggle.setAttribute('aria-expanded', 'false');
                nav.classList.remove('open');
            });
        });
    }

    // ========== TRACK ARCHIVE TOGGLE ==========
    document.querySelectorAll('.track-archive-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const archive = btn.nextElementSibling;
            if (archive && archive.classList.contains('track-archive')) {
                const hidden = archive.hidden;
                archive.hidden = !hidden;
                btn.setAttribute('aria-expanded', hidden);
                btn.textContent = hidden ? 'Hide Track Archive ↑' : 'View Full Track Archive ↓';
            }
        });
    });

    // ========== COOKIE NOTICE ==========
    const cookieNotice = document.getElementById('cookie-notice');
    const cookieAccept = document.getElementById('cookie-accept');
    if (cookieNotice && cookieAccept) {
        const dismissed = localStorage.getItem('metro-sul-cookie-dismissed');
        if (dismissed) {
            cookieNotice.classList.add('hidden');
        }
        cookieAccept.addEventListener('click', () => {
            cookieNotice.classList.add('hidden');
            localStorage.setItem('metro-sul-cookie-dismissed', 'true');
        });
    }

    // ========== CANVAS HERO ==========
    const canvas = document.getElementById('heroCanvas');
    if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const ctx = canvas.getContext('2d');
        let w, h;
        let particles = [];
        let mouseX = 0.5,
            mouseY = 0.5;

        function resize() {
            const rect = canvas.parentElement.getBoundingClientRect();
            w = canvas.width = rect.width * devicePixelRatio;
            h = canvas.height = rect.height * devicePixelRatio;
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            ctx.scale(devicePixelRatio, devicePixelRatio);
        }

        function createParticles(count) {
            particles = [];
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = 50 + Math.random() * 280;
                const speed = 0.003 + Math.random() * 0.008;
                const side = Math.random() < 0.5 ? 'blue' : 'orange';
                particles.push({
                    angle: angle,
                    radius: radius,
                    speed: speed,
                    size: 1 + Math.random() * 4,
                    side: side,
                    offset: Math.random() * Math.PI * 2,
                    trail: [],
                    maxTrail: 8 + Math.floor(Math.random() * 12)
                });
            }
        }

        function drawParticles(time) {
            const cx = w / 2;
            const cy = h / 2;
            const baseRadius = Math.min(w, h) * 0.22;

            ctx.clearRect(0, 0, w, h);

            // Draw outer glow ring
            const grad = ctx.createRadialGradient(cx, cy, baseRadius * 0.6, cx, cy, baseRadius * 1.3);
            grad.addColorStop(0, 'rgba(0, 157, 255, 0)');
            grad.addColorStop(0.5, 'rgba(0, 157, 255, 0.02)');
            grad.addColorStop(0.8, 'rgba(255, 106, 0, 0.02)');
            grad.addColorStop(1, 'rgba(0, 157, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, baseRadius * 1.3, 0, Math.PI * 2);
            ctx.fill();

            // Draw orbital ring
            ctx.beginPath();
            ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 157, 255, 0.06)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw pulse ring
            const pulse = 0.5 + 0.5 * Math.sin(time * 0.001);
            ctx.beginPath();
            ctx.arc(cx, cy, baseRadius + pulse * 20, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(55, 216, 255, ${0.02 + pulse * 0.04})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Mouse influence
            const mx = (mouseX - 0.5) * 80;
            const my = (mouseY - 0.5) * 80;

            // Update and draw particles
            particles.forEach(p => {
                p.angle += p.speed * (1 + 0.1 * Math.sin(time * 0.0005 + p.offset));

                const rOff = 0.5 + 0.5 * Math.sin(time * 0.001 + p.offset);
                const r = baseRadius + (p.radius - 50) * 0.6 + rOff * 18;

                const x = cx + Math.cos(p.angle + p.offset * 0.3) * r + mx * 0.2;
                const y = cy + Math.sin(p.angle + p.offset * 0.3) * r * 0.6 + my * 0.2;

                // Trail
                p.trail.push({ x, y, life: 1 });
                if (p.trail.length > p.maxTrail) p.trail.shift();
                p.trail.forEach((t, idx) => {
                    t.life = idx / p.trail.length;
                });

                // Draw trail
                for (let i = 1; i < p.trail.length; i++) {
                    const alpha = p.trail[i].life * 0.15;
                    const color = p.side === 'blue' ? `rgba(0, 157, 255, ${alpha})` :
                        `rgba(255, 106, 0, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(p.trail[i].x, p.trail[i].y, p.size * p.trail[i].life * 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                }

                // Draw particle
                const color = p.side === 'blue' ? `rgba(55, 216, 255, ${0.7 + 0.3 * Math.sin(time * 0.002 + p.offset)})` :
                    `rgba(255, 170, 0, ${0.7 + 0.3 * Math.cos(time * 0.002 + p.offset)})`;
                ctx.beginPath();
                ctx.arc(x, y, p.size * (0.5 + 0.5 * Math.sin(time * 0.002 + p.offset)), 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();

                // Spark glow
                const glow = ctx.createRadialGradient(x, y, 0, x, y, p.size * 4);
                glow.addColorStop(0, color);
                glow.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(x, y, p.size * 4, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw central core glow
            const core = ctx.createRadialGradient(cx + mx * 0.1, cy + my * 0.1, 0, cx + mx * 0.1, cy + my * 0.1, 60);
            core.addColorStop(0, 'rgba(0, 157, 255, 0.03)');
            core.addColorStop(0.5, 'rgba(55, 216, 255, 0.01)');
            core.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = core;
            ctx.beginPath();
            ctx.arc(cx + mx * 0.1, cy + my * 0.1, 60, 0, Math.PI * 2);
            ctx.fill();

            // Draw crosshair lines
            ctx.strokeStyle = 'rgba(255,255,255,0.02)';
            ctx.lineWidth = 0.5;
            ctx.setLineDash([4, 8]);
            ctx.beginPath();
            ctx.moveTo(0, cy);
            ctx.lineTo(w, cy);
            ctx.moveTo(cx, 0);
            ctx.lineTo(cx, h);
            ctx.stroke();
            ctx.setLineDash([]);

            // Coordinates label
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            ctx.font = '9px "IBM Plex Mono", monospace';
            ctx.fillText('URBAN TIME SIGNAL · 46.6333° S, 23.5667° E · 94.7 MHZ', 16, h - 16);
        }

        function animate(time) {
            drawParticles(time);
            requestAnimationFrame(animate);
        }

        // Mouse tracking
        const hero = document.getElementById('hero');
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            mouseX = (e.clientX - rect.left) / rect.width;
            mouseY = (e.clientY - rect.top) / rect.height;
        });
        hero.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const rect = hero.getBoundingClientRect();
            mouseX = (touch.clientX - rect.left) / rect.width;
            mouseY = (touch.clientY - rect.top) / rect.height;
        }, { passive: true });

        // Init
        resize();
        createParticles(90);
        window.addEventListener('resize', () => {
            resize();
            createParticles(90);
        });
        animate(0);
    } else if (canvas) {
        canvas.style.display = 'none';
    }

    // ========== SCROLL REVEALS (IntersectionObserver) ==========
    if ('IntersectionObserver' in window) {
        const sections = document.querySelectorAll('section');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        sections.forEach(s => {
            s.style.opacity = '0';
            s.style.transform = 'translateY(24px)';
            s.style.transition = 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
            observer.observe(s);
        });
    }

    // ========== TRACKING ==========
    const tracking = window.METRO_SUL_TRACKING || {};
    if (tracking.googleAnalyticsId && tracking.googleAnalyticsId !== 'G-XXXXXXXXXX') {
        // Google Analytics
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${tracking.googleAnalyticsId}`;
        document.head.appendChild(script);
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() { dataLayer.push(arguments); };
        gtag('js', new Date());
        gtag('config', tracking.googleAnalyticsId);
    }

    if (tracking.metaPixelId && tracking.metaPixelId !== '000000000000000') {
        // Meta Pixel
        ! function(f, b, e, v, n, t, s) {
            if (f.fbq) return;
            n = f.fbq = function() { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) };
            if (!f._fbq) f._fbq = n;
            n.push = n;
            n.loaded = !0;
            n.version = '2.0';
            n.queue = [];
            t = b.createElement(e);
            t.async = !0;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s)
        }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', tracking.metaPixelId);
        fbq('track', 'PageView');
    }

});