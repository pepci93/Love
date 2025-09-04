// const urlParams = new URLSearchParams(window.location.search);
// const name = urlParams.get("k"); // Get the value of "name"
const introText = document.querySelector(".text-intro");
introText.innerHTML = `Hi You! Pull the cord.`;
const engine = Matter.Engine.create();
const world = engine.world;

const render = Matter.Render.create({
  element: document.getElementById("canvas-container"),
  engine: engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    wireframes: false,
    background: "transparent",
  },
});

// Create a chain of points for the ribbon
const segments = 10;
const segmentHeight = 150 / segments;
const points = [];
const constraints = [];

// Get card position
const card = document.querySelector(".card");
const cardRect = card.getBoundingClientRect();
const startX = window.innerWidth / 2;
const startY = cardRect.top;

// Create points
for (let i = 0; i <= segments; i++) {
  const point = Matter.Bodies.circle(startX, startY + i * segmentHeight, 2, {
    friction: 0.5,
    restitution: 0.5,
    isStatic: i === 0,
    render: {
      visible: true,
      fillStyle: "#000000",
      strokeStyle: "#000000",
    },
  });
  points.push(point);
  Matter.World.add(world, point);
}

// Connect points with constraints
for (let i = 0; i < points.length - 1; i++) {
  const constraint = Matter.Constraint.create({
    bodyA: points[i],
    bodyB: points[i + 1],
    stiffness: 0.1,
    damping: 0.05,
    length: segmentHeight,
    render: {
      visible: true,
      strokeStyle: "#fe3a65",
      lineWidth: 1,
    },
  });
  constraints.push(constraint);
  Matter.World.add(world, constraint);
}

// Create and start the runner
const runner = Matter.Runner.create();
Matter.Runner.run(runner, engine);
Matter.Render.run(render);

// Drag functionality
let isDragging = false;
const cordWrapper = document.querySelector(".cord-wrapper");
const plug = document.querySelector(".plug");
const ribbon = document.querySelector(".ribbon");

plug.addEventListener("mousedown", startDrag);
plug.addEventListener("touchstart", startDrag);
document.addEventListener("mousemove", drag);
document.addEventListener("touchmove", drag);
document.addEventListener("mouseup", endDrag);
document.addEventListener("touchend", endDrag);

function startDrag(e) {
  e.preventDefault(); // Prevent default touch behavior
  isDragging = true;
  plug.style.cursor = "grabbing";
}

function drag(e) {
  if (!isDragging) return;

  const clientX = e.clientX || e.touches[0].clientX;
  const clientY = e.clientY || e.touches[0].clientY;

  const lastPoint = points[points.length - 1];
  Matter.Body.setPosition(lastPoint, {
    x: clientX,
    y: clientY,
  });

  updateRibbon();

  if (clientY > cardRect.top + 300 && !card.classList.contains("open")) {
    openCard();
  }
}

function updateRibbon() {
  const segments = points.length;

  for (let i = 0; i < segments - 1; i++) {
    const current = points[i];
    const next = points[i + 1];

    const dx = next.position.x - current.position.x;
    const dy = next.position.y - current.position.y;
    const angle = Math.atan2(dy, dx);

    const segmentLength = Math.sqrt(dx * dx + dy * dy);
    gsap.set(ribbon, {
      height: segmentLength,
      rotation: angle * (180 / Math.PI),
      x: current.position.x - startX,
      y: current.position.y - startY,
    });

    if (i === segments - 2) {
      gsap.set(plug, {
        x: next.position.x - startX,
        y: next.position.y - startY - 20,
        rotation: angle * (180 / Math.PI) - 90,
        transformOrigin: "50% 0%",
      });
    }
  }
}

function endDrag() {
  isDragging = false;
  plug.style.cursor = "grab";
}

