import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/public-landing.css';

// ── ANIMACIONES REUTILIZABLES ───────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0  },
};

const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// ── DATOS MOCK ──────────────────────────────────────────
const CAROUSEL_SLIDES = [
  { id:1, bg:'#D4C5B5', caption:'Un espacio para ti' },
  { id:2, bg:'#C5D4CA', caption:'Bienestar que se siente' },
  { id:3, bg:'#D4CAC5', caption:'Manos expertas, resultados reales' },
  { id:4, bg:'#C5CAD4', caption:'Tu momento de paz comienza aquí' },
];

const PROFESSIONALS = [
  { name:'Katherine Gómez', role:'Directora & Esteticista',   color:'#4A7C59', desc:'Especialista en tratamientos faciales y técnicas de bienestar integral.' },
  { name:'Laura Torres',    role:'Masajista Certificada',     color:'#C9A84C', desc:'Experta en masoterapia y técnicas de relajación profunda.' },
  { name:'Ana Martínez',    role:'Manicurista & Nail Artist', color:'#7B5EA7', desc:'Artista especializada en nail art y tratamientos de manos y pies.' },
  { name:'Sofia Reyes',     role:'Cosmetóloga',               color:'#D94F4F', desc:'Especialista en tratamientos corporales y cuidado de la piel.' },
];

const SERVICES = [
  { id:1, name:'Facial Hidratante',   desc:'Tratamiento profundo que devuelve luminosidad y vitalidad a tu piel.', fullDesc:'Nuestro facial hidratante es un tratamiento de alta gama diseñado para restaurar la barrera hidrolipídica de tu piel. Utilizamos ácido hialurónico, extracto de aloe vera y vitamina C para lograr una hidratación profunda y duradera.', price:'$120.000', dur:'60 min', bg:'#C5D4CA' },
  { id:2, name:'Manicure Completa',   desc:'Cuidado integral de manos con limado, cutículas, hidratación y esmaltado.', fullDesc:'Nuestra manicure completa incluye remojo relajante, limado y moldeado de uñas, retiro de cutículas, exfoliación e hidratación de manos, y aplicación de esmalte a tu elección.', price:'$80.000', dur:'45 min', bg:'#D4C5B5' },
  { id:3, name:'Masaje Relajante',    desc:'Técnica sueca para liberar tensiones y promover el bienestar corporal.', fullDesc:'Nuestro masaje combina técnicas de masoterapia sueca con aceites esenciales premium para liberar tensiones, mejorar la circulación y devolverte un estado de bienestar profundo.', price:'$150.000', dur:'75 min', bg:'#CAC5D4' },
  { id:4, name:'Pedicure Spa',        desc:'Experiencia completa de cuidado de pies con sales, masaje y esmaltado.', fullDesc:'El Pedicure Spa incluye baño de sales minerales, exfoliación con azúcar natural, masaje de pies y pantorrillas, hidratación intensiva y esmaltado de larga duración.', price:'$200.000', dur:'90 min', bg:'#D4CAC5' },
  { id:5, name:'Depilación de Cejas', desc:'Diseño adaptado a la morfología de tu rostro para un resultado natural.', fullDesc:'Analizamos la morfología de tu rostro para diseñar unas cejas que enmarquen perfectamente tus ojos. Utilizamos hilo, cera o pinza según tu tipo de piel.', price:'$60.000', dur:'30 min', bg:'#C5D4C5' },
  { id:6, name:'Tratamiento Capilar', desc:'Nutrición intensiva para tu cabello con keratina y proteínas de seda.', fullDesc:'Utilizamos keratina hidrolizada y proteínas de seda para restaurar la fibra capilar dañada, eliminar el frizz y devolver el brillo natural. Resultados visibles desde la primera sesión.', price:'$180.000', dur:'80 min', bg:'#D4C5CA' },
];

