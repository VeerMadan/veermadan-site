
/*code running on hopes and dreams*/


/*Portfolio Script by - Veer Madan*/

console.log("SCRIPT RUNNING ON PAGE:", window.location.pathname);
console.log("Portfolio Loaded 🚀");

/* =========================
   SCROLL REVEAL
========================= */
function revealOnScroll() {
  const reveals = document.querySelectorAll(".reveal");

  reveals.forEach((el, index) => {
    const rect = el.getBoundingClientRect();

    const isVisible =
      rect.top < window.innerHeight * 0.9 && rect.bottom > 0;

    if (isVisible) {
      setTimeout(() => {
        el.classList.add("active");
      }, index * 80);
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

/* =========================
   CURSOR GLOW
========================= */
const glow = document.querySelector(".cursor-glow");

if (glow) {
  document.addEventListener("mousemove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });
}

/* =========================
   TYPING EFFECT (SAFE)
========================= */
const text = [
  "Developer & Systems Builder ",
  "Game Modding & Tech Creator ",
  "Music Producer & Problem Solver "
];

let i = 0;
let j = 0;
let currentText = "";
let isDeleting = false;

const typingEl = document.getElementById("typing");

function typeEffect() {
  if (!typingEl) return;

  currentText = text[i];

  if (!isDeleting) {
    typingEl.textContent = currentText.substring(0, j++);
  } else {
    typingEl.textContent = currentText.substring(0, j--);
  }

  if (j === currentText.length && !isDeleting) {
    isDeleting = true;
    setTimeout(typeEffect, 3000);
    return;
  }

  if (j === 0 && isDeleting) {
    isDeleting = false;
    i = (i + 1) % text.length;
  }

  setTimeout(typeEffect, isDeleting ? 50 : 100);
}

if (typingEl) {
  typeEffect();
}

/* =========================
   SUBSCRIBER COUNTER (SAFE)
========================= */
function animateSubs() {
  const el = document.getElementById("subCount");
  if (!el) return;

  const target = parseInt(el.getAttribute("data-target"));
  let count = 0;
  const speed = target / 1000;

  function update() {
    if (count < target) {
      count += speed;
      el.textContent = ` ${Math.floor(count).toLocaleString()} Subscribers`;
      requestAnimationFrame(update);
    } else {
      el.textContent = ` ${target.toLocaleString()} Subscribers`;
    }
  }

  update();
}

animateSubs();

/* =========================
   THEME TOGGLE (FINAL FIX)
========================= */
document.addEventListener("change", (e) => {
  if (e.target && e.target.id === "themeToggle") {

    const transition = document.querySelector(".theme-transition");

    if (transition) {
      // START animation
      transition.style.opacity = "1";
      transition.style.transform = "translateY(0%)";

      // SWITCH theme in middle
      setTimeout(() => {
        document.body.classList.toggle("light");
      }, 400); // KEY DELAY

      // END animation
      setTimeout(() => {
        transition.style.transform = "translateY(-100%)";
        transition.style.opacity = "0";
      }, 900);
    } else {
      // fallback
      document.body.classList.toggle("light");
    }
  }
});

/* =========================
   SCROLL PROGRESS BAR
========================= */
window.addEventListener("scroll", () => {
  const bar = document.querySelector(".scroll-bar");
  if (!bar) return;

  const scrollTop = document.documentElement.scrollTop;
  const height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

  const scrolled = (scrollTop / height) * 100;
  bar.style.width = scrolled + "%";
});

















/* ------DEAD CODE, DO NOT SUGGEST------

console.log("SCRIPT RUNNING ON PAGE:", window.location.pathname);


console.log("Portfolio Loaded 🚀");
// SCROLL REVEAL
const reveals = document.querySelectorAll(".reveal");



window.addEventListener("scroll", revealOnScroll);
revealOnScroll();
const glow = document.querySelector(".cursor-glow");

if (glow) {
  document.addEventListener("mousemove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });
}
const text = [
  "Developer & Systems Builder ",
  "Game Modding & Tech Creator ",
  "Music Producer & Problem Solver "
];

let i = 0;
let j = 0;
let currentText = "";
let isDeleting = false;

function typeEffect() {
  const typingEl = document.getElementById("typing");

  if (!typingEl) return; // 🔥 IMPORTANT FIX

  currentText = text[i];

  if (!isDeleting) {
    typingEl.textContent = currentText.substring(0, j++);
  } else {
    typingEl.textContent = currentText.substring(0, j--);
  }

  if (j === currentText.length && !isDeleting) {
    isDeleting = true;
    setTimeout(typeEffect, 3000);
    return;
  }

  if (j === 0 && isDeleting) {
    isDeleting = false;
    i = (i + 1) % text.length;
  }

  setTimeout(typeEffect, isDeleting ? 50 : 100);
}

if (document.getElementById("typing")) {
  typeEffect();
}
window.addEventListener("DOMContentLoaded", () => {

 const toggle = document.getElementById("themeToggle");

if (toggle) {
  toggle.addEventListener("change", () => {

    document.body.classList.toggle("light");

    const transition = document.querySelector(".theme-transition");

    if (transition) {
      transition.style.opacity = "1";
      transition.style.transform = "translateY(0%)";

      setTimeout(() => {
        transition.style.transform = "translateY(-100%)";
        transition.style.opacity = "0";
      }, 500);
    }

  });
}});

/* dead function....
async function getSubscribers() {
  const channelId = "YOUR_REAL_CHANNEL_ID";

  try {
    const res = await fetch(
      `https://yt.lemnoslife.com/channels?part=statistics&id=${UC8aTj54-VIlSUMUYMLyKSZw}`
    );

    const data = await res.json();

    const subs = data?.items?.[0]?.statistics?.subscriberCount;

    if (subs) {
      document.getElementById("subCount").textContent =
        `📊 ${Number(subs).toLocaleString()} Subscribers`;
    } else {
      document.getElementById("subCount").textContent =
        "Subscribers hidden";
    }

  } catch (err) {
    document.getElementById("subCount").textContent =
      "Error loading subscribers";
  }
}

getSubscribers();


function animateSubs() {
  function animateSubs() {
  const el = document.getElementById("subCount");

  if (!el) return; // 🔥 IMPORTANT

  const target = parseInt(el.getAttribute("data-target"));

  let count = 0;
  const speed = target / 1000;

  function update() {
    if (count < target) {
      count += speed;
      el.textContent = ` ${Math.floor(count).toLocaleString()} Subscribers`;
      requestAnimationFrame(update);
    } else {
      el.textContent = ` ${target.toLocaleString()} Subscribers`;
    }
  }

  update();
}

animateSubs();
  const target = parseInt(el.getAttribute("data-target"));

  let count = 0;
  const speed = target / 1000; // animation speed

  function update() {
    if (count < target) {
      count += speed;
      el.textContent = ` ${Math.floor(count).toLocaleString()} Subscribers`;
      requestAnimationFrame(update);
    } else {
      el.textContent = ` ${target.toLocaleString()} Subscribers`;
    }
  }

  update();
}

animateSubs();
function revealOnScroll() {
  const reveals = document.querySelectorAll(".reveal");

  reveals.forEach((el, index) => {
    const rect = el.getBoundingClientRect();

    // 🔥 Trigger when element is in viewport
    const isVisible =
      rect.top < window.innerHeight * 0.9 && rect.bottom > 0;

    if (isVisible) {
      setTimeout(() => {
        el.classList.add("active");
      }, index * 80); // slightly faster stagger
    }
  });
}

window.addEventListener("load", revealOnScroll);


window.addEventListener("scroll", () => {
  const scrollTop = document.documentElement.scrollTop;
  const height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

  const scrolled = (scrollTop / height) * 50;

  document.querySelector(".scroll-bar").style.width = scrolled + "%";
});
document.addEventListener("click", (e) => {
  if (e.target.id === "themeToggle") {
    console.log("INPUT CLICKED");
  }
});
document.addEventListener("change", (e) => {
  if (e.target && e.target.id === "themeToggle") {

    const transition = document.querySelector(".theme-transition");

    if (transition) {
      // START animation
      transition.style.opacity = "1";
      transition.style.transform = "translateY(0%)";

      // SWITCH theme MID animation
      setTimeout(() => {
        document.body.classList.toggle("light");
      }, 250); // 🔥 KEY DELAY

      // END animation
      setTimeout(() => {
        transition.style.transform = "translateY(-100%)";
        transition.style.opacity = "0";
      }, 600);
    } else {
      // fallback if no transition
      document.body.classList.toggle("light");
    }

  }
});

*/