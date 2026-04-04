const clickSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-click-melodic-tone-1129.mp3");
clickSound.volume = 0.3;
clickSound.preload = "auto";

let allMessages = [];
let messageMap = {};
let currentThreadKey = "";
let myName = "";

function buildMessageMap() {
  messageMap = {};
  allMessages.forEach((msg, index) => {
    const key = msg.content?.trim();
    if (key) {
      if (!messageMap[key]) messageMap[key] = [];
      messageMap[key].push(index);
    }
  });
}

function renderMessages(participants) {
  const chatInner = document.getElementById("chatInner");
  chatInner.innerHTML = "";

  allMessages.forEach((msg, i) => {
    const isMine = msg.sender_name.trim().toLowerCase() === myName.trim().toLowerCase();
    const prevMsg = allMessages[i - 1];
    const sameSender = prevMsg && prevMsg.sender_name === msg.sender_name;

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", isMine ? "you" : "them");
    if (sameSender) messageDiv.classList.add("same-sender");

    const bubble = document.createElement("div");
    bubble.className = "bubble";

    // ---- Message Content Handling ----
    if (msg.content) {
      bubble.innerHTML = typeof twemoji !== "undefined" ? twemoji.parse(msg.content) : msg.content;

    } else if (msg.photos?.length) {
      const img = document.createElement("img");
      img.src = msg.photos[0].uri;
      img.onerror = () => {
        img.replaceWith("📎 Photo not found");
      };
      img.className = "media-preview";
      bubble.appendChild(img);

    } else if (msg.videos?.length) {
      const vid = document.createElement("video");
      vid.src = msg.videos[0].uri;
      vid.controls = true;
      vid.onerror = () => {
        vid.replaceWith("📎 Video not found");
      };
      vid.className = "media-preview";
      bubble.appendChild(vid);

    } else if (msg.share?.link) {
      const linkPreview = document.createElement("a");
      linkPreview.href = msg.share.link;
      linkPreview.target = "_blank";
      linkPreview.rel = "noopener noreferrer";
      linkPreview.textContent = msg.share.title || "🔗 Shared Link";
      linkPreview.className = "shared-link";
      bubble.appendChild(linkPreview);

    } else {
      bubble.textContent = "📎 Attachment not found";
    }

    // ---- Timestamp ----
    const time = new Date(msg.timestamp_ms);
    const timestamp = document.createElement("div");
    timestamp.className = "timestamp";
    timestamp.textContent = time.toLocaleString();

    bubble.appendChild(timestamp);
    bubble.setAttribute("data-index", i);
    bubble.ondblclick = () => toggleHighlight(i, msg.content);


    messageDiv.appendChild(bubble);
    chatInner.appendChild(messageDiv);
  });
  // Apply emojis to all messages using local SVGs
setTimeout(() => {
  if (typeof twemoji !== "undefined") {
    twemoji.parse(document.getElementById("chatInner"), {
      folder: "svg",
      ext: ".svg",
      base: "assets/emojis/"
    });
  }
}, 100);

  



}


function toggleHighlight(index, content) {
  const el = document.querySelector(`[data-index="${index}"]`);
  if (!el) return;

  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("highlighted");
  setTimeout(() => el.classList.remove("highlighted"), 2000);

  const all = JSON.parse(localStorage.getItem("highlighted") || "{}");
  all[currentThreadKey] = all[currentThreadKey] || [];

  if (!all[currentThreadKey].includes(index)) {
    all[currentThreadKey].push(index);
    localStorage.setItem("highlighted", JSON.stringify(all));
  }

  loadHighlights();
}

