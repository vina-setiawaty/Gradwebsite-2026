/*
Mobile-friendly 10-question quiz (p5.js)
Optimized for Telegram, iOS, Android
Screens: Start > Quiz > Calculating > Result
WITH SIMPLE FADE
12 Character Results
Responsive result screen: Landscape (side-by-side) vs Portrait (stacked)
*/

let bg;
var time;
var wait = 6000;
var preparingWait = 5000;

let calc = ["Aligning grids.", "Brewing coffee.","Re-exporting again.","Trusting the process.","Reducing visual noise.","Asking for quick feedback."];
let preparing = ["Sharpening pencils...","Going to Artfriend...", "Searching Pinterest...", "Setting the mood...", "Preparing your journey..."];
let idx = 0;
let lastSwap = 0;
let swapMs = 1200;

const MAX_CONTENT_W = 420; // Phone-width, even on desktop

// Interactive dot grid (matches canvas.js)
const DOT_GRID = {
  spacing: 24,
  attractDistance: 8,
  size: 2,
  color: "#DDD4E0",
};
let dotGridMouseX = 0;
let dotGridMouseY = 0;

// Layout
let pad = 18;
let btnH = 56;
let btnGap = 14;

// App state
let appState = "start"; // "start" | "preparing" | "quiz" | "calculating" | "result"

// Data
let QUESTIONS = [];
let QIMG = {};
let RESULT_IMAGES = {};

let currentIdx = 0;
let answers = [];
let locked = false;
let selectedChoice = null;

// Gallery modal state
let showGallery = false;
let galleryViewChar = null;
let galleryScrollY = 0;
let galleryTouchStart = null;
let galleryDidScroll = false;

// Restored from sessionStorage when user already completed the quiz this session
let storedQuizTool = null;

// Simple fade animation with scaling
let questionAlpha = 0;
let questionScale = 1.0;
let isTransitioning = false;

// Character names mapping
const CHARACTERS = {
  hammer: "Hammer",
  calipers: "Calipers",
  vr: "VR Headset",
  mouse: "Mouse",
  mat: "Cutting Mat",
  glue: "Glue Stick",
  sewing: "Sewing Kit",
  tape: "Duct Tape",
  notepad: "Notepad",
  coffee: "Coffee",
  ruler: "Ruler",
  thumb: "USB Drive"
};

/** Full-size result card PNGs (same files as RESULT_IMAGES in preload). */
const RESULT_PNG_PATHS = {
  hammer: "./quiz_assets/Hammer.png",
  calipers: "./quiz_assets/Calipers.png",
  vr: "./quiz_assets/VR.png",
  mouse: "./quiz_assets/Mouse.png",
  mat: "./quiz_assets/CuttingMat.png",
  glue: "./quiz_assets/GlueStick.png",
  sewing: "./quiz_assets/Sewing.png",
  tape: "./quiz_assets/Tape.png",
  notepad: "./quiz_assets/Notepad.png",
  coffee: "./quiz_assets/Coffee.png",
  ruler: "./quiz_assets/Ruler.png",
  thumb: "./quiz_assets/Thumb.png",
};

const QUIZ_TOOL_SESSION_KEY = "gradshow2026_quizTool";

const gradSiteVisitLabel = "Visit the Gradsite  ↗";

function isValidQuizTool(tool) {
  return tool && Object.prototype.hasOwnProperty.call(CHARACTERS, tool);
}

function loadQuizToolFromSession() {
  try {
    const tool = sessionStorage.getItem(QUIZ_TOOL_SESSION_KEY);
    if (isValidQuizTool(tool)) {
      storedQuizTool = tool;
      return tool;
    }
  } catch (e) {
    // Private mode / storage disabled
  }
  return null;
}

function restoreQuizResultIfSaved() {
  if (loadQuizToolFromSession()) {
    appState = "result";
    questionAlpha = 255;
    questionScale = 1.0;
  }
}

function saveQuizToolToSession() {
  try {
    const tool = getCharacterFromAnswers();
    storedQuizTool = tool;
    sessionStorage.setItem(QUIZ_TOOL_SESSION_KEY, tool);
  } catch (e) {
    // Private mode / storage disabled
  }
}

function clearQuizToolFromSession() {
  storedQuizTool = null;
  try {
    sessionStorage.removeItem(QUIZ_TOOL_SESSION_KEY);
  } catch (e) {
    // Private mode / storage disabled
  }
}

function preload() {
  QIMG.start = loadImage("./quiz_assets/start.png");

  // Question images
  QIMG.q1 = loadImage("./quiz_assets/q1.png");
  QIMG.q2 = loadImage("./quiz_assets/q2.png");
  QIMG.q3 = loadImage("./quiz_assets/q3.png");
  QIMG.q4 = loadImage("./quiz_assets/q4.png");
  QIMG.q5 = loadImage("./quiz_assets/q5.png");
  QIMG.q6 = loadImage("./quiz_assets/q6.png");
  QIMG.q7 = loadImage("./quiz_assets/q7.png");
  QIMG.q8 = loadImage("./quiz_assets/q8.png");
  QIMG.q9 = loadImage("./quiz_assets/q9.png");
  QIMG.q10 = loadImage("./quiz_assets/q10.png");

  // Result images - 12 characters
  RESULT_IMAGES["hammer"] = loadImage("./quiz_assets/Hammer.png");
  RESULT_IMAGES["calipers"] = loadImage("./quiz_assets/Calipers.png");
  RESULT_IMAGES["vr"] = loadImage("./quiz_assets/VR.png");
  RESULT_IMAGES["mouse"] = loadImage("./quiz_assets/Mouse.png");
  RESULT_IMAGES["mat"] = loadImage("./quiz_assets/CuttingMat.png");
  RESULT_IMAGES["glue"] = loadImage("./quiz_assets/GlueStick.png");
  RESULT_IMAGES["sewing"] = loadImage("./quiz_assets/Sewing.png");
  RESULT_IMAGES["tape"] = loadImage("./quiz_assets/Tape.png");
  RESULT_IMAGES["notepad"] = loadImage("./quiz_assets/Notepad.png");
  RESULT_IMAGES["coffee"] = loadImage("./quiz_assets/Coffee.png");
  RESULT_IMAGES["ruler"] = loadImage("./quiz_assets/Ruler.png");
  RESULT_IMAGES["thumb"] = loadImage("./quiz_assets/Thumb.png");
  
  // Thumbnail images for gallery
  RESULT_IMAGES["hammer_thumb"] = loadImage("./quiz_assets/hammer_thumbnail.png");
  RESULT_IMAGES["calipers_thumb"] = loadImage("./quiz_assets/calipers_thumbnail.png");
  RESULT_IMAGES["vr_thumb"] = loadImage("./quiz_assets/vr_thumbnail.png");
  RESULT_IMAGES["mouse_thumb"] = loadImage("./quiz_assets/mouse_thumbnail.png");
  RESULT_IMAGES["mat_thumb"] = loadImage("./quiz_assets/mat_thumbnail.png");
  RESULT_IMAGES["glue_thumb"] = loadImage("./quiz_assets/glue_thumbnail.png");
  RESULT_IMAGES["sewing_thumb"] = loadImage("./quiz_assets/sewing_thumbnail.png");
  RESULT_IMAGES["tape_thumb"] = loadImage("./quiz_assets/tape_thumbnail.png");
  RESULT_IMAGES["notepad_thumb"] = loadImage("./quiz_assets/notepad_thumbnail.png");
  RESULT_IMAGES["coffee_thumb"] = loadImage("./quiz_assets/coffee_thumbnail.png");
  RESULT_IMAGES["ruler_thumb"] = loadImage("./quiz_assets/ruler_thumbnail.png");
  RESULT_IMAGES["thumb_thumb"] = loadImage("./quiz_assets/thumb_thumbnail.png");
}

