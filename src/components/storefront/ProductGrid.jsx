import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../../context/StoreContext";
import { ProductCard } from "./ProductCard";
import { CategoryPills } from "./CategoryPills";
import { STANDARD_SIZES } from "../../data/initialData";
import { SlidersHorizontal, ArrowDownUp, Search, RefreshCw, Sparkles, ChevronDown, Check, ArrowUp } from "lucide-react";

const INITIAL_BATCH_SIZE = 8;

export const ProductGrid = () => {
  const {
    products,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    sizeFilter,
    setSizeFilter,
    sortBy,
    setSortBy
  } = useStore();

  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);
  const gridContainerRef = useRef(null);

  // Reset visible count whenever category, search, size filter, or sort changes
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH_SIZE);
  }, [activeCategory, searchQuery, sizeFilter, sortBy]);

  // Staggered scroll-reveal animation using IntersectionObserver
  useEffect(() => {
    if (!gridContainerRef.current) return;

    const cards = gridContainerRef.current.querySelectorAll(".scroll-reveal-card");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [visibleCount, activeCategory, searchQuery, sizeFilter, sortBy, products]);

  // Filter products
  const filteredProducts = products.filter((product) => {
    // 1. Category Filter
    if (activeCategory !== "All" && product.category !== activeCategory) {
      return false;
    }

    // 2. Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(query);
      const matchCat = product.category.toLowerCase().includes(query);
      const matchDesc = product.description.toLowerCase().includes(query);
      const matchColor = product.colors?.some((c) => c.name.toLowerCase().includes(query));
      if (!matchName && !matchCat && !matchDesc && !matchColor) {
        return false;
      }
    }

    // 3. Size Availability Filter
    if (sizeFilter !== "All") {
      const sizeStock = product.sizes?.[sizeFilter] || 0;
      if (sizeStock <= 0) return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    // Default "featured"
    if (a.isBestSeller && !b.isBestSeller) return -1;
    if (!a.isBestSeller && b.isBestSeller) return 1;
    return 0;
  });

  const displayedProducts = sortedProducts.slice(0, visibleCount);
  const remainingCount = sortedProducts.length - displayedProducts.length;
  const progressPercent = Math.min(100, Math.round((displayedProducts.length / Math.max(1, sortedProducts.length)) * 100));

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + INITIAL_BATCH_SIZE);
  };

  const handleViewAll = () => {
    setVisibleCount(sortedProducts.length);
  };

  const handleScrollToTop = () => {
    const catalogSection = document.getElementById("catalog-section");
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleResetFilters = () => {
    setActiveCategory("All");
    setSearchQuery("");
    setSizeFilter("All");
    setSortBy("featured");
    setVisibleCount(INITIAL_BATCH_SIZE);
  };

  return (
    <section id="catalog-section" style={{ padding: "clamp(28px, 4.5vw, 52px) 0 24px", width: "100%", maxWidth: "100vw", scrollMarginTop: "80px" }}>
      <div className="container">
        
        {/* Section Header */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "14px",
          marginBottom: "22px"
        }}>
          <div>
            <span className="font-sans" style={{ fontSize: "clamp(0.72rem, 1.8vw, 0.80rem)", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent-gold-dark)", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={14} style={{ color: "var(--accent-gold)" }} />
              <span>Bespoke Silhouettes & Kurtis</span>
            </span>
            <h2 className="font-display" style={{ fontSize: "clamp(1.6rem, 4.5vw, 2.5rem)", color: "var(--text-primary)", marginTop: "4px" }}>
              {activeCategory === "All" ? "The Signature Collection" : `${activeCategory} Collection`}
            </h2>
          </div>

          <div style={{ fontSize: "clamp(0.76rem, 1.8vw, 0.88rem)", color: "var(--text-secondary)", background: "#ffffff", padding: "7px 16px", borderRadius: "var(--radius-full)", border: "1.5px solid var(--border-gold)", boxShadow: "var(--shadow-xs)" }}>
            Showing <strong style={{ color: "var(--accent-gold-dark)", fontWeight: 800 }}>{displayedProducts.length}</strong> of {sortedProducts.length} outfits
          </div>
        </div>

        {/* Category Pills Component */}
        <CategoryPills />

        {/* Control Bar: Size Filter, Sorting, Active Tags */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "14px",
          padding: "clamp(14px, 2.5vw, 20px)",
          background: "#ffffff",
          border: "1.5px solid var(--border-gold)",
          borderRadius: "var(--radius-md)",
          margin: "14px 0 30px",
          boxShadow: "0 6px 20px rgba(44, 30, 10, 0.04)"
        }}>
          
          {/* Size Filter Pills */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", maxWidth: "100%" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "5px", marginRight: "2px" }}>
              <SlidersHorizontal size={14} style={{ color: "var(--accent-gold)" }} />
              <span>Size:</span>
            </span>

            <button
              onClick={() => setSizeFilter("All")}
              style={{
                padding: "4px 10px",
                fontSize: "0.76rem",
                borderRadius: "var(--radius-xs)",
                border: sizeFilter === "All" ? "1.5px solid var(--accent-gold-dark)" : "1px solid var(--border-gold)",
                background: sizeFilter === "All" ? "linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(179, 135, 40, 0.32) 100%)" : "transparent",
                color: sizeFilter === "All" ? "var(--accent-gold-dark)" : "var(--text-secondary)",
                cursor: "pointer",
                fontWeight: 700,
                transition: "all var(--transition-fast)"
              }}
            >
              All
            </button>

            {STANDARD_SIZES.map((size) => {
              const isSelected = sizeFilter === size;
              return (
                <button
                  key={size}
                  onClick={() => setSizeFilter(size)}
                  style={{
                    padding: "4px 10px",
                    fontSize: "0.76rem",
                    borderRadius: "var(--radius-xs)",
                    border: isSelected ? "1.5px solid var(--accent-gold-dark)" : "1px solid var(--border-gold)",
                    background: isSelected ? "linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(179, 135, 40, 0.32) 100%)" : "transparent",
                    color: isSelected ? "var(--accent-gold-dark)" : "var(--text-secondary)",
                    cursor: "pointer",
                    fontWeight: 700,
                    transition: "all var(--transition-fast)"
                  }}
                >
                  {size}
                </button>
              );
            })}
          </div>

          {/* Sort By Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.80rem", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "5px" }}>
              <ArrowDownUp size={14} style={{ color: "var(--accent-gold)" }} />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
              style={{
                padding: "6px 12px",
                height: "36px",
                width: "auto",
                maxWidth: "100%",
                fontSize: "0.82rem",
                background: "#ffffff",
                border: "1.5px solid var(--border-gold)",
                fontWeight: 600,
                borderRadius: "var(--radius-sm)",
                cursor: "pointer"
              }}
            >
              <option value="featured">Featured & Best Sellers</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

        </div>

        {/* Product Grid with Staggered Scroll-Reveal Wrappers */}
        {sortedProducts.length > 0 ? (
          <>
            <div ref={gridContainerRef} className="product-grid-layout">
              {displayedProducts.map((product, index) => (
                <div 
                  key={product.id}
                  className="scroll-reveal scroll-reveal-card"
                  style={{
                    transitionDelay: `${(index % 4) * 0.08}s`
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Smart Luxury Load More & Progress Controller */}
            {sortedProducts.length > INITIAL_BATCH_SIZE && (
              <div style={{
                marginTop: "40px",
                padding: "26px 18px",
                background: "#ffffff",
                borderRadius: "var(--radius-lg)",
                border: "1.5px solid var(--border-gold-bright)",
                boxShadow: "0 6px 24px rgba(44, 30, 10, 0.05)",
                textAlign: "center",
                maxWidth: "500px",
                margin: "40px auto 0"
              }}>
                {/* Progress Text */}
                <div style={{ fontSize: "0.86rem", color: "var(--text-secondary)", marginBottom: "10px", fontWeight: 600 }}>
                  Showing <strong style={{ color: "var(--accent-gold-dark)" }}>{displayedProducts.length}</strong> of {sortedProducts.length} Curated Designs
                </div>

                {/* Progress Bar Track */}
                <div style={{
                  width: "100%",
                  height: "7px",
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-full)",
                  overflow: "hidden",
                  marginBottom: "20px",
                  border: "1px solid var(--border-subtle)"
                }}>
                  <div style={{
                    width: `${progressPercent}%`,
                    height: "100%",
                    background: "var(--accent-gold-gradient)",
                    borderRadius: "var(--radius-full)",
                    transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
                  }} />
                </div>

                {/* Buttons State */}
                {remainingCount > 0 ? (
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                      onClick={handleLoadMore}
                      className="btn btn-gold"
                      style={{ padding: "11px 26px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "8px" }}
                    >
                      <ChevronDown size={17} />
                      <span>Load More Designs (+{Math.min(remainingCount, INITIAL_BATCH_SIZE)})</span>
                    </button>

                    {remainingCount > INITIAL_BATCH_SIZE && (
                      <button
                        onClick={handleViewAll}
                        className="btn btn-secondary"
                        style={{ padding: "11px 20px", fontWeight: 600, borderColor: "var(--border-gold)" }}
                      >
                        <span>View All ({sortedProducts.length})</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <div style={{ color: "var(--accent-emerald)", fontWeight: 700, fontSize: "0.88rem", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <Check size={17} />
                      <span>You have viewed all {sortedProducts.length} designs in this collection</span>
                    </div>
                    <button
                      onClick={handleScrollToTop}
                      className="btn btn-secondary btn-sm"
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "4px" }}
                    >
                      <ArrowUp size={14} style={{ color: "var(--accent-gold)" }} />
                      <span>Back to Top</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <div style={{
            textAlign: "center",
            padding: "clamp(44px, 8vw, 72px) 18px",
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1.5px dashed var(--border-gold)",
            maxWidth: "500px",
            margin: "0 auto",
            boxShadow: "var(--shadow-xs)"
          }}>
            <Search size={38} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
            <h3 className="font-serif" style={{ fontSize: "1.25rem", color: "var(--text-primary)", marginBottom: "8px" }}>
              No Outfits Found
            </h3>
            <p className="text-secondary" style={{ fontSize: "0.88rem", marginBottom: "20px", lineHeight: 1.5 }}>
              No clothing items matched your active filters {searchQuery ? `for "${searchQuery}"` : ""}. Try adjusting your size or category selection.
            </p>
            <button
              onClick={handleResetFilters}
              className="btn btn-gold btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <RefreshCw size={14} />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
