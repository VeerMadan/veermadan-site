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
  currentText = text[i];

  if (!isDeleting) {
    document.getElementById("typing").textContent =
      currentText.substring(0, j++);
  } else {
    document.getElementById("typing").textContent =
      currentText.substring(0, j--);
  }

  // FULL WORD TYPED → HOLD
  if (j === currentText.length && !isDeleting) {
    isDeleting = true;
    setTimeout(typeEffect, 3000); // 🔥 3 second pause
    return;
  }

  // WORD DELETED → NEXT WORD
  if (j === 0 && isDeleting) {
    isDeleting = false;
    i = (i + 1) % text.length;
  }

  setTimeout(typeEffect, isDeleting ? 50 : 100);
}

typeEffect();
const toggle = document.getElementById("themeToggle");
const transition = document.querySelector(".theme-transition");

if (toggle && transition) {
  toggle.addEventListener("change", () => {

    transition.style.opacity = "1";
    transition.style.transform = "translateY(0%)";

    setTimeout(() => {
      document.body.classList.toggle("light");
    }, 350);

    setTimeout(() => {
      transition.style.transform = "translateY(-100%)";
      transition.style.opacity = "0";
    }, 700);
  });
}
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
*/  

function animateSubs() {
  const el = document.getElementById("subCount");
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