function setup() {
  
  textFont("Inter Tight");
  textAlign(CENTER, CENTER);
  
  time = millis();

  const c = createCanvas(windowWidth, windowHeight);

  dotGridMouseX = width / 2;
  dotGridMouseY = height / 2;
  window.addEventListener("mousemove", (e) => {
    dotGridMouseX = e.clientX;
    dotGridMouseY = e.clientY;
  });
  window.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length > 0) {
        dotGridMouseX = e.touches[0].clientX;
        dotGridMouseY = e.touches[0].clientY;
      }
    },
    { passive: true }
  );

  setTimeout(() => {
    resizeCanvas(window.innerWidth, window.innerHeight);
  }, 100);

  // iOS Safari + Telegram touch fixes
  c.elt.style.touchAction = "none";
  c.elt.style.webkitUserSelect = "none";
  c.elt.style.webkitTouchCallout = "none";

  initQuizShareUI();

  c.elt.addEventListener(
    "touchstart",
    (e) => e.preventDefault(),
    { passive: false }
  );
  c.elt.addEventListener(
    "touchmove",
    (e) => e.preventDefault(),
    { passive: false }
  );
  c.elt.addEventListener(
    "touchend",
    (e) => e.preventDefault(),
    { passive: false }
  );

  QUESTIONS = [
    {
      id: "q1",
      type: "padding",
      prompt: "You wake up in the morning and there's still an hour left till your alarm rings, what do you do?",
      imgId: "q1",
      choices: ["Sleep in lah, rest is best", "Rise and grind, lets get this bread!"]
    },
    {
      id: "q2",
      type: "padding",
      prompt: "Time to get dressed, what do you wear!",
      imgId: "q2",
      choices: ["Take it chill, I'll wear whats on the chair", "I'm dressing to impress, looking my best!"]
    },
    {
      id: "q3",
      type: "scoring",
      prompt: "Oh no! The bus is delayed and you are late, what do you do?",
      imgId: "q3",
      choices: ["I take another route and update the group.", "Buy snacks and share with everyone"]
    },
    {
      id: "q4",
      type: "scoring",
      prompt: "You finally arrived at your workspace. Your desk situation is… questionable.",
      imgId: "q4",
      choices: ["Carve out a small area in the mess.", "Reset the whole table before anything else"]
    },
    {
      id: "q5",
      type: "scoring",
      prompt: "Your deskmate has been staring at their screen for the past 10 minutes… same tab, same sigh, zero progress.",
      imgId: "q5",
      choices: ["Roll my chair over, What's not working?", "Roll my chair over, Coffee break!!"]
    },
    {
      id: "q6",
      type: "scoring",
      prompt: "The deadline is coming up! You're done, but it's not perfect.",
      imgId: "q6",
      choices: ["Send it. Version two can be better", "Keep tweaking till the last minute"]
    },
    {
      id: "q7",
      type: "padding",
      prompt: "You have a 15-minute break after an intense session.",
      imgId: "q7",
      choices: ["Let's all go for a walk and get a snack!", "Lemme reset my brain in a calm space"]
    },
    {
      id: "q8",
      type: "scoring",
      prompt: "You come across a once-in-a-lifetime moment of beauty, but your hands are full! Do you...",
      imgId: "q8",
      choices: ["Struggle to take out your phone to capture it", "Just enjoy it with your eyes"]
    },
    {
      id: "q9",
      type: "scoring",
      prompt: "Something's not working and you don't know why. Do you...",
      imgId: "q9",
      choices: ["Google it immediately", "Sit and think it through first"]
    },
    {
      id: "q10",
      type: "scoring",
      prompt: "New project brief just dropped. Do you...",
      imgId: "q10",
      choices: ["Start sketching ideas right away", "Read the brief 3 times and make a timeline first"]
    }
  ];

  restoreQuizResultIfSaved();
}

function drawInteractiveDotGrid() {
  const { spacing, attractDistance, size, color } = DOT_GRID;
  const cols = ceil(width / spacing) + 1;
  const rows = ceil(height / spacing) + 1;

  noStroke();
  fill(color);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const px = col * spacing;
      const py = row * spacing;
      const angle = atan2(dotGridMouseY - py, dotGridMouseX - px);
      const x2 = px + attractDistance * cos(angle);
      const y2 = py + attractDistance * sin(angle);
      circle(x2, y2, size);
    }
  }
}

function draw() {
  // Update layout constants dynamically based on current screen size
  pad = max(12, min(22, height * 0.028));
  btnH = max(44, min(60, height * 0.082));
  btnGap = max(8, min(14, height * 0.02));

  background("#FFFFFF"); // Cream background
  drawInteractiveDotGrid();

  // Animation logic
  if (isTransitioning) {
    if (questionAlpha > 0) {
      questionAlpha -= 25;
      questionScale -= 0.012;
      if (questionAlpha < 0) questionAlpha = 0;
      if (questionScale < 0.9) questionScale = 0.9;
    }
  } else {
    if (questionAlpha < 255) {
      questionAlpha += 25;
      questionScale += 0.012;
      if (questionAlpha > 255) questionAlpha = 255;
      if (questionScale > 1.0) questionScale = 1.0;
    }
  }

  // Show rotation prompt for phones held in landscape
  if (width > height && height < 600) {
    drawLandscapeWarning();
    return;
  }

  if (appState === "start") drawStartScreen();
  else if (appState === "preparing") drawPreparingScreen();
  else if (appState === "quiz") drawQuiz();
  else if (appState === "calculating") drawCalculatingScreen();
  else if (appState === "result") drawResultScreen();
}

function drawLandscapeWarning() {
  fill("#FAF6F0"); // Cream background
  noStroke();
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  fill("#7A00DB"); // Purple-600
  textSize(22);
  textStyle(BOLD);
  text("Please rotate your device", width / 2, height / 2 - 18);

  textStyle(NORMAL);
  textSize(15);
  fill("#6B5A73"); // Text muted
  text("This quiz works best in portrait mode", width / 2, height / 2 + 16);
}

/* ---------------- SCREENS ---------------- */

function drawStartScreen() {
  const cw = contentWidth();
  const cx = contentX();

  const imgTop = pad + 20;
  const imgH = height * 0.15;
  drawMediaFrame("start", cx, imgTop, cw, 0.5 * imgH);

  let currentY = imgTop + (1.5 * imgH) + 20;
  const lineHeight = 1.5;

  push();
  textAlign(CENTER);

  textSize(18);
  textStyle(BOLD);
  fill("#7A00DB"); // Purple-600
  let txt1 = "Every design gradshow is more than just the works on display.";
  text(txt1, cx, currentY, cw);
  let lines1 = calculateLines(txt1, cw, 18);
  currentY += (18 * lineHeight * lines1) + 15;

  

  
  
 
  textSize(16);
  textStyle(NORMAL);
  fill("#1A0F22"); // Ink-900 dark text
  let txt2 = "It's the designers and their unique strengths and ways of working. ";
  text(txt2, cx, currentY, cw);
  let lines2 = calculateLines(txt2, cw, 16);
  currentY += (16 * lineHeight * lines2) + 30;

  let txt3 = " Some plan, some improvise. Some are perfectionist, and some just go with vibes. Before heading down to the DID graduation show, let's find out… ";
  text(txt3, cx, currentY, cw);
  let lines3 = calculateLines(txt3, cw, 16);
  currentY += (16 * lineHeight * lines3) + 15;

  let txt4 = "What's your tool type?";
  textStyle(BOLD);
  fill("#7A00DB");
  text(txt4, cx, currentY, cw);

  pop();

  function calculateLines(txt, maxWidth, fontSize) {
    textSize(fontSize);
    let words = txt.split(' ');
    let line = '';
    let lineCount = 1;
    
    for (let i = 0; i < words.length; i++) {
      let testLine = line + words[i] + ' ';
      let testWidth = textWidth(testLine);
      
      if (testWidth > maxWidth && i > 0) {
        line = words[i] + ' ';
        lineCount++;
      } else {
        line = testLine;
      }
    }
    
    return lineCount;
  }

  const btnY = height - pad - btnH;
  drawButton(cx, btnY, cw, btnH, "Start Quiz", isTouching(cx, btnY, cw, btnH));
}

