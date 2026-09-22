/**
 * Digistack Website Main Script & Configuration
 * Standard PRD SEO & Konversi Maksimal
 */

const CONFIG = {
  waNumber: "6282371728447",
  phoneDisplay: "0823-7172-8447",
  waName: "Admin Digistack",
  address: "Jakarta & Seluruh Indonesia (Online & Remote Support)",
  waDefaultMessage: "Halo Digistack, saya ingin konsultasi sistem digitalisasi / POS kustom untuk bisnis saya.",
  mapsUrl: "",                  // Google Bisnis / Maps menyusul (kantor sedang renovasi)
  
  // Tracking Iklan & Analitik (Isi ID jika sudah aktif)
  googleAdsId: "",              // Contoh: "AW-123456789"
  googleAdsConversionLabel: "", // Contoh: "AbC-D_efGhIjKLm"
  ga4Id: "",                    // Contoh: "G-XXXXXXXXXX"
  metaPixelId: ""               // Contoh: "123456789012345"
};

/**
 * Inisialisasi Otomatis Link & Tombol WhatsApp (.js-wa-link)
 */
function initWhatsAppLinks() {
  const waButtons = document.querySelectorAll('.js-wa-link');
  
  waButtons.forEach(btn => {
    let customMessage = btn.getAttribute('data-message');
    const serviceName = btn.getAttribute('data-service');
    
    if (!customMessage) {
      if (serviceName) {
        customMessage = `Halo Digistack, saya ingin konsultasi & demo sistem ${serviceName} untuk bisnis saya.`;
      } else {
        customMessage = CONFIG.waDefaultMessage;
      }
    }

    const waUrl = `https://wa.me/${CONFIG.waNumber}?text=${encodeURIComponent(customMessage)}`;
    btn.setAttribute('href', waUrl);
    btn.setAttribute('target', '_blank');
    btn.setAttribute('rel', 'noopener noreferrer');

    btn.addEventListener('click', (e) => {
      // 1. Google Ads Conversion Event
      if (CONFIG.googleAdsId && CONFIG.googleAdsConversionLabel && typeof gtag === 'function') {
        gtag('event', 'conversion', {
          'send_to': `${CONFIG.googleAdsId}/${CONFIG.googleAdsConversionLabel}`,
          'value': 1.0,
          'currency': 'IDR'
        });
      }

      // 2. Google Analytics 4 Custom Event
      if (typeof gtag === 'function') {
        gtag('event', 'click_whatsapp', {
          'event_category': 'Engagement',
          'event_label': serviceName || 'General Consultation',
          'value': 1
        });
      }

      // 3. Meta Pixel Custom Event
      if (CONFIG.metaPixelId && typeof fbq === 'function') {
        fbq('track', 'Contact', {
          content_name: serviceName || 'WhatsApp Contact'
        });
      }
    });
  });
}

/**
 * Accordion FAQ Interaktif
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      
      // Tutup semua accordion lainnya
      faqItems.forEach(other => {
        other.classList.remove('active');
        const otherBtn = other.querySelector('.faq-question');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });

      // Toggle item saat ini
      if (!isOpen) {
        item.classList.add('active');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

// Inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  initWhatsAppLinks();
  initFaqAccordion();
});

