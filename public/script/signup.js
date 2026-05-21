// ========== PASSWORD VISIBILITY TOGGLE ==========

document.addEventListener("DOMContentLoaded", function () {

    // Get all password toggle buttons
    const toggleButtons =
        document.querySelectorAll(".toggle-password");

    toggleButtons.forEach(button => {

        button.addEventListener("click", function (e) {

            e.preventDefault();

            const targetId =
                this.getAttribute("data-target");

            const inputField =
                document.getElementById(targetId);

            const icon =
                this.querySelector("i");

            // Toggle Password Visibility
            if (inputField.type === "password") {

                inputField.type = "text";

                icon.classList.remove("fa-eye");

                icon.classList.add("fa-eye-slash");

            }

            else {

                inputField.type = "password";

                icon.classList.remove("fa-eye-slash");

                icon.classList.add("fa-eye");

            }

        });

    });

    // ========== FORM VALIDATION AND SUBMISSION ==========

    const signupForm =
        document.getElementById("signupForm");

    signupForm.addEventListener("submit", function (e) {

        e.preventDefault();

        // Get Form Values
        const username =
            document.getElementById("username")
                .value
                .trim();

        const email =
            document.getElementById("email")
                .value
                .trim();

        const password =
            document.getElementById("password")
                .value;

        const confirmPassword =
            document.getElementById("confirmPassword")
                .value;

        // Validation Checks

        if (!username) {

            showValidationError(
                "username",
                "Username is required"
            );

            return;

        }

        if (username.length < 3) {

            showValidationError(
                "username",
                "Username must be at least 3 characters"
            );

            return;

        }

        if (!isValidEmail(email)) {

            showValidationError(
                "email",
                "Please enter a valid email address"
            );

            return;

        }

        if (password.length < 6) {

            showValidationError(
                "password",
                "Password must be at least 6 characters"
            );

            return;

        }

        if (password !== confirmPassword) {

            showValidationError(
                "confirmPassword",
                "Passwords do not match"
            );

            return;

        }

        // Clear Errors
        clearAllErrors();

        // Send To Backend
        submitSignup(
            username,
            email,
            password
        );

    });

    // Clear Errors On Focus
    const inputs =
        document.querySelectorAll(".form-control");

    inputs.forEach(input => {

        input.addEventListener("focus", function () {

            clearError(this.id);

        });

    });

});


// ========== EMAIL VALIDATION ==========

function isValidEmail(email) {

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);

}


// ========== SHOW ERROR ==========

function showValidationError(fieldId, message) {

    const field =
        document.getElementById(fieldId);

    const formGroup =
        field.closest(".form-group");

    clearError(fieldId);

    // Red Border
    field.style.borderColor = "#ef4444";

    field.style.boxShadow =
        "0 0 18px rgba(239,68,68,0.3)";

    // Error Message
    const errorDiv =
        document.createElement("div");

    errorDiv.className =
        "error-message";

    errorDiv.style.cssText = `
        font-size: 12px;
        color: #ef4444;
        margin-top: 6px;
    `;

    errorDiv.textContent = message;

    formGroup.appendChild(errorDiv);

}


// ========== CLEAR SINGLE ERROR ==========

function clearError(fieldId) {

    const field =
        document.getElementById(fieldId);

    const formGroup =
        field.closest(".form-group");

    const errorMessage =
        formGroup.querySelector(".error-message");

    if (errorMessage) {

        errorMessage.remove();

    }

    field.style.borderColor = "";

    field.style.boxShadow = "";

}


// ========== CLEAR ALL ERRORS ==========

function clearAllErrors() {

    const errorMessages =
        document.querySelectorAll(".error-message");

    errorMessages.forEach(msg => {

        msg.remove();

    });

    const inputs =
        document.querySelectorAll(".form-control");

    inputs.forEach(input => {

        input.style.borderColor = "";

        input.style.boxShadow = "";

    });

}


// ========== REAL BACKEND SIGNUP ==========

async function submitSignup(username, email, password) {

    // Prepare Data
    const formData = {

        username: username,

        email: email,

        password: password

    };

    // Button State
    const submitBtn =
        document.querySelector(".btn-signup");

    const originalText =
        submitBtn.innerHTML;

    submitBtn.disabled = true;

    submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Creating Account...';

    try {

        // Send Data To Backend
        const response =
            await fetch("/signup", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(formData)

            });

        // Backend Response
        const data =
            await response.text();

        console.log("Backend Response:", data);

        // Success
        if (data === "Account created") {

            submitBtn.innerHTML =
                '<i class="fas fa-check"></i> Account Created!';

            submitBtn.style.background =
                "linear-gradient(135deg,#10b981,#059669)";

            // Reset Form
            document
                .getElementById("signupForm")
                .reset();

            // Redirect To Login
            setTimeout(() => {

                window.location.href =
                    "/pages/login.html";

            }, 1500);

        }

        // Backend Error
        else {

            alert(data);

            submitBtn.disabled = false;

            submitBtn.innerHTML =
                originalText;

        }

    }

    catch (error) {

        console.error(
            "Signup Error:",
            error
        );

        alert(
            "Server error. Please try again."
        );

        submitBtn.disabled = false;

        submitBtn.innerHTML =
            originalText;

    }

}