function drawPreparingScreen() {
  const cw = contentWidth();
  const cx = contentX();

  textSize(22); // Heading size from design
  fill("#1A0F22"); // Ink-900
  textStyle(BOLD);
  if (millis() - time >= preparingWait) {
    text("Let's go!", width / 2, height / 2 - 40);
  } else {
    text("Preparing your quiz...", width / 2, height / 2 - 40);
  }
  textStyle(NORMAL);

  textSize(15); // Small text from design
  fill("#6B5A73"); // Text muted
  if (millis() - lastSwap > swapMs) {
    idx = (idx + 1) % preparing.length;
    lastSwap = millis();
  }

  if (millis() - time <= preparingWait) {
    text(preparing[idx], width / 2, height / 2);
  }

  if (millis() - time >= preparingWait) {
    questionAlpha = 0;
    questionScale = 0.9;
    appState = "quiz";
    time = millis();
  }
}

function drawQuiz() {
  if (currentIdx >= QUESTIONS.length) {
    appState = "calculating";
    time = millis();
    return;
  }
  drawQuestionScreen(QUESTIONS[currentIdx]);
}

function finishCalculating() {
  appState = "result";
  saveQuizToolToSession();
}

function drawCalculatingScreen() {
  if (millis() - time >= wait) {
    finishCalculating();
    return;
  }

  textSize(22); // Heading size
  fill("#1A0F22");
  textStyle(BOLD);
  text("Calculating your results…", width / 2, height / 2 - 40);
  textStyle(NORMAL);

  textSize(15);
  fill("#6B5A73");
  if (millis() - lastSwap > swapMs) {
    idx = (idx + 1) % calc.length;
    lastSwap = millis();
  }

  text(calc[idx], width / 2, height / 2);
}

function drawResultScreen() {
  const character = getCharacter();
  const res = RESULT_IMAGES[character];
  
  // Determine layout based on aspect ratio
  const isLandscape = width > height;
  
  if (isLandscape) {
    // DESKTOP/LANDSCAPE: Side-by-side layout
    drawResultScreenLandscape(character, res);
  } else {
    // MOBILE/PORTRAIT: Stacked layout (current)
    drawResultScreenPortrait(character, res);
  }
  
  // Draw gallery modal on top if open
  if (showGallery) {
    drawGalleryModal();
  }
}

// Result buttons: row1 share (full), row2 gradsite (full), row3 retake|seeAll
function getResultButtonLayout() {
  const isLandscape = width > height;
  const btnGapVert = isLandscape
    ? max(12, min(18, height * 0.025))
    : max(10, min(14, height * 0.018));

  if (isLandscape) {
    const MAX_LANDSCAPE_W = 1100;
    const stageW = min(width, MAX_LANDSCAPE_W);
    const stageX = (width - stageW) / 2;
    const leftW = stageW * 0.65;
    const rightW = stageW * 0.35 - pad * 3;
    const rightX = stageX + leftW + pad * 2;
    const rightY = pad + 20;
    const btnHL = max(50, min(60, height * 0.08));
    const btnGapHoriz = max(8, min(12, rightW * 0.03));
    const halfW = (rightW - btnGapHoriz) / 2;
    const blockH = btnHL * 3 + btnGapVert * 2;
    const btn1Y = rightY + (height - pad * 2 - 40 - blockH) / 2;
    const btn2Y = btn1Y + btnHL + btnGapVert;
    const btn3Y = btn2Y + btnHL + btnGapVert;

    return {
      share: { x: rightX, y: btn1Y, w: rightW, h: btnHL },
      visit: { x: rightX, y: btn2Y, w: rightW, h: btnHL },
      retake: { x: rightX, y: btn3Y, w: halfW, h: btnHL },
      seeAll: { x: rightX + halfW + btnGapHoriz, y: btn3Y, w: halfW, h: btnHL },
      firstButtonY: btn1Y,
    };
  }

  const cw = contentWidth();
  const cx = contentX();
  const btnGapHoriz = max(8, min(12, cw * 0.03));
  const halfW = (cw - btnGapHoriz) / 2;
  const btn3Y = height - pad - btnH;
  const btn2Y = btn3Y - btnH - btnGapVert;
  const btn1Y = btn2Y - btnH - btnGapVert;

  return {
    share: { x: cx, y: btn1Y, w: cw, h: btnH },
    visit: { x: cx, y: btn2Y, w: cw, h: btnH },
    retake: { x: cx, y: btn3Y, w: halfW, h: btnH },
    seeAll: { x: cx + halfW + btnGapHoriz, y: btn3Y, w: halfW, h: btnH },
    firstButtonY: btn1Y,
  };
}

function drawResultActionButtons() {
  const B = getResultButtonLayout();
  drawButton(B.share.x, B.share.y, B.share.w, B.share.h, "Share my result  ↗",
    isTouching(B.share.x, B.share.y, B.share.w, B.share.h));
  drawButton(B.visit.x, B.visit.y, B.visit.w, B.visit.h, gradSiteVisitLabel,
    isTouching(B.visit.x, B.visit.y, B.visit.w, B.visit.h));
  drawSecondaryButton(B.retake.x, B.retake.y, B.retake.w, B.retake.h, "Retake the quiz",
    isTouching(B.retake.x, B.retake.y, B.retake.w, B.retake.h));
  drawSecondaryButton(B.seeAll.x, B.seeAll.y, B.seeAll.w, B.seeAll.h, "View all 12 tools",
    isTouching(B.seeAll.x, B.seeAll.y, B.seeAll.w, B.seeAll.h));
}

function handleResultActionTap(px, py) {
  const B = getResultButtonLayout();
  if (hit(px, py, B.visit.x, B.visit.y, B.visit.w, B.visit.h)) {
    window.location.href = "index.html";
    return true;
  }
  if (hit(px, py, B.retake.x, B.retake.y, B.retake.w, B.retake.h)) {
    restartQuiz();
    return true;
  }
  if (hit(px, py, B.seeAll.x, B.seeAll.y, B.seeAll.w, B.seeAll.h)) {
    showGallery = true;
    galleryViewChar = null;
    galleryScrollY = 0;
    return true;
  }
  if (hit(px, py, B.share.x, B.share.y, B.share.w, B.share.h)) {
    shareResult();
    return true;
  }
  return false;
}

function drawResultScreenLandscape(character, res) {
  // Cap total content width on very wide screens for readability
  const MAX_LANDSCAPE_W = 1100;
  const stageW = min(width, MAX_LANDSCAPE_W);
  const stageX = (width - stageW) / 2; // center the stage
  
  // Left side: Result image (65% width)
  const leftW = stageW * 0.65;
  const leftX = stageX + pad;
  const leftY = pad + 20;
  const leftH = height - pad * 2 - 40;
  
  // Draw result image on left
  if (res) {
    const fitted = fitRect(res.width, res.height, leftW, leftH);
    imageMode(CORNER);
    image(res, leftX + fitted.x, leftY + fitted.y, fitted.w, fitted.h);
  } else {
    noStroke();
    fill(245);
    rect(leftX, leftY, leftW, leftH, 16);
    fill(140);
    textSize(14);
    textAlign(CENTER, CENTER);
    text("Result image here", leftX + leftW/2, leftY + leftH/2);
  }
  
  drawResultActionButtons();
}

function drawResultScreenPortrait(character, res) {
  const cw = contentWidth();
  const cx = contentX();
  
  const B = getResultButtonLayout();

  // Calculate image area (from top to first button with padding)
  const imgPadding = 24;
  const imgTop = pad + 20;
  const imgBottom = B.firstButtonY - imgPadding;
  const availableHeight = imgBottom - imgTop;
  
  // Result image
  if (res) {
    const fitted = fitRect(res.width, res.height, cw, availableHeight);
    imageMode(CORNER);
    image(res, cx + fitted.x, imgTop + fitted.y, fitted.w, fitted.h);
  } else {
    noStroke();
    fill(245);
    rect(cx, imgTop, cw, availableHeight, 16);
    fill(140);
    textSize(14);
    textAlign(CENTER, CENTER);
    text("Result image here", width / 2, imgTop + availableHeight / 2);
  }

  drawResultActionButtons();
}

