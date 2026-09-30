/* =====================================================================
   1. YOUR DESIGNS  (the only part you need to edit regularly)
   ---------------------------------------------------------------------
   Put image files in the /images/ folder, then add them here.
   Simple:    "6.jpeg"
   With info: { file: "7.jpeg", category: "Posters", title: "Diwali poster" }
   Images without a category go under "Other".
   ===================================================================== */
const designs = [
  { file: "1.jpeg", category: "Posters" },
  { file: "2.jpeg", category: "Social Media" },
  { file: "3.jpeg", category: "Branding" },
  { file: "4.jpeg", category: "Packaging" },
  { file: "5.jpeg", category: "Advertisements" },
  { file: "6.jpeg", category: "Posters" },
  { file: "7.jpeg", category: "Social Media" },
  { file: "8.jpeg", category: "Branding" },
  { file: "9.jpeg", category: "Packaging" },
  { file: "10.jpeg", category: "Advertisements" },
  { file: "11.jpeg", category: "Posters" },
  { file: "12.jpeg", category: "Social Media" },
  { file: "13.jpeg", category: "Branding" },
  { file: "15.jpeg", category: "Packaging" },
  { file: "16.jpeg", category: "Advertisements" },
  { file: "17.jpeg", category: "Posters" },
  { file: "18.jpeg", category: "Social Media" },
  { file: "19.jpeg", category: "Branding" },
  { file: "20.jpeg", category: "Packaging" },
  { file: "21.jpeg", category: "Advertisements" },
];

/* 2. CATEGORIES: add, remove or rename. "All" is always first.
   Names must match the category text used above. */
const categories = ["Posters", "Social Media", "Branding", "Packaging", "Advertisements", "Certificates", "Other"];

const IMAGE_FOLDER = "images/";

/* ===================== Code below: no need to edit ===================== */
const $ = (id) => document.getElementById(id);
const items = designs.map((d, i) => {
  const o = typeof d === "string" ? { file: d } : d;
  return { file: o.file, category: o.category || "Other", title: o.title || `Design ${i + 1}` };
});
let visible = [];   // items in the current filter (working set of the lightbox)
let current = 0;

/* ---------- Gallery ---------- */
const gallery = $("gallery");

function renderFilters() {
  const used = categories.filter((c) => items.some((it) => it.category === c));
  if (used.length < 1) return;                      // no filters if nothing to filter
  const wrap = $("filters");
  ["All", ...used].forEach((cat, i) => {
    const b = document.createElement("button");
    b.textContent = cat;
    b.setAttribute("role", "tab");
    if (i === 0) b.classList.add("active");
    b.onclick = () => {
      wrap.querySelectorAll("button").forEach((x) => x.classList.toggle("active", x === b));
      renderGallery(cat);
    };
    wrap.appendChild(b);
  });
}

function renderGallery(cat = "All") {
  gallery.innerHTML = "";
  visible = items.filter((it) => cat === "All" || it.category === cat);
  visible.forEach((it, i) => {
    const card = document.createElement("figure");
    card.className = "card";
    card.tabIndex = 0;
    card.dataset.cat = it.category;
    card.style.animationDelay = Math.min(i * 40, 400) + "ms";
    const img = document.createElement("img");
    img.src = IMAGE_FOLDER + it.file;
    img.alt = `${it.title} by Rahul Debnath`;
    img.loading = "lazy";                           // lazy loading
    img.decoding = "async";
    img.onload = () => { img.classList.add("loaded"); card.classList.add("loaded-card"); };
    img.onerror = () => {                           // missing file: drop the card quietly
      const idx = visible.indexOf(it);
      if (idx > -1) visible.splice(idx, 1);
      card.remove();
      $("empty").hidden = gallery.children.length > 0;
    };
    card.appendChild(img);
    card.onclick = () => openLightbox(visible.indexOf(it));
    card.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); card.click(); } };
    gallery.appendChild(card);
  });
  $("empty").hidden = visible.length > 0;
}

/* ---------- Lightbox ---------- */
const lb = $("lightbox"), lbImg = $("lbImg");
let lastFocus = null;

function show(i) {
  if (!visible.length) return closeLightbox();
  current = (i + visible.length) % visible.length;
  const it = visible[current];
  lbImg.style.opacity = 0;
  lbImg.onload = () => (lbImg.style.opacity = 1);
  lbImg.src = IMAGE_FOLDER + it.file;
  lbImg.alt = it.title;
  $("lbCap").textContent = `${it.title} · ${it.category}`;
  $("lbCount").textContent = `${current + 1} / ${visible.length}`;
  const multi = visible.length > 1;
  $("lbPrev").style.display = $("lbNext").style.display = multi ? "" : "none";
}
function openLightbox(i) {
  lastFocus = document.activeElement;
  lb.hidden = false;
  document.body.classList.add("locked");
  show(i);
  requestAnimationFrame(() => lb.classList.add("open"));
  $("lbClose").focus();
}
function closeLightbox() {
  lb.classList.remove("open");
  document.body.classList.remove("locked");
  setTimeout(() => { lb.hidden = true; }, 350);
  if (lastFocus) lastFocus.focus();
}
$("lbClose").onclick = closeLightbox;
$("lbPrev").onclick = () => show(current - 1);
$("lbNext").onclick = () => show(current + 1);
lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
document.addEventListener("keydown", (e) => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") show(current - 1);
  if (e.key === "ArrowRight") show(current + 1);
});
/* Swipe gestures */
let sx = 0, sy = 0;
lb.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
lb.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
  else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) closeLightbox();
}, { passive: true });

/* ---------- Navigation, back-to-top, reveal, loader ---------- */
const nav = $("nav"), burger = $("burger"), links = $("links"), toTop = $("toTop");
burger.onclick = () => {
  const open = links.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};
links.querySelectorAll("a").forEach((a) => (a.onclick = () => { links.classList.remove("open"); burger.setAttribute("aria-expanded", false); }));
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", scrollY > 30);
  toTop.classList.toggle("show", scrollY > 700);
}, { passive: true });
toTop.onclick = () => scrollTo({ top: 0, behavior: "smooth" });

const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

renderFilters();
renderGallery();
window.addEventListener("load", () => {
  setTimeout(() => { $("loader").classList.add("done"); document.body.classList.add("ready"); }, 450);
});