function loadHighlights() {
  const list = JSON.parse(localStorage.getItem("highlighted") || "{}")[currentThreadKey] || [];
  const container = document.getElementById("highlightList");
  container.innerHTML = "";

  list.forEach((index) => {
    const msg = allMessages[index];
    if (!msg) return;
    const li = document.createElement("li");
    li.textContent = msg.content?.slice(0, 30) || "Attachment";
    li.onclick = () => toggleHighlight(index, msg.content);

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "✕";
    removeBtn.className = "remove-highlight-btn";
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      const highlights = JSON.parse(localStorage.getItem("highlighted") || "{}");
      highlights[currentThreadKey] = highlights[currentThreadKey].filter(i => i !== index);
      localStorage.setItem("highlighted", JSON.stringify(highlights));
      loadHighlights();
    };

    li.appendChild(removeBtn);
    container.appendChild(li);
  });
}

document.getElementById("fileInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  this.value = "";
  document.getElementById("fileNameDisplay").textContent = file.name;
  showLoader(true);

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const json = JSON.parse(e.target.result);
      if (!json.messages || !Array.isArray(json.messages) || !json.participants) {
        throw new Error("Invalid Instagram JSON file.");
      }

      allMessages = json.messages.reverse();
      const participants = json.participants;
      currentThreadKey = participants.map(p => p.name).sort().join("_");

      const identitySelector = document.getElementById("identitySelector");
      identitySelector.innerHTML = "";
      participants.forEach(p => {
        const option = document.createElement("option");
        option.value = p.name;
        option.textContent = p.name;
        identitySelector.appendChild(option);
      });

      identitySelector.classList.remove("hidden");
      identitySelector.onchange = () => {
        myName = identitySelector.value;
        buildMessageMap();
        loadHighlights();
        renderMessages(participants);
        renderChatStats(participants);
        setTimeout(() => {
  if (typeof twemoji !== "undefined") {
  twemoji.parse(document.body, {
  folder: 'svg',
  ext: '.svg',
  base: 'assets/emojis/'  // ✅ Local
});


  }
}, 100);

      };

      // Auto-select first name but let user change it
      identitySelector.value = participants[0].name;
      identitySelector.dispatchEvent(new Event("change"));

    } catch (err) {
      alert("⚠️ Error: " + err.message);
      allMessages = [];
      currentThreadKey = "";
      document.getElementById("chatInner").innerHTML = "";
      document.getElementById("highlightList").innerHTML = "";
    } finally {
      setTimeout(() => showLoader(false), 800);
    }
  };

  reader.readAsText(file);
});

function showLoader(show = true) {
  const loader = document.getElementById("loader");
  if (show) loader.classList.remove("hidden");
  else loader.classList.add("hidden");
}