/* ---------------- GALLERY MODAL ---------------- */

const GALLERY_SCROLLBAR = { barW: 6, pad: 8 };

// Fixed 3×4 tools grid — scrolls when content exceeds viewport height
function getGalleryGridLayout() {
  const gridPad = 12;
  const cols = 3;
  const rows = 4;
  const headerH = 60;
  const thumbW = 104;
  const thumbH = thumbW * 1.33;
  const baseModalW = gridPad * (cols + 1) + cols * thumbW;
  const gridH = rows * thumbH + (rows - 1) * gridPad;
  const contentH = gridH + gridPad * 2;
  const idealModalH = headerH + contentH;
  const maxModalH = height - 40;
  const modalH = min(idealModalH, maxModalH);
  const scrollAreaH = modalH - headerH;
  const scrollable = contentH > scrollAreaH;
  const scrollBarExtraW = scrollable
    ? GALLERY_SCROLLBAR.pad + GALLERY_SCROLLBAR.barW + GALLERY_SCROLLBAR.pad
    : 0;
  const modalW = baseModalW + scrollBarExtraW;
  const maxScroll = max(0, contentH - scrollAreaH);
  const modalX = (width - modalW) / 2;
  const modalY = max(20, (height - modalH) / 2);

  return {
    modalX,
    modalY,
    modalW,
    modalH,
    headerH,
    gridPad,
    cols,
    rows,
    thumbW,
    thumbH,
    gridH,
    contentH,
    scrollAreaH,
    scrollable,
    scrollBarExtraW,
    maxScroll,
    closeSize: 40,
  };
}

function clampGalleryScroll(G) {
  galleryScrollY = constrain(galleryScrollY, 0, G.maxScroll);
}

function getGalleryThumbRect(G, index) {
  const col = index % G.cols;
  const row = floor(index / G.cols);
  const viewportTop = G.modalY + G.headerH;
  const thumbX = G.modalX + G.gridPad + col * (G.thumbW + G.gridPad);
  const thumbY = viewportTop + G.gridPad + row * (G.thumbH + G.gridPad) - galleryScrollY;
  return { x: thumbX, y: thumbY, w: G.thumbW, h: G.thumbH };
}

function isInGalleryViewport(G, y, h) {
  const viewportTop = G.modalY + G.headerH;
  const viewportBottom = viewportTop + G.scrollAreaH;
  return y + h > viewportTop && y < viewportBottom;
}

function drawGalleryScrollbar(G) {
  if (!G.scrollable) return;

  const { barW, pad } = GALLERY_SCROLLBAR;
  const viewportTop = G.modalY + G.headerH;
  const trackX = G.modalX + G.modalW - barW - pad;
  const trackY = viewportTop + pad;
  const trackH = G.scrollAreaH - pad * 2;
  const thumbH = max(28, trackH * (G.scrollAreaH / G.contentH));
  const thumbTravel = trackH - thumbH;
  const thumbY = G.maxScroll > 0
    ? trackY + (galleryScrollY / G.maxScroll) * thumbTravel
    : trackY;

  noStroke();
  fill("#E8DDF0");
  rect(trackX, trackY, barW, trackH, barW / 2);

  fill("#9B7FB8");
  rect(trackX, thumbY, barW, thumbH, barW / 2);
}

const GALLERY_TOOLS = ["hammer", "calipers", "vr", "mouse", "mat", "glue", "sewing", "tape", "notepad", "coffee", "ruler", "thumb"];

function drawGalleryModal() {
  // Semi-transparent backdrop (lighter, matches design)
  fill(0, 0, 0, 100);
  noStroke();
  rect(0, 0, width, height);
  
  // If viewing a specific character
  if (galleryViewChar) {
    const modalW = min(width - 40, 600);
    const modalH = height - 80;
    const modalX = (width - modalW) / 2;
    const modalY = 40;
    drawGalleryCharacterView(modalX, modalY, modalW, modalH);
  } else {
    drawGalleryGrid(getGalleryGridLayout());
  }
}

function drawGalleryGrid(G) {
  clampGalleryScroll(G);

  const { modalX: x, modalY: y, modalW: w, modalH: h, headerH, scrollAreaH } = G;
  const viewportTop = y + headerH;

  // Purple-2 modal background with dark border
  fill("#FDF7FF"); // Purple-1
  stroke("#1A0F22"); // Ink-900 border
  strokeWeight(2);
  rect(x, y, w, h, 24);

  // Close button (X) — fixed in header
  noStroke();
  const closeX = x + w - G.closeSize - 10;
  const closeY = y + 10;

  if (isTouching(closeX, closeY, G.closeSize, G.closeSize)) {
    fill("#F4ECFB"); // Purple-100
    circle(closeX + G.closeSize / 2, closeY + G.closeSize / 2, G.closeSize);
  }

  fill("#1A0F22"); // Ink-900
  textSize(28);
  textStyle(NORMAL);
  textAlign(CENTER, CENTER);
  text("×", closeX + G.closeSize / 2, closeY + G.closeSize / 2);

  // Scrollable grid area
  push();
  drawingContext.save();
  drawingContext.beginPath();
  const clipW = w - 2 - G.scrollBarExtraW;
  drawingContext.rect(x + 1, viewportTop, clipW, scrollAreaH);
  drawingContext.clip();

  for (let i = 0; i < GALLERY_TOOLS.length; i++) {
    const tool = GALLERY_TOOLS[i];
    const thumb = getGalleryThumbRect(G, i);
    const { x: thumbX, y: thumbY, w: thumbW, h: thumbH } = thumb;

    const img = RESULT_IMAGES[tool + "_thumb"];
    if (img) {
      imageMode(CORNER);
      image(img, thumbX, thumbY, thumbW, thumbH);
    } else {
      fill(240);
      noStroke();
      rect(thumbX, thumbY, thumbW, thumbH, 12);
      fill(150);
      textSize(12);
      textAlign(CENTER, CENTER);
      text(tool, thumbX + thumbW / 2, thumbY + thumbH / 2);
    }

    if (isInGalleryViewport(G, thumbY, thumbH) &&
        isTouching(thumbX, thumbY, thumbW, thumbH)) {
      noFill();
      stroke("#1A0F22"); // Ink-900
      strokeWeight(3);
      rect(thumbX, thumbY, thumbW, thumbH, 12);
    }
  }

  drawingContext.restore();
  pop();

  drawGalleryScrollbar(G);
}

function drawGalleryCharacterView(x, y, w, h) {
  // Purple-2 modal background with dark border
  fill("#FDF7FF"); // Purple-1
  stroke("#1A0F22"); // Ink-900
  strokeWeight(2);
  rect(x, y, w, h, 24);
  
  // Back button
  noStroke();
  const backSize = 40;
  const backX = x + 10;
  const backY = y + 10;
  
  if (isTouching(backX, backY, backSize + 60, backSize)) {
    fill("#F4ECFB"); // Purple-100
    rect(backX, backY, backSize + 60, backSize, 20);
  }
  
  fill("#1A0F22"); // Ink-900
  textSize(16);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text("← Back", backX + 12, backY + backSize/2);
  textStyle(NORMAL);
  
  // Character image (name removed, starts higher)
  const imgTop = y + 70;
  const imgH = h - 90;
  const res = RESULT_IMAGES[galleryViewChar];
  
  if (res) {
    const fitted = fitRect(res.width, res.height, w - 40, imgH);
    imageMode(CORNER);
    image(res, x + 20 + fitted.x, imgTop + fitted.y, fitted.w, fitted.h);
  }
}

/* ---------------- INTERACTION ---------------- */

