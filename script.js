"use strict";

const MOODS = [
  { key: "senang", label: "Senang", color: "#F8D86B" },
  { key: "tenang", label: "Tenang", color: "#A3CBB3" },
  { key: "biasa", label: "Biasa Saja", color: "#DFD7CB" },
  { key: "sedih", label: "Sedih", color: "#A7D0F5" },
  { key: "kesal", label: "Kesal", color: "#F6B3B3" },
];

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const STORAGE_KEY = "moodlet-data-v1";

/* face emoji */
function faceSVG(key) {
  const s =
    'stroke="#231F1E" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  const faces = {
    senang: `
      <path d="M24 42 Q32 28 40 42" ${s}/>
      <path d="M60 42 Q68 28 76 42" ${s}/>
      <path d="M26 58 Q50 88 74 58 Z" fill="#231F1E" stroke="#231F1E" stroke-width="4" stroke-linejoin="round"/>
      <path d="M36 66 Q50 76 64 66 Q50 72 36 66 Z" fill="#F6B3B3" stroke="none"/>
      <circle cx="20" cy="58" r="5" fill="#E98D7E" opacity=".55"/><circle cx="80" cy="58" r="5" fill="#E98D7E" opacity=".55"/>`,
    tenang: `
      <path d="M24 44 Q32 52 40 44" ${s}/>
      <path d="M60 44 Q68 52 76 44" ${s}/>
      <path d="M38 66 Q50 76 62 66" ${s}/>
      <circle cx="22" cy="58" r="5" fill="#E98D7E" opacity=".4"/><circle cx="78" cy="58" r="5" fill="#E98D7E" opacity=".4"/>`,
    biasa: `
      <circle cx="32" cy="44" r="5" fill="#231F1E"/>
      <circle cx="68" cy="44" r="5" fill="#231F1E"/>
      <path d="M36 68 H64" ${s}/>`,
    sedih: `
      <path d="M24 41 L40 33" ${s} stroke-width="4"/>
      <path d="M76 41 L60 33" ${s} stroke-width="4"/>
      <circle cx="32" cy="52" r="5.5" fill="#231F1E"/>
      <circle cx="68" cy="52" r="5.5" fill="#231F1E"/>
      <circle cx="30.5" cy="50.5" r="1.8" fill="#fff"/><circle cx="66.5" cy="50.5" r="1.8" fill="#fff"/>
      <path d="M38 75 Q50 66 62 75" ${s}/>
      <path d="M72 58 Q78 68 72 72 Q66 68 72 58 Z" fill="#6FA8DC" stroke="#4A86C5" stroke-width="2"/>`,
    kesal: `
      <path d="M22 32 L42 42" ${s}/>
      <path d="M78 32 L58 42" ${s}/>
      <circle cx="33" cy="50" r="5" fill="#231F1E"/>
      <circle cx="67" cy="50" r="5" fill="#231F1E"/>
      <path d="M36 74 Q50 62 64 74" ${s}/>
      <path d="M84 18 l4 8 M90 16 l-2 8 M80 22 l8 2" stroke="#D94E41" stroke-width="3" stroke-linecap="round"/>`,
  };
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">${faces[key]}</svg>`;
}

/* Nav hamburger */
const hamburger = document.getElementById("hamburger");
const mainNav = document.getElementById("mainNav");
if (hamburger && mainNav) {
  const toggleNav = (open) => {
    hamburger.classList.toggle("open", open);
    mainNav.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", String(open));
    hamburger.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  };
  hamburger.addEventListener("click", () =>
    toggleNav(!mainNav.classList.contains("open")),
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") toggleNav(false);
  });
  document.addEventListener("click", (e) => {
    if (!mainNav.contains(e.target) && !hamburger.contains(e.target))
      toggleNav(false);
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) toggleNav(false);
  });
}

/* About: pasang wajah */
document.querySelectorAll(".about-face").forEach((el) => {
  el.innerHTML = faceSVG(el.dataset.face);
});

/* Kalender */
if (document.getElementById("calendarGrid")) initCalendarPage();

