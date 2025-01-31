const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn.querySelector("i");

menuBtn.addEventListener("click", (e) => {
  navLinks.classList.toggle("open");

  const isOpen = navLinks.classList.contains("open");
  menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-line");
});

navLinks.addEventListener("click", (e) => {
  navLinks.classList.remove("open");
  menuBtnIcon.setAttribute("class", "ri-menu-line");
});

const scrollRevealOption = {
  distance: "50px",
  origin: "bottom",
  duration: 1000,
};

ScrollReveal().reveal(".header__image img", {
  ...scrollRevealOption,
  origin: "right",
});

ScrollReveal().reveal(".header__content h1", {
  ...scrollRevealOption,
  delay: 200,
});

ScrollReveal().reveal(".header__content p", {
  ...scrollRevealOption,
  delay: 300,
});

ScrollReveal().reveal(".header__content form", {
  ...scrollRevealOption,
  delay: 400,
});

ScrollReveal().reveal(".header__content .bar", {
  ...scrollRevealOption,
  delay: 500,
});

ScrollReveal().reveal(".header__image__card", {
  duration: 1000,
  interval: 500,
  delay: 300,
});

// Get the About Us button
const aboutUsButton = document.querySelector(".btn.aboutus");

// Add click event listener
aboutUsButton.addEventListener("click", () => {
  window.location.href = "aboutus.html"; // Redirect to About Us page
});


// Get modal elements
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const forgotPasswordModal = document.getElementById("forgot-password-modal");

// Get buttons
const loginButton = document.querySelector('.btn.sign__in');
const signupButton = document.querySelector('.btn.sign__up');

// Get close buttons
const closeLogin = document.getElementById('close-login');
const closeSignup = document.getElementById('close-signup');
const closeForgotPassword = document.getElementById("close-forgot-password");

// Get links
const signupLink = document.getElementById('signup-link');
const loginLink = document.getElementById('login-link');
const forgotPasswordLink = document.getElementById("forgot-password-link");

// Open login modal
loginButton.addEventListener('click', () => {
  loginModal.style.display = 'block';
});

// Open signup modal
signupButton.addEventListener('click', () => {
  signupModal.style.display = 'block';
});

// Switch to signup modal from login modal
signupLink.addEventListener('click', () => {
  loginModal.style.display = 'none';
  signupModal.style.display = 'flex';
});

// Switch to login modal from signup modal
loginLink.addEventListener('click', () => {
  signupModal.style.display = 'none';
  loginModal.style.display = 'block';
});

forgotPasswordLink.addEventListener("click", (e) => {
  e.preventDefault();
  loginModal.style.display = "none";
  forgotPasswordModal.style.display = "flex";
});

// Close modals
closeLogin.addEventListener('click', () => {
  loginModal.style.display = 'none';
});

closeSignup.addEventListener('click', () => {
  signupModal.style.display = 'none';
});

closeForgotPassword.addEventListener("click", () => {
  forgotPasswordModal.style.display = "none";
});

// Close modals on outside click
window.addEventListener('click', (event) => {
  if (event.target === loginModal) loginModal.style.display = 'none';
  if (event.target === signupModal) signupModal.style.display = 'none';
  if (event.target === forgotPasswordModal) {
    forgotPasswordModal.style.display = "none";
  }
});

// Toggle Password Visibility
document.querySelectorAll(".toggle-password").forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("data-target");
    const passwordField = document.getElementById(targetId);
    const icon = button.querySelector("i");

    if (passwordField.type === "password") {
      passwordField.type = "text";
      icon.classList.remove("ri-eye-off-line");
      icon.classList.add("ri-eye-line");
    } else {
      passwordField.type = "password";
      icon.classList.remove("ri-eye-line");
      icon.classList.add("ri-eye-off-line");
    }
  });
});