function handleGalleryTap(px, py) {
  // Viewing specific character
  if (galleryViewChar) {
    const modalW = min(width - 40, 600);
    const modalH = height - 80;
    const modalX = (width - modalW) / 2;
    const modalY = 40;
    const backSize = 40;
    const backX = modalX + 10;
    const backY = modalY + 10;
    
    if (hit(px, py, backX, backY, backSize + 40, backSize)) {
      galleryViewChar = null;
      return;
    }
    return;
  }
  
  const G = getGalleryGridLayout();
  const { modalX, modalY, modalW } = G;

  // Close button (X)
  const closeX = modalX + modalW - G.closeSize - 10;
  const closeY = modalY + 10;

  if (hit(px, py, closeX, closeY, G.closeSize, G.closeSize)) {
    showGallery = false;
    galleryScrollY = 0;
    return;
  }

  for (let i = 0; i < GALLERY_TOOLS.length; i++) {
    const thumb = getGalleryThumbRect(G, i);
    if (!isInGalleryViewport(G, thumb.y, thumb.h)) continue;

    if (hit(px, py, thumb.x, thumb.y, thumb.w, thumb.h)) {
      galleryViewChar = GALLERY_TOOLS[i];
      return;
    }
  }
}

function mousePressed() {
  handleTap(mouseX, mouseY);
  return false;
}

function mouseWheel(event) {
  if (!showGallery || galleryViewChar) return true;

  const G = getGalleryGridLayout();
  if (!G.scrollable) return true;

  galleryScrollY = constrain(galleryScrollY + event.deltaY * 0.5, 0, G.maxScroll);
  return false;
}

function touchStarted() {
  const t = (touches && touches.length) ? touches[0] : null;
  if (!t) return false;

  if (showGallery && !galleryViewChar) {
    const G = getGalleryGridLayout();
    if (G.scrollable) {
      galleryTouchStart = { x: t.x, y: t.y, scrollY: galleryScrollY };
      galleryDidScroll = false;
      return false;
    }
  }

  handleTap(t.x, t.y);
  return false;
}

function touchMoved() {
  if (!showGallery || galleryViewChar || !galleryTouchStart) return false;

  const t = (touches && touches.length) ? touches[0] : null;
  if (!t) return false;

  const dy = t.y - galleryTouchStart.y;
  if (abs(dy) > 8 || galleryDidScroll) {
    galleryDidScroll = true;
    const G = getGalleryGridLayout();
    galleryScrollY = constrain(galleryTouchStart.scrollY - dy, 0, G.maxScroll);
  }
  return false;
}

function touchEnded() {
  if (showGallery && galleryTouchStart && !galleryDidScroll) {
    handleGalleryTap(galleryTouchStart.x, galleryTouchStart.y);
  }

  galleryTouchStart = null;
  galleryDidScroll = false;
  return false;
}

function handleTap(px, py) {
  if (locked) return;

  const cw = contentWidth();
  const cx = contentX();

  if (appState === "start") {
    const btnY = height - pad - btnH;
    if (hit(px, py, cx, btnY, cw, btnH)) {
      appState = "preparing";
      time = millis();
      idx = 0;
    }
    return;
  }

  if (appState === "result") {
    // If gallery is open, handle gallery interactions
    if (showGallery) {
      handleGalleryTap(px, py);
      return;
    }
    
    if (handleResultActionTap(px, py)) return;
    return;
  }

  if (appState === "quiz") {
    const q = QUESTIONS[currentIdx];
    if (!q) return;
    
    const L = getQuizLayout(q);
    const choice0X = L.isLandscape ? L.rightX : L.cx;
    const choice0W = L.isLandscape ? L.rightW : L.cw;
    
    if (hit(px, py, choice0X, L.choice0Y, choice0W, L.choice0H)) {
      selectedChoice = 0;
      return;
    }
    
    if (hit(px, py, choice0X, L.choice1Y, choice0W, L.choice1H)) {
      selectedChoice = 1;
      return;
    }
    
    if (hit(px, py, L.confirmX, L.confirmY, L.confirmW, btnH)) {
      if (selectedChoice !== null) {
        answerQuestion(selectedChoice);
      }
      return;
    }
  }
}

function answerQuestion(choice) {
  locked = true;
  answers.push(choice);
  
  isTransitioning = true;
  
  setTimeout(() => {
    currentIdx++;
    selectedChoice = null;
    isTransitioning = false;
    locked = false;
  }, 400);
}

function restartQuiz() {
  clearQuizToolFromSession();
  cachedResultShareBlob = null;
  cachedResultShareBlobChar = null;
  hideShareFallback();
  currentIdx = 0;
  answers = [];
  selectedChoice = null;
  showGallery = false;
  galleryViewChar = null;
  galleryScrollY = 0;
  locked = false;
  appState = "start";
  questionAlpha = 255;
  questionScale = 1.0;
  isTransitioning = false;
}

/* ---------------- SHARE ---------------- */

const GRADQUIZ_CANONICAL_URL = "https://cde.nus.edu.sg/did/gradshows/2026/gradquiz.html";
let quizShareUiReady = false;
let cachedResultShareBlob = null;
let cachedResultShareBlobChar = null;

function getShareText(character) {
  const name = CHARACTERS[character] || "a design tool";
  return `I am ${name} on the DID Grad Show 2026 Quiz!`;
}

function getShareUrl() {
  try {
    const u = new URL(window.location.href);
    u.hash = "";
    return u.href;
  } catch (err) {
    return GRADQUIZ_CANONICAL_URL;
  }
}

function buildShareLine(character) {
  const shareUrl = getShareUrl();
  const shareText = getShareText(character);
  return shareText + (shareUrl ? "\n\n" + shareUrl : "");
}

/** Build a PNG blob from the loaded p5 result image, or fetch the asset. */
function getResultImageBlob(character) {
  if (cachedResultShareBlob && cachedResultShareBlobChar === character) {
    return Promise.resolve(cachedResultShareBlob);
  }

  const p5Img = RESULT_IMAGES[character];
  if (p5Img && p5Img.width > 0) {
    return new Promise(function (resolve, reject) {
      const canvas = document.createElement("canvas");
      canvas.width = p5Img.width;
      canvas.height = p5Img.height;
      const ctx = canvas.getContext("2d");
      const source = p5Img.canvas || p5Img.elt;
      if (!source) {
        reject(new Error("Result image not ready"));
        return;
      }
      ctx.drawImage(source, 0, 0);
      canvas.toBlob(function (blob) {
        if (!blob) {
          reject(new Error("Failed to export result PNG"));
          return;
        }
        cachedResultShareBlob = blob;
        cachedResultShareBlobChar = character;
        resolve(blob);
      }, "image/png");
    });
  }

  const path = RESULT_PNG_PATHS[character];
  if (!path) {
    return Promise.reject(new Error("Unknown quiz result"));
  }
  return fetch(path)
    .then(function (res) {
      if (!res.ok) throw new Error("Failed to load result image");
      return res.blob();
    })
    .then(function (blob) {
      cachedResultShareBlob = blob;
      cachedResultShareBlobChar = character;
      return blob;
    });
}

function buildShareFile(imageBlob, character) {
  return new File([imageBlob], "did-gradquiz-" + character + ".png", { type: "image/png" });
}

function pickSharePayload(file, character) {
  const title = "What Tool Are You?";
  const text = getShareText(character);
  const url = getShareUrl();
  const candidates = [
    { files: [file], title: title, text: text, url: url },
    { files: [file], title: title, text: text },
    { files: [file], text: text },
    { files: [file] },
  ];
  for (let i = 0; i < candidates.length; i++) {
    const payload = candidates[i];
    if (!navigator.canShare || navigator.canShare(payload)) {
      return payload;
    }
  }
  return null;
}

function canShareResultImage(imageBlob, character) {
  if (!navigator.share) return false;
  const file = buildShareFile(imageBlob, character);
  return pickSharePayload(file, character) !== null;
}

async function shareToInstagramStory(imageBlob) {
  const character = getCharacter();
  const file = buildShareFile(imageBlob, character);
  const shareData = pickSharePayload(file, character);

  if (!shareData) {
    showFallback(character, imageBlob);
    return;
  }

  try {
    await navigator.share(shareData);
  } catch (error) {
    if (error && error.name === "AbortError") return;
    console.error("Share failed:", error);
    showFallback(character, imageBlob);
  }
}