document.getElementById("search").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const query = e.target.value.trim().toLowerCase();
    if (!query) return;

    const matches = allMessages
      .map((msg, i) => ({ msg, i }))
      .filter(({ msg }) => msg.content && msg.content.toLowerCase().includes(query));

    if (!matches.length) return;

    const current = parseInt(this.dataset.current || 0);
    const next = (current + 1) % matches.length;

    const index = matches[next].i;
    this.dataset.current = next;

    const el = document.querySelector(`[data-index="${index}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("highlighted");
      setTimeout(() => el.classList.remove("highlighted"), 2000);
    }
  }
});

window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  const app = document.querySelector(".app");

  

  // ✅ FIXED Transition: fade out splash and fade in app seamlessly
 setTimeout(() => {
  splash.style.transition = "opacity 0.8s ease-in-out";
  splash.style.opacity = "0";

  setTimeout(() => {
    splash.style.display = "none";

    // 🛠 Make sure app shows up centered
    window.scrollTo(0, 0); // force scroll to top
    app.style.visibility = "visible";
    app.style.opacity = "1";
  }, 700);
}, 2800);

});







setTimeout(() => {
  const quote = "“Every chat tells a story. I just wanted to read it better.”";
  const target = document.getElementById("typedQuote");
  if (!target) return;

  let i = 0;
  function typeNextChar() {
    if (i < quote.length) {
      target.textContent += quote.charAt(i);
      i++;
      setTimeout(typeNextChar, 35);
    }
  }

  typeNextChar();
}, 3200); // starts after splash transition finishes

function renderChatStats(participants) {
  const statsContainer = document.getElementById("chatStats");
  const canvas = document.getElementById("wordCloudCanvas");
  const ctx = canvas.getContext("2d");
  statsContainer.innerHTML = "";

  const userStats = {};
  participants.forEach(p => {
    userStats[p.name] = {
      messages: 0,
      totalWords: 0,
      emojiCount: 0,
      longestMessage: ""
    };
  });

  const emojiRegex = /\p{Emoji}/gu;
  const wordMap = {};
  const stopWords = new Set(["the", "to", "you", "and", "a", "i", "of", "is", "it", "in", "for", "on", "me", "my", "your", "that", "this", "at", "with", "so"]);

  let firstMsgTime = allMessages[0]?.timestamp_ms;
  let lastMsgTime = allMessages[0]?.timestamp_ms;

  allMessages.forEach(msg => {
    const sender = msg.sender_name;
    if (!userStats[sender]) return;

    const content = (msg.content || "").trim();
    if (!content) return;

    userStats[sender].messages++;
    const words = content.split(/\s+/);
    userStats[sender].totalWords += words.length;

    if (content.length > userStats[sender].longestMessage.length) {
      userStats[sender].longestMessage = content;
    }

    const emojis = content.match(emojiRegex);
    if (emojis) userStats[sender].emojiCount += emojis.length;

    // For word cloud
    words.forEach(w => {
      const word = w.toLowerCase().replace(/[^a-z']/g, '');
      if (word && !stopWords.has(word)) {
        wordMap[word] = (wordMap[word] || 0) + 1;
      }
    });

    if (msg.timestamp_ms < firstMsgTime) firstMsgTime = msg.timestamp_ms;
    if (msg.timestamp_ms > lastMsgTime) lastMsgTime = msg.timestamp_ms;
  });

  const formatDate = ts =>
    new Date(ts).toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });

  statsContainer.innerHTML += `<div><strong>🗓️ First Message:</strong> ${formatDate(firstMsgTime)}</div>`;
  statsContainer.innerHTML += `<div><strong>⏳ Last Message:</strong> ${formatDate(lastMsgTime)}</div><hr style="margin: 8px 0;">`;

  participants.forEach(p => {
    const s = userStats[p.name];
    const avgLen = (s.totalWords / s.messages || 0).toFixed(1);
    const shortPreview = s.longestMessage.slice(0, 120);
    const isLong = s.longestMessage.length > 120;

    const longMsgDivId = `longest-${p.name.replace(/\s+/g, '_')}`;

    statsContainer.innerHTML += `
      <div><strong>👤 ${p.name}</strong></div>
      <div>• Messages Sent: ${s.messages}</div>
      <div>• Avg. Msg Length: ${avgLen} words</div>
      <div>• Emojis Used: ${s.emojiCount}</div>
      <div>• 📏 Longest Message:</div>
      <div id="${longMsgDivId}" style="margin-bottom: 8px; font-style: italic; color: #aaa;">
        "${isLong ? shortPreview + '…' : shortPreview}"
        ${isLong ? `<br><button onclick="toggleFullMessage('${longMsgDivId}', \`${s.longestMessage.replace(/`/g, "\\`")}\`)">View Full</button>` : ''}
      </div>
    `;
  });

  renderWordCloud(ctx, wordMap);
}

function toggleFullMessage(divId, fullText) {
  const div = document.getElementById(divId);
  div.innerHTML = `"${fullText}"`;
}
function renderWordCloud(ctx, wordMap) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const words = Object.entries(wordMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30); // Limit to top 30 words

  if (!words.length) {
    ctx.fillStyle = "#999";
    ctx.font = "14px Arial";
    ctx.fillText("No data to display", 10, 30);
    return;
  }

  let x = 10, y = 30;
  const maxSize = 32, minSize = 12;

  words.forEach(([word, count], i) => {
    const fontSize = minSize + (maxSize - minSize) * (count / words[0][1]);
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = `hsl(${(i * 40) % 360}, 70%, 70%)`;

    ctx.fillText(word, x, y);
    x += ctx.measureText(word).width + 10;

    if (x > ctx.canvas.width - 100) {
      x = 10;
      y += fontSize + 10;
    }
  });
}

function togglePanel(panelId, header) {
  const panel = document.getElementById(panelId);
  if (!panel) return;

  panel.classList.toggle("open");

  // Arrow rotation
  const arrow = header.querySelector(".arrow");
  if (arrow) {
    arrow.style.transform = panel.classList.contains("open") ? "rotate(0deg)" : "rotate(-90deg)";
  }

  // Pulse animation
  header.classList.add("pulsing");
  setTimeout(() => header.classList.remove("pulsing"), 600);

  // Sound (wrapped in try-catch to avoid browser autoplay error)
  try {
    clickSound.currentTime = 0;
    clickSound.play();
  } catch (e) {
    console.warn("Click sound blocked by browser:", e);
  }
}



document.addEventListener("DOMContentLoaded", () => {
  const welcomeScreen = document.getElementById("welcomeScreen");
  const splashScreen = document.getElementById("splash");
  const app = document.querySelector(".app");
  const startBtn = document.getElementById("startToolBtn");

  // Hide splash and app initially
  splashScreen.style.display = "none";
  app.style.opacity = "0";

  startBtn.addEventListener("click", () => {
    const audio = document.getElementById("introAudio");
if (audio) {
  audio.currentTime = 0;
  audio.volume = 0.7;
  audio.play().catch(() => {});
}
    // Hide welcome, show splash
    welcomeScreen.style.display = "none";
    splashScreen.style.display = "flex";

    // Start transition to main app after splash
    setTimeout(() => {
      splashScreen.classList.add("fade-out");
      setTimeout(() => {
        splashScreen.style.display = "none";
        app.style.opacity = "1";
      }, 1000); // Allow splash fade-out to finish
    }, 8000); // Show splash for 8s
  });

  // Optional: Disable highlighting text on double click
  document.addEventListener("mousedown", (e) => {
    if (e.detail > 1) e.preventDefault();
  });
});

















/* OLD DEAD CODE, IGNORE BELOW. KEPT FOR REFERENCE
I QUIT

//safe fall back function

function waitForScrollEnd(callback) {
  try {
    let lastY = window.scrollY;
    let stableCount = 0;

    function check() {
      const currentY = window.scrollY;

      if (Math.abs(currentY - lastY) < 2) {
        stableCount++;
      } else {
        stableCount = 0;
      }

      lastY = currentY;

      if (stableCount > 5) {
        callback();
      } else {
        requestAnimationFrame(check);
      }
    }

    requestAnimationFrame(check);
  } catch (e) {
    console.warn("Scroll detection failed, fallback used");
    setTimeout(callback, 400); // fallback
  }
}












const introAudio = new Audio("assets/audio/gta_intro.mp3");
introAudio.volume = 0.6;

let hasPlayedIntro = false;
const clickSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-click-melodic-tone-1129.mp3");
clickSound.volume = 0.3;
clickSound.preload = "auto";

let allMessages = [];
let messageMap = {};
let currentThreadKey = "";
let myName = "";

function buildMessageMap() {
  messageMap = {};
  allMessages.forEach((msg, index) => {
    const key = msg.content?.trim();
    if (key) {
      if (!messageMap[key]) messageMap[key] = [];
      messageMap[key].push(index);
    }
  });
}

function renderMessages(participants) {
  const chatInner = document.getElementById("chatInner");
  chatInner.innerHTML = "";

  allMessages.forEach((msg, i) => {
    const isMine = msg.sender_name.trim().toLowerCase() === myName.trim().toLowerCase();
    const prevMsg = allMessages[i - 1];
    const sameSender = prevMsg && prevMsg.sender_name === msg.sender_name;
    

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", isMine ? "you" : "them");
    if (sameSender) messageDiv.classList.add("same-sender");

    const bubble = document.createElement("div");
    bubble.className = "bubble";

    // ---- Message Content Handling ----
    if (msg.content) {
      bubble.innerHTML = typeof twemoji !== "undefined" ? twemoji.parse(msg.content) : msg.content;

    } else if (msg.photos?.length) {
      const img = document.createElement("img");
      img.src = msg.photos[0].uri;
      img.onerror = () => {
        img.replaceWith("📎 Photo not found");
      };
      img.className = "media-preview";
      bubble.appendChild(img);

    } else if (msg.videos?.length) {
      const vid = document.createElement("video");
      vid.src = msg.videos[0].uri;
      vid.controls = true;
      vid.onerror = () => {
        vid.replaceWith("📎 Video not found");
      };
      vid.className = "media-preview";
      bubble.appendChild(vid);

    } else if (msg.share?.link) {
      const linkPreview = document.createElement("a");
      linkPreview.href = msg.share.link;
      linkPreview.target = "_blank";
      linkPreview.rel = "noopener noreferrer";
      linkPreview.textContent = msg.share.title || "🔗 Shared Link";
      linkPreview.className = "shared-link";
      bubble.appendChild(linkPreview);

    } else {
      bubble.textContent = "📎 Attachment not found";
    }

    // ---- Timestamp ----
    const time = new Date(msg.timestamp_ms);
    const timestamp = document.createElement("div");
    timestamp.className = "timestamp";
    timestamp.textContent = time.toLocaleString();

    bubble.appendChild(timestamp);
    bubble.setAttribute("data-index", i);

    bubble.ondblclick = () => {
    saveHighlight(i);
    scrollToAndHighlight(i);
  };
    bubble.ondblclick = () => toggleHighlight(i, msg.content);


    messageDiv.appendChild(bubble);
    chatInner.appendChild(messageDiv);
  });
  // Apply emojis to all messages using local SVGs
setTimeout(() => {
  if (typeof twemoji !== "undefined") {
    twemoji.parse(document.getElementById("chatInner"), {
      folder: "svg",
      ext: ".svg",
      base: "assets/emojis/"
    });
  }
}, 100);



}




function loadHighlights() {
  const list = JSON.parse(localStorage.getItem("highlighted") || "{}")[currentThreadKey] || [];
  const container = document.getElementById("highlightList");
  container.innerHTML = "";

  list.forEach((index) => {
    const msg = allMessages[index];
    if (!msg) return;
    const li = document.createElement("li");
    li.textContent = msg.content?.slice(0, 30) || "Attachment";
    li.onclick = () => scrollToAndHighlight(index);

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "✕";
    removeBtn.className = "remove-highlight-btn";
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      const highlights = JSON.parse(localStorage.getItem("highlighted") || "{}");
      highlights[currentThreadKey] = highlights[currentThreadKey].filter(i => i !== index);
      localStorage.setItem("highlighted", JSON.stringify(highlights));
      loadHighlights();
    };

    li.appendChild(removeBtn);
    container.appendChild(li);
  });
}

document.getElementById("fileInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  this.value = "";
  document.getElementById("fileNameDisplay").textContent = file.name;
  showLoader(true);

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const json = JSON.parse(e.target.result);
      if (!json.messages || !Array.isArray(json.messages) || !json.participants) {
        throw new Error("Invalid Instagram JSON file.");
      }

      allMessages = json.messages.reverse();
      const participants = json.participants;
      currentThreadKey = participants.map(p => p.name).sort().join("_");

      const identitySelector = document.getElementById("identitySelector");
      identitySelector.innerHTML = "";
      participants.forEach(p => {
        const option = document.createElement("option");
        option.value = p.name;
        option.textContent = p.name;
        identitySelector.appendChild(option);
      });

      identitySelector.classList.remove("hidden");
      identitySelector.onchange = () => {
        myName = identitySelector.value;
        buildMessageMap();
        loadHighlights();
        renderMessages(participants);
        renderChatStats(participants);
        setTimeout(() => {
  if (typeof twemoji !== "undefined") {
  twemoji.parse(document.body, {
  folder: 'svg',
  ext: '.svg',
  base: 'assets/emojis/'  // 
});


  }
}, 100);

      };

      // TODO:Auto-select first name but let user change it
      // Auto-select first participant as default identity
      // (This is important for group chats where the first sender might not be the user)
      // I quit
      identitySelector.value = participants[0].name;
      identitySelector.dispatchEvent(new Event("change"));

    } catch (err) {
      alert("⚠️ Error: " + err.message);
      allMessages = [];
      currentThreadKey = "";
      document.getElementById("chatInner").innerHTML = "";
      document.getElementById("highlightList").innerHTML = "";
    } finally {
      setTimeout(() => showLoader(false), 800);
    }
  };

  reader.readAsText(file);
});

function showLoader(show = true) {
  const loader = document.getElementById("loader");
  if (show) loader.classList.remove("hidden");
  else loader.classList.add("hidden");
}

document.getElementById("search").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const query = e.target.value.trim().toLowerCase();
    if (this.dataset.lastQuery !== query) {
  this.dataset.current = 0;
  this.dataset.lastQuery = query;
}
    if (!query) return;

    // Reset cycle if new query
    if (this.dataset.lastQuery !== query) {
      this.dataset.current = 0;
      this.dataset.lastQuery = query;
    }

    const matches = allMessages
      .map((msg, i) => ({ msg, i }))
      .filter(({ msg }) => msg.content && msg.content.toLowerCase().includes(query));

    if (!matches.length) return;

    const current = parseInt(this.dataset.current || 0);
    const next = (current + 1) % matches.length;

    const index = matches[next].i;
    this.dataset.current = next;

    const el = document.querySelector(`[data-index="${index}"]`);
    if (!el) return;

    // Scroll first
    scrollToAndHighlight(index);

    // THEN highlight (after scroll delay)
    setTimeout(() => {
      el.classList.remove("highlighted");
      void el.offsetWidth;
      el.classList.add("highlighted");

      setTimeout(() => {
        el.classList.remove("highlighted");
      }, 2000);
    }, 400); // 👈 key delay
  }
});








setTimeout(() => {
  const quote = "“Every chat tells a story. I just wanted to read it better.”";
  const target = document.getElementById("typedQuote");
  if (!target) return;

  let i = 0;
  function typeNextChar() {
    if (i < quote.length) {
      target.textContent += quote.charAt(i);
      i++;
      setTimeout(typeNextChar, 35);
    }
  }

  typeNextChar();
}, 3200); // starts after splash transition finishes

function renderChatStats(participants) {
  const statsContainer = document.getElementById("chatStats");
  const canvas = document.getElementById("wordCloudCanvas");
  const ctx = canvas.getContext("2d");
  statsContainer.innerHTML = "";

  const userStats = {};
  participants.forEach(p => {
    userStats[p.name] = {
      messages: 0,
      totalWords: 0,
      emojiCount: 0,
      longestMessage: ""
    };
  });

  const emojiRegex = /\p{Emoji}/gu;
  const wordMap = {};
  const stopWords = new Set(["the", "to", "you", "and", "a", "i", "of", "is", "it", "in", "for", "on", "me", "my", "your", "that", "this", "at", "with", "so"]);

  let firstMsgTime = allMessages[0]?.timestamp_ms;
  let lastMsgTime = allMessages[0]?.timestamp_ms;

  allMessages.forEach(msg => {
    const sender = msg.sender_name;
    if (!userStats[sender]) return;

    const content = (msg.content || "").trim();
    if (!content) return;

    userStats[sender].messages++;
    const words = content.split(/\s+/);
    userStats[sender].totalWords += words.length;

    if (content.length > userStats[sender].longestMessage.length) {
      userStats[sender].longestMessage = content;
    }

    const emojis = content.match(emojiRegex);
    if (emojis) userStats[sender].emojiCount += emojis.length;

    // For word cloud
    words.forEach(w => {
      const word = w.toLowerCase().replace(/[^a-z']/g, '');
      if (word && !stopWords.has(word)) {
        wordMap[word] = (wordMap[word] || 0) + 1;
      }
    });

    if (msg.timestamp_ms < firstMsgTime) firstMsgTime = msg.timestamp_ms;
    if (msg.timestamp_ms > lastMsgTime) lastMsgTime = msg.timestamp_ms;
  });

  const formatDate = ts =>
    new Date(ts).toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });

  statsContainer.innerHTML += `<div><strong>🗓️ First Message:</strong> ${formatDate(firstMsgTime)}</div>`;
  statsContainer.innerHTML += `<div><strong>⏳ Last Message:</strong> ${formatDate(lastMsgTime)}</div><hr style="margin: 8px 0;">`;

  participants.forEach(p => {
    const s = userStats[p.name];
    const avgLen = (s.totalWords / s.messages || 0).toFixed(1);
    const shortPreview = s.longestMessage.slice(0, 120);
    const isLong = s.longestMessage.length > 120;

    const longMsgDivId = `longest-${p.name.replace(/\s+/g, '_')}`;

    statsContainer.innerHTML += `
      <div><strong>👤 ${p.name}</strong></div>
      <div>• Messages Sent: ${s.messages}</div>
      <div>• Avg. Msg Length: ${avgLen} words</div>
      <div>• Emojis Used: ${s.emojiCount}</div>
      <div>• 📏 Longest Message:</div>
      <div id="${longMsgDivId}" style="margin-bottom: 8px; font-style: italic; color: #aaa;">
        "${isLong ? shortPreview + '…' : shortPreview}"
        ${isLong ? `<br><button onclick="toggleFullMessage('${longMsgDivId}', \`${s.longestMessage.replace(/`/g, "\\`")}\`)">View Full</button>` : ''}
      </div>
    `;
  });

  renderWordCloud(ctx, wordMap);
}

function toggleFullMessage(divId, fullText) {
  const div = document.getElementById(divId);
  div.innerHTML = `"${fullText}"`;
}
function renderWordCloud(ctx, wordMap) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const words = Object.entries(wordMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30); // Limit to top 30 words

  if (!words.length) {
    ctx.fillStyle = "#999";
    ctx.font = "14px Arial";
    ctx.fillText("No data to display", 10, 30);
    return;
  }

  let x = 10, y = 30;
  const maxSize = 32, minSize = 12;

  words.forEach(([word, count], i) => {
    const fontSize = minSize + (maxSize - minSize) * (count / words[0][1]);
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = `hsl(${(i * 40) % 360}, 70%, 70%)`;

    ctx.fillText(word, x, y);
    x += ctx.measureText(word).width + 10;

    if (x > ctx.canvas.width - 100) {
      x = 10;
      y += fontSize + 10;
    }
  });
}

function togglePanel(panelId, header) {
  const panel = document.getElementById(panelId);
  if (!panel) return;

  panel.classList.toggle("open");

  // Arrow rotation
  const arrow = header.querySelector(".arrow");
  if (arrow) {
    arrow.style.transform = panel.classList.contains("open") ? "rotate(0deg)" : "rotate(-90deg)";
  }

  // Pulse animation
  header.classList.add("pulsing");
  setTimeout(() => header.classList.remove("pulsing"), 600);

  // Sound (wrapped in try-catch to avoid browser autoplay error)
  try {
    clickSound.currentTime = 0;
    clickSound.play();
  } catch (e) {
    console.warn("Click sound blocked by browser:", e);
  }
}



document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startToolBtn");
  const welcome = document.getElementById("welcomeScreen");
  const splash = document.getElementById("splash");
  const app = document.querySelector(".app");

  // Initial state
  splash.style.display = "none";
  app.style.display = "none";

  startBtn.addEventListener("click", () => {
    // Hide welcome
    welcome.style.display = "none";

    // Show splash
    splash.style.display = "flex";

    // Play audio (safe)
    try {
      introAudio.currentTime = 0;
      introAudio.play();
    } catch (e) {
      console.log("Audio blocked");
    }

    // After splash → show app
    setTimeout(() => {
      splash.style.display = "none";
      app.style.display = "flex";
    }, 3000); // keep it simple
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startToolBtn");
  const welcome = document.getElementById("welcomeScreen");
  const splash = document.getElementById("splash");
  const app = document.querySelector(".app");

  // Initial state
  splash.style.display = "none";
  app.style.display = "none";

  startBtn.addEventListener("click", () => {
    // Hide welcome
    welcome.style.display = "none";

    // Show splash
    splash.style.display = "flex";

    // Play audio (safe)
    try {
      introAudio.currentTime = 0;
      introAudio.play();
    } catch (e) {
      console.log("Audio blocked");
    }

    // After splash → show app
    setTimeout(() => {
      splash.style.display = "none";
      app.style.display = "flex";
    }, 3000); // keep it simple
  });
});



// ===== NEW FLOW CONTROL SYSTEM =====

const startBtn = document.getElementById("startToolBtn");
const welcome = document.getElementById("welcomeScreen");
const splash = document.getElementById("splash");
const app = document.querySelector(".app");

// Ensure initial states
splash.classList.add("hidden");
app.classList.add("hidden");

// Start button click
startBtn.addEventListener("click", () => {
  typeSplashText();
  // 🔊 Play intro audio ONCE
if (!hasPlayedIntro) {
  introAudio.currentTime = 0;

  introAudio.play().catch(() => {
    console.log("Audio blocked (user interaction required)");
  });

  hasPlayedIntro = true;
}
  // Hide welcome
  welcome.style.opacity = "0";

  setTimeout(() => {
    welcome.style.display = "none";

    // Show splash
    // Reset animation properly
splash.classList.remove("hidden-init");

// FORCE reflow (this fixes animation not replaying)
void splash.offsetWidth;

splash.style.display = "flex";
splash.style.opacity = "1";

    // Start splash animation timer
    setTimeout(() => {
      splash.style.transition = "opacity 1s ease-in-out";
splash.style.opacity = "0";

      setTimeout(() => {
        splash.style.display = "none";

       // Show main app
app.style.display = "flex";
app.style.visibility = "visible";

setTimeout(() => {
  app.classList.add("show");
}, 50);

      }, 700); // fade out splash

    }, 2800); // splash duration (same as before)

  }, 400);
  // Reset animation properly

});
function typeSplashText() {
  const text = "Loading developer build... 🛠️";
  const target = document.getElementById("splashTyping");

  target.textContent = "";
  let i = 0;

  function type() {
    if (i < text.length) {
      target.textContent += text.charAt(i);
      i++;
      setTimeout(type, 30);
    }
  }

  type();
}


const menuBtn = document.getElementById("menuToggle");
const sidebar = document.getElementById("highlightSidebar");

menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});


document.addEventListener("click", (e) => {
  if (
    window.innerWidth <= 768 &&
    !sidebar.contains(e.target) &&
    !menuBtn.contains(e.target)
  ) {
    sidebar.classList.remove("open");
  }
});




function saveHighlight(index) {
  const all = JSON.parse(localStorage.getItem("highlighted") || "{}");
  all[currentThreadKey] = all[currentThreadKey] || [];

  if (!all[currentThreadKey].includes(index)) {
    all[currentThreadKey].push(index);
    localStorage.setItem("highlighted", JSON.stringify(all));
  }

  loadHighlights();
}
function scrollToAndHighlight(index) {
  const el = document.querySelector(`[data-index="${index}"]`);
  if (!el) return;

  el.scrollIntoView({ behavior: "smooth", block: "center" });

  waitForScrollEnd(() => {
    el.classList.remove("highlighted");
    void el.offsetWidth;
    el.classList.add("highlighted");

    setTimeout(() => {
      el.classList.remove("highlighted");
    }, 2000);
  });
}


function toggleHighlight(index, content) {
  saveHighlight(index);
  scrollToAndHighlight(index);
}




/*OLD DEAD CODE, IGNORE BELOW.
kept for reference, but the new flow control system above is much better and more robust.
The old one had issues with animation not replaying on multiple clicks, and audio not playing after the first time due to how browsers handle autoplay policies. The new system addresses these by properly resetting animations and safely handling audio playback with user interaction checks.
*/