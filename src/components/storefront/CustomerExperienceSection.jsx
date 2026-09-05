import React, { useState, useRef } from "react";
import { Star, Sparkles, Quote, ChevronLeft, ChevronRight, CheckCircle2, MessageCircle } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { createGeneralInquiryUrl } from "../../utils/whatsapp";

export const CustomerExperienceSection = () => {
  const { settings } = useStore();
  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const reviews = [
    {
      name: "Rhea Singhania",
      city: "Mumbai",
      rating: 5,
      outfit: "Gulabi Chanderi Silk Kurti",
      date: "Verified Patron",
      text: "The Chanderi silk fabric is so breathable! The Vanshra team connected on WhatsApp right after my order to double-check my bust & armhole fit before I made the UPI payment. Arrived tailored like a glove."
    },
    {
      name: "Meera Kapoor",
      city: "New Delhi",
      rating: 5,
      outfit: "Floral Embroidered Peplum Top",
      date: "Verified Patron",
      text: "Zero hassle. The linen-cotton blend is so soft for daily wear and the embroidery is exquisite. The personal WhatsApp consultation gave me so much confidence in the purchase."
    },
    {
      name: "Tanvi Deshmukh",
      city: "Bengaluru",
      rating: 5,
      outfit: "Mulberry Silk Angrakha Kurti Set",
      date: "Verified Patron",
      text: "Ordered a bulk set for a family pooja. The owner personally guided me on custom fitting and shared the QR code on WhatsApp. Dispatched within 24 hours!"
    },
    {
      name: "Ananya Roy",
      city: "Kolkata",
      rating: 5,
      outfit: "Indigo Block-Print Cotton Kurti",
      date: "Verified Patron",
      text: "Pure 60s count cotton feels feather-light in summer humidity. Stitching quality is 10/10. Definitely my go-to brand for daily comfort kurtis."
    },
    {
      name: "Dr. Priyamvada Joshi",
      city: "Pune",
      rating: 5,
      outfit: "Zari Weave Festive Kurti Set",
      date: "Verified Patron",
      text: "Extremely rich fabric and clean stitching. The sizing call before shipping made sure the sleeve length was customized to my exact preference."
    }
  ];

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const cardWidth = carouselRef.current.offsetWidth * 0.85;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(reviews.length - 1, Math.max(0, newIndex)));
    }
  };

  const scrollToCard = (index) => {
    if (carouselRef.current) {
      const card = carouselRef.current.children[index];
      if (card) {
        card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  };

  const slidePrev = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -340, behavior: "smooth" });
    }
  };

  const slideNext = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  const handleShareReview = () => {
    const url = createGeneralInquiryUrl(settings.adminWhatsApp, "sharing my experience and review with Vanshra Atelier", settings);
    window.open(url, "_blank");
  };

  return (
    <section 
      aria-label="Patron Reviews and Testimonials"
      style={{
        padding: "clamp(36px, 5.5vw, 60px) 0",
        background: "linear-gradient(180deg, var(--bg-secondary) 0%, #faf8f5 100%)",
        borderTop: "1px solid var(--border-gold)",
        borderBottom: "1px solid var(--border-gold)",
        width: "100%",
        maxWidth: "100vw",
        overflow: "hidden"
      }}
    >
      <div className="container">
        
        {/* Header with Navigation Controls */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "14px",
          marginBottom: "clamp(18px, 3.2vw, 28px)"
        }}>
          <div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#ffffff",
              border: "1.5px solid var(--border-gold-bright)",
              color: "var(--accent-gold-dark)",
              padding: "4px 14px",
              borderRadius: "var(--radius-full)",
              fontSize: "clamp(0.68rem, 1.8vw, 0.78rem)",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "8px",
              boxShadow: "0 2px 10px rgba(212, 175, 55, 0.2)"
            }}>
              <Sparkles size={13} style={{ color: "var(--accent-gold)" }} />
              <span>Patron Love & Atelier Stories</span>
            </div>

            <h2 className="font-display" style={{ fontSize: "clamp(1.5rem, 4.2vw, 2.3rem)", color: "var(--text-primary)", lineHeight: 1.2 }}>
              Adored by Connoisseurs of Grace
            </h2>
          </div>

          {/* Slider Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={slidePrev}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "#ffffff",
                border: "1.5px solid var(--border-gold)",
                color: "var(--accent-gold-dark)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "var(--shadow-xs)",
                transition: "all var(--transition-fast)"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent-gold-dark)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-gold)")}
              title="Previous Review"
            >
              <ChevronLeft size={19} />
            </button>

            <button
              onClick={slideNext}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "#ffffff",
                border: "1.5px solid var(--border-gold)",
                color: "var(--accent-gold-dark)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "var(--shadow-xs)",
                transition: "all var(--transition-fast)"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent-gold-dark)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-gold)")}
              title="Next Review"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>

        {/* Swipeable Carousel */}
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          style={{
            display: "flex",
            gap: "clamp(14px, 2.5vw, 22px)",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingBottom: "10px",
            paddingTop: "4px"
          }}
        >
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="glass-panel glass-panel-hover"
              style={{
                flex: "0 0 min(86vw, 360px)",
                scrollSnapAlign: "center",
                padding: "clamp(16px, 3vw, 22px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "12px",
                background: "#ffffff",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--border-gold)",
                boxShadow: "0 4px 18px rgba(44, 30, 10, 0.05)",
                minHeight: "185px"
              }}
            >
              {/* Stars & Quote */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={14} fill="#d97706" color="#d97706" />
                  ))}
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-emerald-dark)", marginLeft: "6px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                    <CheckCircle2 size={12} style={{ color: "var(--accent-emerald)" }} />
                    <span>{rev.date}</span>
                  </span>
                </div>
                <Quote size={18} style={{ color: "var(--accent-gold)", opacity: 0.55 }} />
              </div>

              {/* Review Text */}
              <p style={{
                fontSize: "clamp(0.80rem, 1.8vw, 0.86rem)",
                color: "var(--text-secondary)",
                lineHeight: 1.55,
                fontStyle: "italic",
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }}>
                "{rev.text}"
              </p>

              {/* Customer Info & Outfit */}
              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.86rem" }}>
                    {rev.name}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    {rev.city} • <span style={{ color: "var(--accent-gold-dark)", fontWeight: 600 }}>{rev.outfit}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Dot Indicators & WhatsApp Share CTA */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "16px",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          {/* Dot Indicators */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToCard(idx)}
                style={{
                  width: activeIndex === idx ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "var(--radius-full)",
                  background: activeIndex === idx ? "var(--accent-gold-dark)" : "rgba(179, 135, 40, 0.3)",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
                title={`Slide to review ${idx + 1}`}
              />
            ))}
          </div>

          {/* Quick WhatsApp Review Prompt */}
          <button
            onClick={handleShareReview}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--accent-emerald-dark)",
              fontSize: "clamp(0.74rem, 1.8vw, 0.80rem)",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px"
            }}
          >
            <MessageCircle size={14} style={{ color: "var(--accent-emerald)" }} />
            <span>Have you worn Vanshra? Share Feedback on WhatsApp</span>
          </button>
        </div>

      </div>
    </section>
  );
};