function initQuizShareUI() {
  if (quizShareUiReady || document.getElementById("quizShareFallback")) {
    quizShareUiReady = true;
    return;
  }

  const wrap = document.createElement("div");
  wrap.id = "quizShareFallback";
  wrap.className = "quiz-share-fallback";
  wrap.hidden = true;
  wrap.setAttribute("role", "dialog");
  wrap.setAttribute("aria-modal", "true");
  wrap.setAttribute("aria-labelledby", "quizShareFallbackTitle");
  wrap.innerHTML =
    '<div class="quiz-share-fallback__backdrop" data-quiz-share-close></div>' +
    '<div class="quiz-share-fallback__panel">' +
    '  <button type="button" class="quiz-share-fallback__close" data-quiz-share-close aria-label="Close">×</button>' +
    '  <p id="quizShareFallbackTitle" class="quiz-share-fallback__title">Share your result</p>' +
    '  <p class="quiz-share-fallback__hint">Pick a platform below. Download the image to attach it in Telegram, WhatsApp, or Instagram.</p>' +
    '  <div class="quiz-share-menu" role="group" aria-label="Share on social media">' +
    '    <a class="quiz-share-item" data-share="telegram" href="#" target="_blank" rel="noopener noreferrer">' +
    '      <span class="quiz-share-icon-wrap" aria-hidden="true">' +
    '        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M15 15 5.5 9.5"></path></svg>' +
    "      </span>" +
    '      <span class="quiz-share-label">Telegram</span>' +
    "    </a>" +
    '    <a class="quiz-share-item" data-share="whatsapp" href="#" target="_blank" rel="noopener noreferrer">' +
    '      <span class="quiz-share-icon-wrap" aria-hidden="true">' +
    '        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.883 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"></path></svg>' +
    "      </span>" +
    '      <span class="quiz-share-label">WhatsApp</span>' +
    "    </a>" +
    '    <button type="button" class="quiz-share-item" data-share="download">' +
    '      <span class="quiz-share-icon-wrap" aria-hidden="true">' +
    '        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>' +
    "      </span>" +
    '      <span class="quiz-share-label">Download result image</span>' +
    "    </button>" +
    '    <button type="button" class="quiz-share-item quiz-share-item--more" data-share="copy">' +
    '      <span class="quiz-share-icon-wrap" aria-hidden="true">' +
    '        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>' +
    "      </span>" +
    '      <span class="quiz-share-label">Copy link &amp; message</span>' +
    "    </button>" +
    "  </div>" +
    "</div>";

  document.body.appendChild(wrap);

  wrap.querySelectorAll("[data-quiz-share-close]").forEach(function (el) {
    el.addEventListener("click", hideShareFallback);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !wrap.hidden) hideShareFallback();
  });

  const copyBtn = wrap.querySelector('[data-share="copy"]');
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      const character = getCharacter();
      copyShareLine(buildShareLine(character), copyBtn);
    });
  }

  const downloadBtn = wrap.querySelector('[data-share="download"]');
  if (downloadBtn) {
    downloadBtn.addEventListener("click", function () {
      downloadResultImage(getCharacter());
    });
  }

  wrap.querySelectorAll("a.quiz-share-item").forEach(function (a) {
    a.addEventListener("click", function () {
      window.setTimeout(hideShareFallback, 0);
    });
  });

  quizShareUiReady = true;
}

function applyQuizShareLinks(character) {
  const wrap = document.getElementById("quizShareFallback");
  if (!wrap) return;
  const shareUrl = getShareUrl();
  const shareText = getShareText(character);
  const line = buildShareLine(character);

  const tg = wrap.querySelector('[data-share="telegram"]');
  if (tg) {
    tg.href =
      "https://t.me/share/url?url=" +
      encodeURIComponent(shareUrl) +
      "&text=" +
      encodeURIComponent(shareText);
  }
  const wa = wrap.querySelector('[data-share="whatsapp"]');
  if (wa) {
    wa.href = "https://api.whatsapp.com/send?text=" + encodeURIComponent(line);
  }
}

function hideShareFallback() {
  const wrap = document.getElementById("quizShareFallback");
  if (!wrap) return;
  wrap.hidden = true;
  document.body.style.overflow = "";
}

function showFallback(character, imageBlob) {
  initQuizShareUI();
  const wrap = document.getElementById("quizShareFallback");
  if (!wrap) return;

  applyQuizShareLinks(character);

  const hint = wrap.querySelector(".quiz-share-fallback__hint");
  if (hint) {
    if (imageBlob) {
      hint.textContent =
        "On desktop, open a platform below and attach your result image (download it first). Your message and quiz link are included automatically.";
    } else {
      hint.textContent =
        "Sharing with the image is not supported here. Copy the message and link, or try again on your phone.";
    }
  }

  const downloadBtn = wrap.querySelector('[data-share="download"]');
  if (downloadBtn) {
    downloadBtn.hidden = !imageBlob;
  }

  wrap.hidden = false;
  document.body.style.overflow = "hidden";
}

function copyShareLine(textToCopy, feedbackBtn) {
  const label = feedbackBtn && feedbackBtn.querySelector(".quiz-share-label");
  const orig = label ? label.textContent : "";

  function done() {
    if (label) {
      label.textContent = "Copied!";
      window.setTimeout(function () {
        label.textContent = orig;
      }, 2400);
    }
    hideShareFallback();
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy).then(done).catch(function () {
      window.prompt("Copy this text:", textToCopy);
      done();
    });
    return;
  }
  window.prompt("Copy this text:", textToCopy);
  done();
}

function downloadResultImage(character) {
  getResultImageBlob(character)
    .then(function (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "did-gradquiz-" + character + ".png";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    })
    .catch(function (err) {
      console.error("Download failed:", err);
      alert("Could not download your result image. Please try again.");
    });
}

function shareResult() {
  const character = getCharacter();

  getResultImageBlob(character)
    .then(function (blob) {
      if (canShareResultImage(blob, character)) {
        return shareToInstagramStory(blob);
      }
      showFallback(character, blob);
    })
    .catch(function (err) {
      console.error("Could not prepare result image:", err);
      showFallback(character, null);
    });
}

/* ---------------- CHARACTER SCORING SYSTEM ---------------- */

function getCharacter() {
  if (storedQuizTool) return storedQuizTool;
  return getCharacterFromAnswers();
}

