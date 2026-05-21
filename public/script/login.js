// ========================================
// Form Elements
// ========================================

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const togglePasswordBtn = document.getElementById("togglePassword");

const btnSpinner = document.getElementById("btnSpinner");

const emailError = document.getElementById("emailError");

const passwordError = document.getElementById("passwordError");


// ========================================
// Email Validation
// ========================================

function isValidEmail(email) {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);

}

function validateEmail() {

    const email = emailInput.value.trim();

    if (!email) {

        emailError.textContent = "Email is required";

        return false;

    }

    if (!isValidEmail(email)) {

        emailError.textContent = "Please enter a valid email address";

        return false;

    }

    emailError.textContent = "";

    return true;

}


// ========================================
// Password Validation
// ========================================

function validatePassword() {

    const password = passwordInput.value;

    if (!password) {

        passwordError.textContent = "Password is required";

        return false;

    }

    if (password.length < 6) {

        passwordError.textContent = "Password must be at least 6 characters";

        return false;

    }

    passwordError.textContent = "";

    return true;

}


// ========================================
// Real-Time Validation
// ========================================

emailInput.addEventListener("blur", validateEmail);

emailInput.addEventListener("input", () => {

    if (emailError.textContent) {

        validateEmail();

    }

});

passwordInput.addEventListener("blur", validatePassword);

passwordInput.addEventListener("input", () => {

    if (passwordError.textContent) {

        validatePassword();

    }

});


// ========================================
// Toggle Password Visibility
// ========================================

togglePasswordBtn.addEventListener("click", () => {

    const type =
        passwordInput.type === "password"
            ? "text"
            : "password";

    passwordInput.type = type;

});


// ========================================
// Form Submission
// ========================================

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    // Validate Inputs
    const emailValid = validateEmail();

    const passwordValid = validatePassword();

    if (!emailValid || !passwordValid) {

        return;

    }

    // Show Loading State
    const submitBtn =
        loginForm.querySelector('button[type="submit"]');

    submitBtn.disabled = true;

    btnSpinner.classList.remove("d-none");

    try {

        // Get Values
        const email = emailInput.value.trim();

        const password = passwordInput.value;

        // Send Data To Backend
        const response = await fetch("/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                email: email,

                password: password

            })

        });

        // Backend Response
        const data = await response.text();

        // Success / Error Message
        alert(data);

        // Redirect After Successful Login
        if (data === "Login successful") {

            window.location.href = "/";

        }

        // Reset Form
        loginForm.reset();

        emailError.textContent = "";

        passwordError.textContent = "";

    }

    catch (error) {

        console.error("Login Error:", error);

        emailError.textContent =
            "Server error. Please try again.";

    }

    finally {

        // Remove Loading State
        submitBtn.disabled = false;

        btnSpinner.classList.add("d-none");

    }

});


// ========================================
// Enter Key Support
// ========================================

passwordInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

        loginForm.dispatchEvent(
            new Event("submit")
        );

    }

});


// ========================================
// Signup Redirect
// ========================================

const signupLink =
    document.querySelector(".signup-link");

signupLink.addEventListener("click", (e) => {

    e.preventDefault();

    window.location.href = "/pages/signup.html";

});