function openCard() {
  card.classList.add("open");

  gsap.to(card, {
    y: "+=30",
    yoyo: true,
    repeat: 5,
    duration: 0.05,
    onComplete: () => {
      gsap.set(card, { x: 0 });
    },
  });

  confetti({
    particleCount: 300,
    spread: 100,
    origin: { y: 0.6 },
  });

  gsap.to(".plug path", {
    duration: 0.5,
    attr: { d: "M30,0 L70,0 L85,30 L85,120 L15,120 L15,30 Z" },
    ease: "power2.inOut",
  });

  gsap.to(".card-content", {
    opacity: 1,
    duration: 0.5,
    delay: 0.3,
  });

  gsap.to(".valentine-text, .buttons", {
    display: "block",
    opacity: 1,
    duration: 0.5,
    delay: 0.5,
  });

  gsap.to([cordWrapper, ribbon], {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      cordWrapper.style.display = "none";
      ribbon.style.display = "none";
    },
  });

  const tl = new gsap.timeline();
  tl.to(".card", { rotateX: -10, duration: 0.2 })
    .to(".card", { rotateX: 0, duration: 0.1 })
    .to(".card", { rotateX: 10, duration: 0.14 })
    .to(".card", { rotateX: 0, duration: 0.05 })
    .repeat(2);

  gsap.to(".text-intro", {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      introText.style.display = "none";
    },
  });

  points.forEach((point) => {
    point.render.visible = false;
  });
  constraints.forEach((constraint) => {
    constraint.render.visible = false;
  });
}

// Add event listeners for buttons
const yesButton = document.querySelector(".buttons .yes");
const noButton = document.querySelector(".buttons .no");

// باکس پیام هشدار
let noClickCount = 0;
const warningBox = document.querySelector(".valentine-warning");

yesButton.addEventListener("click", () => {
  const tl = new gsap.timeline();
  gsap.to(".valentine-text, .buttons", {
    display: "none",
    opacity: 0,
    duration: 0.5,
  });
  gsap.to(".valentine-congrats", {
    display: "block",
    opacity: 1,
    duration: 0.5,
    delay: 0.5,
  });
  tl.to(".card", {
    width: window.innerWidth < 420 ? window.innerWidth : 800,
    height: 540,
    duration: 1,
    ease: "power2.in",
  }).to(".congrats, .valentine-congrats", {
    width: "100%",
    height: "100%",
    duration: 1,
  });

  confetti({
    particleCount: 500,
    spread: 150,
    origin: { y: 0.6 },
  });
  setInterval(() => {
    confetti({
      particleCount: 500,
      spread: 150,
      origin: { y: 0.6 },
    });
  }, 5000);
});

noButton.addEventListener("click", () => {
  noClickCount++;

  if (noClickCount === 1) {
    showWarning("مطمئنی؟ 🥺");
    return;
  } else if (noClickCount === 2) {
    showWarning("میخوای دوباره یه فکری بکنی؟ 😢");
    return;
  }

  // بار سوم و بعدش
  hideWarning();
  const tl = new gsap.timeline();
  gsap.to(".valentine-text, .buttons", {
    display: "none",
    opacity: 0,
    duration: 0.5,
  });
  gsap.to(".valentine-sad", {
    display: "block",
    opacity: 1,
    duration: 0.5,
    delay: 0.5,
  });
  tl.to(".card", {
    width: window.innerWidth < 420 ? window.innerWidth : 800,
    height: 540,
    duration: 1,
    ease: "power2.in",
  });
  tl.to(".valentine-sad", {
    width: "100%",
    height: "100%",
    duration: 0.3,
  });
  tl.to(".sad", {
    width: "90%",
    height: "100%",
    duration: 0.7,
  });
});
// نمایش پیام هشدار
function showWarning(message) {
  warningBox.innerHTML = message;
  gsap.to(warningBox, {
    display: "block",
    opacity: 1,
    duration: 0.5,
  });

  gsap.to(warningBox, {
    opacity: 0,
    delay: 2.5,
    duration: 0.5,
    onComplete: () => {
      warningBox.style.display = "none";
    },
  });
}

// پنهان کردن پیام هشدار
function hideWarning() {
  gsap.to(warningBox, {
    opacity: 0,
    duration: 0.3,
    onComplete: () => {
      warningBox.style.display = "none";
    },
  });
}

function animate() {
  updateRibbon();
  requestAnimationFrame(animate);
}
animate();

gsap.set(".card", {
  rotateX: 0,
  transformPerspective: 1000,
});
