// Select slides and navigation buttons
const slides = document.querySelectorAll(".slide");
const prevButton = document.querySelector(".prev-btn");
const nextButton = document.querySelector(".next-btn");

let currentSlideIndex = 0;
let autoSlideInterval;

// Show the current slide by toggling the active class
const showSlide = (index) => {
  slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
};

// Move to the next slide
const nextSlide = () => {
  currentSlideIndex = (currentSlideIndex + 1) % slides.length;
  showSlide(currentSlideIndex);
};

// Move to the previous slide
const prevSlide = () => {
  currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
  showSlide(currentSlideIndex);
};

// Restart auto-slide
const restartAutoSlide = () => {
  clearInterval(autoSlideInterval);
  autoSlideInterval = setInterval(nextSlide, 5000);
};

// Add event listeners for navigation buttons
[prevButton, nextButton].forEach((btn, i) =>
  btn.addEventListener("click", () => {
    i === 0 ? prevSlide() : nextSlide();
    restartAutoSlide();
  })
);

// Initialize the slider
const initSlider = () => {
  showSlide(currentSlideIndex);
  autoSlideInterval = setInterval(nextSlide, 5000);
};
initSlider();

// Modal handling
const setupModal = (modalId, triggerSelector, closeSelectors) => {
  const modal = document.getElementById(modalId);
  const trigger = document.querySelector(triggerSelector);
  const closeButtons = modal.querySelectorAll(closeSelectors);

  // Open modal
  trigger?.addEventListener("click", (e) => {
    e.preventDefault();
    modal.style.display = "block";
  });

  // Close modal
  closeButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      modal.style.display = "none";
    })
  );

  // Close modal by clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
};

// Initialize modals
setupModal("login-modal", ".navbar li:nth-child(3) a", ".close-btn");
setupModal("signup-modal", ".navbar li:nth-child(4) a", ".close-btn");

// Forgot Password Modal
const forgotPasswordModal = document.getElementById("forgot-password-modal");
const forgotPasswordButton = document.querySelector(".forgot-password");
const backToLoginButton = document.getElementById("back-to-login");

// Open Forgot Password Modal
forgotPasswordButton?.addEventListener("click", () => {
  document.getElementById("login-modal").style.display = "none";
  forgotPasswordModal.style.display = "flex";
});

// Back to Login from Forgot Password Modal
backToLoginButton?.addEventListener("click", (e) => {
  e.preventDefault();
  forgotPasswordModal.style.display = "none";
  document.getElementById("login-modal").style.display = "flex";
});

// Close Forgot Password Modal by clicking outside
window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    forgotPasswordModal.style.display = "none";
  }
});

// Function to show a specific modal
function showModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
}

// Function to close a specific modal
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// Switch from Login Modal to Sign Up Modal
function switchToSignUp() {
  closeModal('loginModal');
  showModal('signUpModal');
}

// Switch from Sign Up Modal to Login Modal
function switchToLogin() {
  closeModal('signUpModal');
  showModal('loginModal');
}