function getCharacterFromAnswers() {
  let scores = {
    hammer: 0,
    calipers: 0,
    vr: 0,
    mouse: 0,
    mat: 0,
    glue: 0,
    sewing: 0,
    tape: 0,
    notepad: 0,
    coffee: 0,
    ruler: 0,
    thumb: 0
  };
  
  // Q1: Wake up (padding)
  if (answers[0] === 0) {
    scores.coffee += 1;
    scores.notepad += 1;
    scores.tape += 1;
  } else {
    scores.ruler += 1;
    scores.calipers += 1;
    scores.mouse += 1;
    scores.vr += 2;
  }
  
  // Q2: Dressed (padding)
  if (answers[1] === 0) {
    scores.tape += 1;
    scores.hammer += 1;
    scores.coffee += 1;
  } else {
    scores.ruler += 1;
    scores.sewing += 1;
    scores.calipers += 1;
  }
  
  // Q3: Bus delayed (SCORING)
  if (answers[2] === 0) {
    scores.ruler += 3;
    scores.thumb += 3;
    scores.mouse += 2;
    scores.calipers += 2;
    scores.vr += 1;
  } else {
    scores.coffee += 3;
    scores.mat += 2;
    scores.glue += 2;
    scores.tape += 1;
  }
  
  // Q4: Desk mess (SCORING)
  if (answers[3] === 0) {
    scores.tape += 3;
    scores.hammer += 2;
    scores.glue += 2;
    scores.mouse += 1;
  } else {
    scores.ruler += 3;
    scores.mat += 2;
    scores.sewing += 2;
    scores.calipers += 1;
    scores.thumb += 1;
  }
  
  // Q5: Deskmate stuck (SCORING)
  if (answers[4] === 0) {
    scores.notepad += 3;
    scores.mouse += 2;
    scores.calipers += 2;
    scores.thumb += 1;
    scores.sewing += 1;
  } else {
    scores.coffee += 3;
    scores.vr += 2;
    scores.glue += 2;
    scores.hammer += 1;
  }
  
  // Q6: Deadline (SCORING)
  if (answers[5] === 0) {
    scores.hammer += 3;
    scores.tape += 2;
    scores.mouse += 2;
    scores.glue += 1;
  } else {
    scores.sewing += 3;
    scores.calipers += 2;
    scores.ruler += 2;
  }
  
  // Q7: Break time (padding)
  if (answers[6] === 0) {
    scores.coffee += 1;
    scores.glue += 1;
    scores.mat += 1;
  } else {
    scores.notepad += 1;
    scores.vr += 2;
    scores.calipers += 1;
  }
  
  // Q8: Beauty moment (SCORING)
  if (answers[7] === 0) {
    scores.notepad += 3;
    scores.thumb += 2;
    scores.mouse += 2;
    scores.calipers += 1;
    scores.mat += 1;
  } else {
    scores.coffee += 3;
    scores.vr += 2;
    scores.mat += 1;
    scores.sewing += 1;
    scores.hammer += 1;
  }
  
  // Q9: Something not working (SCORING)
  if (answers[8] === 0) {
    scores.mouse += 3;
    scores.vr += 2;
    scores.hammer += 2;
    scores.tape += 1;
  } else {
    scores.notepad += 3;
    scores.calipers += 2;
    scores.thumb += 1;
    scores.ruler += 1;
    scores.sewing += 1;
  }
  
  // Q10: New project brief (SCORING)
  if (answers[9] === 0) {
    scores.hammer += 3;
    scores.tape += 2;
    scores.vr += 2;
    scores.glue += 1;
  } else {
    scores.ruler += 3;
    scores.mat += 2;
    scores.thumb += 2;
    scores.calipers += 2;
  }
  
  // Find winner
  let maxScore = 0;
  let winner = 'hammer';
  
  for (let char in scores) {
    if (scores[char] > maxScore) {
      maxScore = scores[char];
      winner = char;
    }
  }
  
  return winner;
}

/* ---------------- DRAWING HELPERS ---------------- */

// Calculate quiz layout positions (used by both draw and hit detection so they stay in sync)
function getQuizLayout(q) {
  const cw = contentWidth();
  const cx = contentX();
  const SPACE_SM = 12;
  const SPACE_LG = 24;
  const isLandscape = width > height;
  
  if (isLandscape) {
    // ===== DESKTOP LANDSCAPE: 60/40 split =====
    const colGap = 24;
    const stageW = min(width - pad * 2, 1100); // cap total width
    const stageX = (width - stageW) / 2;
    
    const leftW = (stageW - colGap) * 0.60;
    const rightW = (stageW - colGap) * 0.40;
    const leftX = stageX;
    const rightX = stageX + leftW + colGap;
    
    // Left column: prompt at top, image fills remainder
    const promptY = pad + 32;
    const promptSize = constrain(floor(leftW / 22), 14, 19);
    textSize(promptSize);
    const promptLines = wrapText(q.prompt, leftW);
    const promptLineHeight = promptSize * 1.3;
    const promptHeight = promptLines.length * promptLineHeight;
    
    const imgTop = promptY + promptHeight + SPACE_SM;
    const imgBottom = height - pad;
    const imgAvailableH = imgBottom - imgTop;
    
    // Right column: choices + confirm stacked; confirm directly below options
    const choice0H = getChoiceButtonHeight(q.choices[0], rightW + 40);
    const choice1H = getChoiceButtonHeight(q.choices[1], rightW + 40);

    const choicesAvailableTop = pad + 32;
    const choicesAvailableH = height - pad - choicesAvailableTop;
    const blockH = choice0H + SPACE_SM + choice1H + SPACE_LG + btnH;
    const blockTop = choicesAvailableTop + (choicesAvailableH - blockH) / 2;
    const choice0Y = blockTop;
    const choice1Y = choice0Y + choice0H + SPACE_SM;
    const confirmY = choice1Y + choice1H + SPACE_LG;
    
    return {
      isLandscape: true,
      cw, cx, leftX, leftW, rightX, rightW,
      promptY, promptSize, promptHeight,
      imgTop, imgX: leftX, imgW: leftW, imgH: imgAvailableH,
      choice0Y, choice0H, choice1Y, choice1H,
      confirmY, confirmX: rightX, confirmW: rightW
    };
  } else {
    // ===== MOBILE PORTRAIT: vertical stack =====
    const promptY = pad + 32;
    const promptSize = constrain(floor(cw / 19), 14, 18);
    textSize(promptSize);
    const promptLines = wrapText(q.prompt, cw);
    const promptLineHeight = promptSize * 1.3;
    const promptHeight = promptLines.length * promptLineHeight;
    
    // Square image, capped at 40% screen height
    const imgTop = promptY + promptHeight + SPACE_SM;
    const imgSize = min(cw, height * 0.40);
    const imgX = cx + (cw - imgSize) / 2;
    const imgBottom = imgTop + imgSize;
    
    const choice0H = getChoiceButtonHeight(q.choices[0], cw);
    const choice1H = getChoiceButtonHeight(q.choices[1], cw);
    const choice0Y = imgBottom + SPACE_SM;
    const choice1Y = choice0Y + choice0H + SPACE_SM;
    
    const confirmY = height - pad - btnH;
    
    return {
      isLandscape: false,
      cw, cx,
      promptY, promptSize, promptHeight,
      imgTop, imgX, imgW: imgSize, imgH: imgSize,
      choice0Y, choice0H, choice1Y, choice1H,
      confirmY, confirmX: cx, confirmW: cw
    };
  }
}

function drawQuestionScreen(q) {
  push();
  translate(width / 2, height / 2);
  scale(questionScale);
  translate(-width / 2, -height / 2);

  const L = getQuizLayout(q);
  
  // ---------- DRAW COUNTER ----------
  const qNum = String(currentIdx + 1).padStart(2, '0');
  const qTotal = String(QUESTIONS.length).padStart(2, '0');
  textSize(13);
  fill(107, 90, 115, questionAlpha);
  textStyle(NORMAL);
  textAlign(L.isLandscape ? LEFT : CENTER, CENTER);
  
  if (L.isLandscape) {
    text(`Question ${qNum} of ${qTotal}`, L.leftX, pad + 12);
  } else {
    text(`Question ${qNum} of ${qTotal}`, width / 2, pad + 12);
  }
  
  // ---------- DRAW PROMPT ----------
  fill(26, 15, 34, questionAlpha);
  textStyle(BOLD);
  textSize(L.promptSize);
  textWrap(WORD);
  
  if (L.isLandscape) {
    textAlign(LEFT, TOP);
    text(q.prompt, L.leftX, L.promptY, L.leftW);
  } else {
    textAlign(CENTER, TOP);
    text(q.prompt, L.cx, L.promptY, L.cw);
  }
  textStyle(NORMAL);
  
  // ---------- DRAW IMAGE ----------
  push();
  tint(255, questionAlpha);
  drawMediaFrame(q.imgId, L.imgX, L.imgTop, L.imgW, L.imgH);
  pop();
  
  // ---------- DRAW CHOICES ----------
  const isSelected0 = selectedChoice === 0;
  const isSelected1 = selectedChoice === 1;
  
  // For landscape, choice buttons live in right column → use rightX/rightW
  // For portrait, choice buttons span content width → use cx/cw
  // drawChoiceButton expects (x, y, w, h) where x is content frame; the button itself draws inside with 20px inset
  // So in landscape we pass (rightX - 20, y, rightW + 40, h) to effectively give the right column as the inset target
  const choiceFrameX = L.isLandscape ? (L.rightX - 20) : L.cx;
  const choiceFrameW = L.isLandscape ? (L.rightW + 40) : L.cw;
  
  drawChoiceButton(choiceFrameX, L.choice0Y, choiceFrameW, L.choice0H, q.choices[0],
    isTouching(L.rightX || L.cx, L.choice0Y, L.rightW || L.cw, L.choice0H),
    isSelected0, questionAlpha);
  drawChoiceButton(choiceFrameX, L.choice1Y, choiceFrameW, L.choice1H, q.choices[1],
    isTouching(L.rightX || L.cx, L.choice1Y, L.rightW || L.cw, L.choice1H),
    isSelected1, questionAlpha);

  // ---------- DRAW CONFIRM ----------
  const canConfirm = selectedChoice !== null;
  const confirmLabel = currentIdx === QUESTIONS.length - 1 ? "Submit" : "Next";
  const confirmFrameX = L.isLandscape ? (L.confirmX - 20) : L.confirmX;
  const confirmFrameW = L.isLandscape ? (L.confirmW + 40) : L.confirmW;
  drawConfirmButton(confirmFrameX, L.confirmY, confirmFrameW, btnH, confirmLabel,
    isTouching(L.confirmX, L.confirmY, L.confirmW, btnH), canConfirm, questionAlpha);

  pop();
}