function initCalendarPage() {
  const $ = (id) => document.getElementById(id);
  const el = {
    faceCircle: $("faceCircle"),
    moodLabel: $("moodLabel"),
    dots: $("dots"),
    carousel: $("carousel"),
    prevMood: $("prevMood"),
    nextMood: $("nextMood"),
    note: $("stickyNote"),
    noteDate: $("noteDate"),
    noteText: $("noteText"),
    saveNote: $("saveNote"),
    closeNote: $("closeNote"),
    grid: $("calendarGrid"),
    monthTitle: $("monthTitle"),
    yearBadge: $("yearBadge"),
    prevMonth: $("prevMonth"),
    nextMonth: $("nextMonth"),
    modal: $("modal"),
    modalBackdrop: $("modalBackdrop"),
    modalNote: $("modalNote"),
    modalClose: $("modalClose"),
    modalFace: $("modalFace"),
    modalDate: $("modalDate"),
    modalMood: $("modalMood"),
    modalText: $("modalText"),
    modalEdit: $("modalEdit"),
    modalDelete: $("modalDelete"),
  };

  const today = new Date();
  const state = {
    moodIndex: 0,
    year: today.getFullYear(),
    month: today.getMonth(),
    selected: toKey(today),
    modalKey: null,
  };

  /* Util tanggal & storage */
  function toKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function keyOf(y, m, d) {
    return toKey(new Date(y, m, d));
  }
  function prettyDate(key) {
    const [y, m, d] = key.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return `${DAYS[date.getDay()]}, ${d} ${MONTHS[m - 1]} ${y}`;
  }
  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      alert("Penyimpanan browser tidak tersedia. Catatan tidak bisa disimpan.");
    }
  }

  let data = loadData();
  if (!data) {
    // Data contoh awal: bulan berjalan dan bulan sebelumnya
    const y = today.getFullYear(),
      m = today.getMonth();
    data = {};
    const seed = [
      [
        y,
        m,
        3,
        0,
        "Dapat kabar baik dari kantor hari ini. Traktir diri sendiri es krim!",
      ],
      [y, m, 7, 1, "Pagi yang tenang, sempat jalan kaki dan minum teh hangat."],
      [
        y,
        m,
        12,
        4,
        "Rapat molor dua jam dan semuanya jadi berantakan. Besok harus lebih rapi.",
      ],
      [
        y,
        m - 1,
        5,
        3,
        "Kangen rumah. Telepon ibu sebentar dan perasaanku sedikit membaik.",
      ],
      [
        y,
        m - 1,
        15,
        2,
        "Hari biasa. Kerja, makan, tidur. Tidak ada yang spesial.",
      ],
      [
        y,
        m - 1,
        24,
        0,
        "Ngobrol lama dengan teman lama, tertawa sampai sakit perut.",
      ],
    ];
    seed.forEach(([yy, mm, dd, mood, text]) => {
      data[keyOf(yy, mm, dd)] = { mood: MOODS[mood].key, note: text };
    });
    saveData(data);
  }

  const moodByKey = (k) => MOODS.find((m) => m.key === k) || MOODS[2];

  /* Carousel */
  function renderCarousel(animate = true) {
    const mood = MOODS[state.moodIndex];
    el.faceCircle.style.setProperty("--mood", mood.color);
    el.faceCircle.innerHTML = faceSVG(mood.key);
    el.faceCircle.setAttribute(
      "aria-label",
      `Mood ${mood.label}. Klik untuk menulis catatan`,
    );
    el.moodLabel.textContent = mood.label;
    el.note.style.setProperty("--note", mood.color);
    el.dots.querySelectorAll("button").forEach((b, i) => {
      b.classList.toggle("active", i === state.moodIndex);
      b.setAttribute("aria-selected", String(i === state.moodIndex));
    });
    if (animate) {
      el.faceCircle.classList.remove("swap");
      void el.faceCircle.offsetWidth;
      el.faceCircle.classList.add("swap");
    }
  }
  function setMood(i) {
    state.moodIndex = (i + MOODS.length) % MOODS.length;
    renderCarousel();
  }
  MOODS.forEach((m, i) => {
    const b = document.createElement("button");
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", m.label);
    b.addEventListener("click", () => setMood(i));
    el.dots.appendChild(b);
  });
  el.prevMood.addEventListener("click", () => setMood(state.moodIndex - 1));
  el.nextMood.addEventListener("click", () => setMood(state.moodIndex + 1));

  // Swipe sentuh
  let touchX = null,
    touchY = null,
    swiped = false;
  el.carousel.addEventListener(
    "touchstart",
    (e) => {
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
      swiped = false;
    },
    { passive: true },
  );
  el.carousel.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      setMood(state.moodIndex + (dx < 0 ? 1 : -1));
      swiped = true;
    }
    touchX = touchY = null;
  });
  // Cegah klik tak sengaja setelah swipe
  el.faceCircle.addEventListener("click", (e) => {
    if (swiped) {
      swiped = false;
      e.preventDefault();
      return;
    }
    openNote(state.selected);
  });
  // Panah keyboard
  el.carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") setMood(state.moodIndex - 1);
    if (e.key === "ArrowRight") setMood(state.moodIndex + 1);
  });

  /* Sticky note */
  function openNote(key) {
    state.selected = key;
    el.noteDate.textContent = prettyDate(key);
    const existing = data[key];
    el.noteText.value = existing ? existing.note : "";
    el.note.hidden = false;
    el.note.style.animation = "none";
    void el.note.offsetWidth;
    el.note.style.animation = "";
    el.noteText.focus({ preventScroll: false });
    if (window.innerWidth <= 860)
      el.note.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function closeNote() {
    el.note.hidden = true;
  }

  el.closeNote.addEventListener("click", closeNote);
  el.saveNote.addEventListener("click", () => {
    const mood = MOODS[state.moodIndex];
    data[state.selected] = { mood: mood.key, note: el.noteText.value.trim() };
    saveData(data);
    const [y, m] = state.selected.split("-").map(Number);
    state.year = y;
    state.month = m - 1;
    renderCalendar();
    closeNote();
  });

  /* Kalender */
  function renderCalendar() {
    el.monthTitle.textContent = MONTHS[state.month];
    el.yearBadge.textContent = state.year;
    el.grid.innerHTML = "";

    const firstDay = new Date(state.year, state.month, 1).getDay();
    const total = new Date(state.year, state.month + 1, 0).getDate();
    const todayKey = toKey(new Date());

    for (let i = 0; i < firstDay; i++) {
      const blank = document.createElement("div");
      blank.className = "cell empty";
      el.grid.appendChild(blank);
    }
    for (let d = 1; d <= total; d++) {
      const key = keyOf(state.year, state.month, d);
      const entry = data[key];
      const cell = document.createElement("button");
      cell.className = "cell";
      cell.type = "button";
      if (key === todayKey) cell.classList.add("today");

      if (entry) {
        const mood = moodByKey(entry.mood);
        cell.classList.add("filled");
        cell.style.setProperty("--mood", mood.color);
        cell.innerHTML = `${faceSVG(mood.key)}<span class="num">${d}</span>`;
        cell.setAttribute(
          "aria-label",
          `${d} ${MONTHS[state.month]}, mood ${mood.label}. Buka catatan`,
        );
        cell.addEventListener("click", () => openModal(key));
      } else {
        cell.textContent = d;
        cell.setAttribute(
          "aria-label",
          `${d} ${MONTHS[state.month]}, kosong. Tulis catatan`,
        );
        cell.addEventListener("click", () => openNote(key));
      }
      el.grid.appendChild(cell);
    }
  }
  function shiftMonth(delta) {
    const d = new Date(state.year, state.month + delta, 1);
    state.year = d.getFullYear();
    state.month = d.getMonth();
    renderCalendar();
  }
  el.prevMonth.addEventListener("click", () => shiftMonth(-1));
  el.nextMonth.addEventListener("click", () => shiftMonth(1));

  /* Modal */
  function openModal(key) {
    const entry = data[key];
    if (!entry) return;
    const mood = moodByKey(entry.mood);
    state.modalKey = key;
    el.modalNote.style.setProperty("--note", mood.color);
    el.modalFace.innerHTML = faceSVG(mood.key);
    el.modalDate.textContent = prettyDate(key);
    el.modalMood.textContent = `Mood: ${mood.label}`;
    el.modalText.textContent = entry.note || "Belum ada cerita untuk hari ini.";
    el.modal.hidden = false;
    el.modalClose.focus();
  }
  function closeModal() {
    el.modal.hidden = true;
    state.modalKey = null;
  }
  el.modalClose.addEventListener("click", closeModal);
  el.modalBackdrop.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !el.modal.hidden) closeModal();
  });

  el.modalEdit.addEventListener("click", () => {
    const key = state.modalKey;
    const entry = data[key];
    if (!entry) return;
    state.moodIndex = Math.max(
      0,
      MOODS.findIndex((m) => m.key === entry.mood),
    );
    renderCarousel();
    closeModal();
    openNote(key);
  });
  el.modalDelete.addEventListener("click", () => {
    if (!state.modalKey) return;
    delete data[state.modalKey];
    saveData(data);
    closeModal();
    renderCalendar();
  });

  /* Inisialisasi */
  renderCarousel(false);
  renderCalendar();
}