// ── COMPONENTE PRINCIPAL ────────────────────────────────
export default function PublicLanding() {
  const navigate = useNavigate();
  const [activeSlide,      setActiveSlide]      = useState(0);
  const [selectedService,  setSelectedService]  = useState(null);

  const nextSlide = useCallback(() => {
    setActiveSlide(prev => (prev + 1) % CAROUSEL_SLIDES.length);
  }, []);

  const prevSlide = () => {
    setActiveSlide(prev => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  useEffect(() => {
    const t = setInterval(nextSlide, 4000);
    return () => clearInterval(t);
  }, [nextSlide]);

  const handleBook    = () => navigate('/login');
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });

  return (
    <div style={{ background:'var(--bg)' }}>

      {/* ── NAVBAR ── */}
      <motion.nav
        className="land-nav"
        initial={{ opacity:0, y:-20 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:.4 }}
      >
        <a className="land-nav-logo" href="/">
          <div className="land-nav-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
            </svg>
          </div>
          <div className="land-nav-logo-text">Entre<span>Manos</span></div>
        </a>
        <div className="land-nav-links">
          {['nosotros','servicios','equipo','contacto'].map(id => (
            <span key={id} className="land-nav-link"
              onClick={() => scrollTo(id)}>
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </span>
          ))}
        </div>
        <button className="land-nav-cta" onClick={handleBook}>Agendar cita</button>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="hero">
        <motion.div
          className="hero-left"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="hero-badge" variants={fadeUp} transition={{ duration:.5 }}>
            <div className="hero-badge-dot"></div>
            Centro de Estética y Bienestar
          </motion.div>

          <motion.h1 className="hero-title" variants={fadeUp} transition={{ duration:.5, delay:.1 }}>
            Tu momento<br />
            de <span className="hero-title-accent">bienestar</span><br />
            comienza aquí
          </motion.h1>

          <motion.p className="hero-subtitle" variants={fadeUp} transition={{ duration:.5, delay:.2 }}>
            Entre Manos — Estética premium
          </motion.p>

          <motion.p className="hero-desc" variants={fadeUp} transition={{ duration:.5, delay:.3 }}>
            Un espacio diseñado para que te reconectes contigo misma.
            Tratamientos de calidad, manos expertas y una experiencia
            que va más allá del cuidado personal.
          </motion.p>

          <motion.div className="hero-actions" variants={fadeUp} transition={{ duration:.5, delay:.4 }}>
            <button className="btn-primary" onClick={handleBook}>Agendar cita</button>
            <button className="btn-secondary" onClick={() => scrollTo('servicios')}>Ver servicios</button>
          </motion.div>

          <motion.div className="hero-stats" variants={fadeUp} transition={{ duration:.5, delay:.5 }}>
            {[
              { value:'500+', label:'Clientes satisfechas' },
              { value:'6+',   label:'Años de experiencia'  },
              { value:'4',    label:'Especialistas'         },
            ].map((s,i) => (
              <div key={i}>
                <div className="hero-stat-value">{s.value}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* CARRUSEL */}
        <motion.div
          className="hero-right"
          initial={{ opacity:0, x:40 }}
          animate={{ opacity:1, x:0 }}
          transition={{ duration:.7, delay:.3 }}
        >
          <div className="carousel">
            {CAROUSEL_SLIDES.map((slide, i) => (
              <div key={slide.id} className={`carousel-slide ${i === activeSlide ? 'active' : ''}`}>
                <div className="carousel-placeholder"
                  style={{ background:`linear-gradient(135deg, ${slide.bg}, ${slide.bg}cc)` }}>
                  <svg width="48" height="48" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                  </svg>
                  <span style={{fontSize:'13px',color:'rgba(255,255,255,.5)'}}>Imagen del spa</span>
                </div>
                <div className="carousel-caption">
                  <div className="carousel-caption-text">{slide.caption}</div>
                </div>
              </div>
            ))}
            <button className="carousel-arrow prev" onClick={prevSlide}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6"/></svg>
            </button>
            <button className="carousel-arrow next" onClick={nextSlide}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>
            </button>
            <div className="carousel-dots">
              {CAROUSEL_SLIDES.map((_,i) => (
                <button key={i} className={`carousel-dot ${i === activeSlide ? 'active' : ''}`}
                  onClick={() => setActiveSlide(i)} />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── INFO DEL SPA ── */}
      <section className="section section-alt" id="nosotros">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once:true, amount:.2 }}
          variants={stagger}
        >
          <motion.div className="section-label" variants={fadeUp} transition={{ duration:.4 }}>
            Quiénes somos
          </motion.div>
          <motion.h2 className="section-title" variants={fadeUp} transition={{ duration:.4, delay:.1 }}>
            Un lugar donde el<br />cuidado es un arte
          </motion.h2>
          <motion.p className="section-desc" variants={fadeUp} transition={{ duration:.4, delay:.2 }}>
            En Entre Manos creemos que el bienestar es una necesidad, no un lujo.
            Desde 2018 hemos acompañado a cientos de personas en su camino hacia
            el equilibrio y el autocuidado.
          </motion.p>
        </motion.div>

        <div className="info-grid">
          <motion.div
            className="info-cards"
            initial="hidden" whileInView="visible" viewport={{ once:true, amount:.2 }}
            variants={stagger}
          >
            {[
              { title:'Dirección', value:'Calle 45 #12-30, Centro, Bogotá',
                icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
              { title:'Horarios', value:'Lun – Sáb: 9:00 – 19:00\nDomingo: Cerrado',
                icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg> },
              { title:'Teléfono', value:'+57 301 234 5678',
                icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
              { title:'Correo', value:'hola@entremanos.com',
                icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
            ].map((card,i) => (
              <motion.div key={i} className="info-card" variants={fadeUp} transition={{ duration:.4 }}
                whileHover={{ y:-3, boxShadow:'0 8px 24px rgba(0,0,0,.1)' }}>
                <div className="info-card-icon">{card.icon}</div>
                <div className="info-card-title">{card.title}</div>
                <div className="info-card-value" style={{whiteSpace:'pre-line'}}>{card.value}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div id="contacto"
            initial={{ opacity:0, x:30 }} whileInView={{ opacity:1, x:0 }}
            viewport={{ once:true }} transition={{ duration:.5 }}>
            <div className="map-placeholder">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Mapa — Calle 45 #12-30, Bogotá</span>
              <span style={{fontSize:'11px',opacity:.6}}>Reemplaza con tu embed de Google Maps</span>
            </div>
            <button className="btn-secondary" style={{width:'100%'}} onClick={handleBook}>
              Agendar cita ahora
            </button>
          </motion.div>
        </div>

        {/* EQUIPO */}
        <div id="equipo" style={{marginTop:'64px'}}>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once:true, amount:.2 }}
            variants={stagger}
          >
            <motion.div className="section-label" variants={fadeUp}>Nuestro equipo</motion.div>
            <motion.h3 variants={fadeUp} style={{fontFamily:'Playfair Display, serif', fontSize:'28px', fontWeight:'600', color:'var(--tx)', marginBottom:'8px'}}>
              Especialistas que te cuidan
            </motion.h3>
            <motion.p variants={fadeUp} style={{fontSize:'14px', color:'var(--tx2)'}}>
              Profesionales certificadas con años de experiencia y pasión por el bienestar.
            </motion.p>
          </motion.div>

          <motion.div
            className="team-grid"
            initial="hidden" whileInView="visible" viewport={{ once:true, amount:.2 }}
            variants={stagger}
          >
            {PROFESSIONALS.map((p,i) => (
              <motion.div key={i} className="team-card" variants={fadeUp}
                transition={{ duration:.4 }}
                whileHover={{ y:-4, boxShadow:'0 12px 32px rgba(0,0,0,.1)' }}>
                <div className="team-avatar" style={{background:p.color}}>
                  {p.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div className="team-name">{p.name}</div>
                <div className="team-role">{p.role}</div>
                <div className="team-desc">{p.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section className="section" id="servicios">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once:true, amount:.2 }}
          variants={stagger}
        >
          <motion.div className="section-label" variants={fadeUp}>Lo que ofrecemos</motion.div>
          <motion.h2 className="section-title" variants={fadeUp} transition={{ delay:.1 }}>
            Nuestros servicios
          </motion.h2>
          <motion.p className="section-desc" variants={fadeUp} transition={{ delay:.2 }}>
            Cada tratamiento está diseñado para brindarte una experiencia única.
            Elige el servicio que necesitas y agenda tu cita en minutos.
          </motion.p>
        </motion.div>

        <motion.div
          className="services-grid"
          initial="hidden" whileInView="visible" viewport={{ once:true, amount:.1 }}
          variants={stagger}
        >
          {SERVICES.map(service => (
            <motion.div key={service.id} variants={fadeUp} transition={{ duration:.4 }}>
              <ServiceCard
                service={service}
                onSelect={() => setSelectedService(service)}
                onBook={handleBook}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <motion.section
        className="cta-section"
        initial={{ opacity:0 }} whileInView={{ opacity:1 }}
        viewport={{ once:true }} transition={{ duration:.6 }}
      >
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once:true }}
          variants={stagger}
        >
          <motion.div className="cta-label" variants={fadeUp}>Tu bienestar nos importa</motion.div>
          <motion.h2 className="cta-title" variants={fadeUp} transition={{ delay:.1 }}>
            Reserva tu momento<br />de <em>bienestar</em>
          </motion.h2>
          <motion.p className="cta-sub" variants={fadeUp} transition={{ delay:.2 }}>
            Agenda tu cita en pocos pasos. Sin filas, sin esperas.
            Solo tú y la experiencia que mereces.
          </motion.p>
          <motion.button
            className="cta-btn"
            variants={fadeUp} transition={{ delay:.3 }}
            whileHover={{ scale:1.03, y:-2 }}
            whileTap={{ scale:.97 }}
            onClick={handleBook}
          >
            Agendar ahora
          </motion.button>
        </motion.div>
      </motion.section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <motion.div
          className="footer-grid"
          initial="hidden" whileInView="visible" viewport={{ once:true, amount:.1 }}
          variants={stagger}
        >
          <motion.div variants={fadeUp}>
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="18" height="18">
                  <path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
                </svg>
              </div>
              <div className="footer-logo-text">Entre<span>Manos</span></div>
            </div>
            <p className="footer-desc">
              Centro de estética y bienestar dedicado a ofrecerte tratamientos
              de calidad en un ambiente cálido y profesional.
            </p>
            <div className="footer-socials">
              {[
                <svg key="ig" width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
                <svg key="wa" width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>,
                <svg key="fb" width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
              ].map((icon,i) => (
                <motion.button key={i} className="footer-social-btn"
                  whileHover={{ scale:1.1 }} whileTap={{ scale:.95 }}>
                  {icon}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ delay:.1 }}>
            <div className="footer-col-title">Servicios</div>
            {SERVICES.slice(0,5).map(s => (
              <button key={s.id} className="footer-link" onClick={() => setSelectedService(s)}>{s.name}</button>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} transition={{ delay:.2 }}>
            <div className="footer-col-title">Contacto</div>
            {[
              { icon:<svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, text:'Calle 45 #12-30, Bogotá' },
              { icon:<svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>, text:'Lun–Sáb: 9:00–19:00' },
              { icon:<svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>, text:'+57 301 234 5678' },
              { icon:<svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, text:'hola@entremanos.com' },
            ].map((item,i) => (
              <div key={i} className="footer-contact-item">{item.icon}<span>{item.text}</span></div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} transition={{ delay:.3 }}>
            <div className="footer-col-title">Navegación</div>
            {[
              { label:'Inicio',       action:() => window.scrollTo({top:0,behavior:'smooth'}) },
              { label:'Nosotros',     action:() => scrollTo('nosotros') },
              { label:'Servicios',    action:() => scrollTo('servicios') },
              { label:'Equipo',       action:() => scrollTo('equipo') },
              { label:'Agendar',      action:handleBook },
              { label:'Iniciar sesión', action:() => navigate('/login') },
            ].map((item,i) => (
              <button key={i} className="footer-link" onClick={item.action}>{item.label}</button>
            ))}
          </motion.div>
        </motion.div>

        <div className="footer-bottom">
          <span>© 2026 Entre Manos. Todos los derechos reservados.</span>
          <span>Desarrollado con cuidado para el bienestar</span>
        </div>
      </footer>

      {/* ── MODAL SERVICIO ── */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:.25 }}
            onClick={(e) => e.target === e.currentTarget && setSelectedService(null)}
          >
            <motion.div
              className="modal"
              initial={{ opacity:0, scale:.93, y:20 }}
              animate={{ opacity:1, scale:1,   y:0  }}
              exit={{    opacity:0, scale:.93, y:20 }}
              transition={{ duration:.25 }}
            >
              <div className="modal-img"
                style={{background:`linear-gradient(135deg, ${selectedService.bg}, ${selectedService.bg}bb)`}}>
                <svg width="48" height="48" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
              </div>
              <div className="modal-body">
                <div className="modal-name">{selectedService.name}</div>
                <p className="modal-desc">{selectedService.fullDesc}</p>
                <div className="modal-meta">
                  <div className="modal-meta-item">
                    <div className="modal-meta-label">Precio</div>
                    <div className="modal-meta-value" style={{color:'var(--pri)'}}>{selectedService.price}</div>
                  </div>
                  <div className="modal-meta-item">
                    <div className="modal-meta-label">Duración</div>
                    <div className="modal-meta-value">{selectedService.dur}</div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="modal-close-btn" onClick={() => setSelectedService(null)}>Cerrar</button>
                  <button className="modal-book-btn" onClick={() => { setSelectedService(null); handleBook(); }}>
                    Agendar este servicio
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── TARJETA DE SERVICIO ─────────────────────────────────
function ServiceCard({ service, onSelect, onBook }) {
  return (
    <motion.div
      className="service-card"
      onClick={onSelect}
      whileHover={{ y:-4, boxShadow:'0 12px 32px rgba(0,0,0,.1)', borderTopWidth:'3px', borderTopColor:'var(--acc)' }}
      transition={{ duration:.2 }}
    >
      <div className="service-card-img"
        style={{ background:`linear-gradient(135deg, ${service.bg}, ${service.bg}aa)` }}>
        <div className="service-card-img-placeholder">
          <svg width="36" height="36" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1.5" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
        </div>
      </div>
      <div className="service-card-body">
        <div className="service-card-name">{service.name}</div>
        <div className="service-card-desc">{service.desc}</div>
        <div className="service-card-meta">
          <div className="service-card-price">{service.price}</div>
          <div className="service-card-dur">
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
            </svg>
            {service.dur}
          </div>
        </div>
        <motion.button
          className="service-card-btn"
          whileHover={{ scale:1.02 }} whileTap={{ scale:.97 }}
          onClick={(e) => { e.stopPropagation(); onBook(); }}
        >
          Agendar
        </motion.button>
      </div>
    </motion.div>
  );
}