function drawMediaFrame(imgId, x, y, w, h) {
  noFill();
  noStroke();

  const media = QIMG[imgId];
  if (!media) {
    noStroke();
    fill(245, questionAlpha);
    rect(x, y, w, h, 8);
    fill(140, questionAlpha);
    textSize(14);
    text("Image placeholder", x + w / 2, y + h / 2);
    return;
  }

  const f = fitRect(media.width, media.height, w, h);
  image(media, x + f.x, y + f.y, f.w, f.h);
}

function drawButton(x, y, w, h, label, hot) {
  // PRIMARY BUTTON - Solid purple with sticker shadow
  fill("#1A0F22"); // Ink-900 (dark shadow)
  noStroke();
  rect(x + 4, y + 4, w, h, 999); // Sticker shadow
  
  // Main button on top of shadow
  fill(hot ? "#5A00A8" : "#7A00DB"); // Purple-700 when hot, Purple-600 default
  rect(x, y, w, h, 999);
  
  // White text
  fill(255);
  textSize(hot ? 17 : 16);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
  textStyle(NORMAL);
}

function drawSecondaryButton(x, y, w, h, label, hot) {
  // SECONDARY BUTTON - White/cream with DARK ink border + sticker shadow
  fill("#1A0F22"); // Ink-900 shadow
  noStroke();
  rect(x + 4, y + 4, w, h, 999);
  
  // Main button: white with dark ink border
  fill(hot ? "#F4ECFB" : "#FFFFFF"); // Purple-100 when hot, white default
  stroke("#1A0F22"); // Ink-900 border (dark, not purple)
  strokeWeight(2);
  rect(x, y, w, h, 999);
  
  // Dark text
  noStroke();
  fill("#1A0F22"); // Ink-900 (dark text on white)
  textSize(hot ? 17 : 16);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
  textStyle(NORMAL);
}

function drawChoiceButton(x, y, w, h, label, hot, isSelected, alpha) {
  const bx = x + 20;
  const bw = w - 40;
  const radius = 24; // Fixed radius (not pill)
  
  // Sticker shadow - 3px offset
  if (!isSelected) {
    fill(26, 15, 34, alpha * 0.9); // Ink-900 shadow
    noStroke();
    rect(bx + 3, y + 3, bw, h, radius);
  }
  
  // Button background
  if (isSelected) {
    // Selected: light purple bg with dark ink border, no shadow (pressed in)
    fill(244, 236, 251, alpha); // Purple-100 (#F4ECFB)
    stroke(26, 15, 34, alpha);
    strokeWeight(1.5);
    rect(bx + 3, y + 3, bw, h, radius); // shifted to where shadow was
  } else {
    // Default/hover: white with dark ink border
    fill(255, alpha);
    stroke(26, 15, 34, alpha);
    strokeWeight(hot ? 2 : 1.5);
    rect(bx, y, bw, h, radius);
  }
  
  // Compute actual button x/y (accounting for "pressed in" offset when selected)
  const actualBX = isSelected ? bx + 3 : bx;
  const actualBY = isSelected ? y + 3 : y;
  
  // Checkmark circle on the left
  const circleD = 22;
  const circleX = actualBX + 14 + circleD / 2;
  const circleY = actualBY + h / 2;
  
  if (isSelected) {
    // Filled purple circle with white checkmark
    noStroke();
    fill(122, 0, 219, alpha); // Purple-600
    circle(circleX, circleY, circleD);
    
    // White checkmark
    stroke(255, alpha);
    strokeWeight(2.5);
    strokeCap(ROUND);
    noFill();
    const cs = circleD * 0.25;
    line(circleX - cs, circleY + 1, circleX - cs * 0.2, circleY + cs * 0.8);
    line(circleX - cs * 0.2, circleY + cs * 0.8, circleX + cs, circleY - cs * 0.6);
  } else {
    // Empty circle with dark border
    noFill();
    stroke(26, 15, 34, alpha);
    strokeWeight(1.5);
    circle(circleX, circleY, circleD);
  }
  
  // Text - wrapped to fit
  noStroke();
  fill(26, 15, 34, alpha); // Ink-900
  textStyle(isSelected ? BOLD : NORMAL);
  textSize(15);
  
  const textStartX = actualBX + 14 + circleD + 12;
  const textEndX = actualBX + bw - 16;
  const textAreaW = textEndX - textStartX;

  const lines = wrapText(label, textAreaW);
  const lineHeight = 20;
  const totalTextH = lines.length * lineHeight;
  const startY = actualBY + h / 2 - totalTextH / 2 + lineHeight / 2;

  textAlign(LEFT, CENTER);
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], textStartX, startY + i * lineHeight);
  }
  textStyle(NORMAL);
}

function drawConfirmButton(x, y, w, h, label, hot, enabled, alpha) {
  // Match choice button width (with 20px padding on each side)
  const bx = x + 20;
  const bw = w - 40;
  
  // Sticker shadow (only when enabled)
  if (enabled) {
    fill(26, 15, 34, alpha); // Ink-900 dark shadow
    noStroke();
    rect(bx + 4, y + 4, bw, h, h / 2);
  }
  
  // Main button
  noStroke();
  if (enabled) {
    fill(hot ? color(90, 0, 168, alpha) : color(122, 0, 219, alpha));
  } else {
    fill(236, 229, 238, alpha); // Ink-100 disabled
  }
  rect(bx, y, bw, h, h / 2); // pill shape
  
  // Text
  fill(enabled ? color(255, alpha) : color(181, 170, 184, alpha));
  textSize(17);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(label, bx + bw / 2, y + h / 2);
  textStyle(NORMAL);
}

function contentWidth() {
  return min(width - pad * 2, MAX_CONTENT_W);
}

function contentX() {
  return (width - contentWidth()) / 2;
}

function hit(px, py, x, y, w, h) {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

function isTouching(x, y, w, h) {
  return hit(mouseX, mouseY, x, y, w, h);
}

function fitRect(sw, sh, dw, dh) {
  const s = min(dw / sw, dh / sh);
  return { 
    w: sw * s, 
    h: sh * s, 
    x: (dw - sw * s) / 2, 
    y: (dh - sh * s) / 2 
  };
}

// Wrap text into lines that fit within maxWidth
// Returns array of line strings
function wrapText(str, maxWidth) {
  const words = str.split(' ');
  const lines = [];
  let line = '';
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line ? line + ' ' + words[i] : words[i];
    if (textWidth(testLine) > maxWidth && line) {
      lines.push(line);
      line = words[i];
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Calculate the height a choice button needs to fit its text
function getChoiceButtonHeight(label, w) {
  const bx_pad = 20;
  const bw = w - 40;
  const circleD = 22;
  const textStartX = bx_pad + circleD + 12;
  const textEndX = bw - 16;
  const textAreaW = textEndX - textStartX;
  
  textSize(15);
  const lines = wrapText(label, textAreaW);
  const lineHeight = 20;
  const verticalPadding = 14 * 2; // top + bottom padding
  
  return max(52, lines.length * lineHeight + verticalPadding);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  dotGridMouseX = constrain(dotGridMouseX, 0, width);
  dotGridMouseY = constrain(dotGridMouseY, 0, height);
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 100);
}
