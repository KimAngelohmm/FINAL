// scripts.js
const show = (id) => {
    document.getElementById(id).style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
};

const hide = (id) => {
    document.getElementById(id).style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
};

    function showUI(id) {
        overlay.style.display = "block";
        document.querySelectorAll(".floating-ui").forEach(el => el.style.display = "none");
        document.getElementById(id).style.display = "block";
    }

    function hideAllUI() {
        overlay.style.display = "none";
        document.querySelectorAll(".floating-ui").forEach(el => el.style.display = "none");
    }

document.getElementById('loginLink').addEventListener('click', () => show('floatingUI'));
document.getElementById('aboutUsLink').addEventListener('click', () => {
    document.getElementById('aboutUsUI').style.display = 'block';
});

document.getElementById('closeBtn').addEventListener('click', () => hide('floatingUI'));
document.getElementById('closeAboutUsBtn').addEventListener('click', () => document.getElementById('aboutUsUI').style.display = 'none');
document.getElementById('guestBtn').addEventListener('click', () => { hide('floatingUI'); show('guestUI'); });
document.getElementById('backToLoginBtn').addEventListener('click', () => { hide('guestUI'); show('floatingUI'); });
document.getElementById('guestCloseBtn').addEventListener('click', () => hide('guestUI'));

document.getElementById('switchToRegisterBtn').addEventListener('click', () => { hide('floatingUI'); show('registerUI'); });
document.getElementById('backToLoginFromRegisterBtn').addEventListener('click', () => { hide('registerUI'); show('floatingUI'); });
document.getElementById('registerCloseBtn').addEventListener('click', () => hide('registerUI'));

document.getElementById('forgotPasswordLink').addEventListener('click', () => { hide('floatingUI'); show('forgotPasswordUI'); });
document.getElementById('backToLoginFromForgotBtn').addEventListener('click', () => { hide('forgotPasswordUI'); show('floatingUI'); });
document.getElementById('forgotCloseBtn').addEventListener('click', () => hide('forgotPasswordUI'));

document.getElementById('cancelRecoveryBtn').addEventListener('click', () => hide('recoveryUI'));
document.getElementById('recoveryCloseBtn').addEventListener('click', () => hide('recoveryUI'));

function toggleRegisterPassword() {
    const passFields = document.querySelectorAll('input[type="password"]');
    passFields.forEach(field => {
        field.type = field.type === 'password' ? 'text' : 'password';
    });
}

// Register form submission logic
document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("registerUsername").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    // Password policy: 8–12 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,12}$/;

    if (!passwordPattern.test(password)) {
        alert("Password must be 8–12 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.");
        return;
    }

    try {
        const response = await fetch("/backend/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });
        const data = await response.json();
        if (data.success) {
            alert("Registration successful!");
            hide('registerUI');
            show('floatingUI');
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        console.error(error);
        alert("An error occurred during registration.");
    }
});

document.getElementById("registerPassword").addEventListener("input", function () {
    const password = this.value;

    // Update each rule
    document.getElementById("lengthRule").textContent = (password.length >= 8 && password.length <= 12) 
        ? "✅ 8–12 characters" : "❌ 8–12 characters";

    document.getElementById("uppercaseRule").textContent = /[A-Z]/.test(password) 
        ? "✅ At least one uppercase letter" : "❌ At least one uppercase letter";

    document.getElementById("lowercaseRule").textContent = /[a-z]/.test(password) 
        ? "✅ At least one lowercase letter" : "❌ At least one lowercase letter";

    document.getElementById("numberRule").textContent = /\d/.test(password) 
        ? "✅ At least one number" : "❌ At least one number";

    document.getElementById("specialCharRule").textContent = /[\W_]/.test(password) 
        ? "✅ At least one special character" : "❌ At least one special character";
});

// Function to handle login
document.getElementById("loginBtn").addEventListener("click", async function (e) {
    e.preventDefault();  // Prevent the default form submission behavior

    const usernameOrEmail = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!usernameOrEmail || !password) {
        alert("Please enter both username/email and password.");
        return;
    }

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usernameOrEmail, password }),
        });

        const data = await response.json();

        if (response.ok && data.message === "Login successful") {
            console.log("DEBUG - login successful response:", data);
            const role = data.user.role.toLowerCase(); // Convert to lowercase for case-insensitive comparison
            console.log("DEBUG - Role detected:", role);
            
            switch (role) {
                case "admin":
                    window.location.href = "/admin_ui";
                    break;
                case "customer":
                    window.location.href = "/customer_ui";
                    break;
                case "staff":
                    window.location.href = "/staff_ui";
                    break;
                case "cashier":
                    console.log("DEBUG - Redirecting to cashier_loader");
                    window.location.href = "/backend/cashier/cashier_loader";
                    break;
                case "kitchen":
                    window.location.href = "/backend/kitchen/kitchen_loader";
                    break;
                case "delivery":
                    window.location.href = "/delivery_ui";
                    break;
                default:
                    console.log("DEBUG - Unknown role:", role);
                    alert("Error: Unknown account type '" + role + "'. Please contact support.");
            }
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred during login.");
    }
});


// Function to handle guest login
document.getElementById("guestLoginBtn").addEventListener("click", async function (e) {
    e.preventDefault();

    const guest_username = document.getElementById("guestUsername").value.trim();
    const contact_number = document.getElementById("guestContact").value.trim();

    if (!guest_username || !contact_number) {
        alert("Please enter both username and contact number.");
        return;
    }

    try {
        const response = await fetch("/guest-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guest_username, contact_number })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Guest login successful!");
            console.log("Logged in as guest:", data.guest);
            hide('guestUI'); // You can use your custom hide function
        } else {
            alert("Guest login failed: " + data.message);
        }
    } catch (error) {
        console.error("Error during guest login:", error);
        alert("An error occurred while trying to log in as guest.");
    }
});

// Optional: back button behavior
document.getElementById("backToLoginBtn").addEventListener("click", function () {
    hide('guestUI');
    show('floatingUI'); // Assuming this is your main login UI
});

// Optional: close button
document.getElementById("guestCloseBtn").addEventListener("click", function () {
    hide('guestUI');
});

// password recovery
document.addEventListener("DOMContentLoaded", () => {
    const recoveryUI = document.getElementById("recoveryUI");
    const recoveryCodeInput = document.getElementById("recoveryCode");
    const confirmRecoveryBtn = document.getElementById("confirmRecoveryBtn");
    const cancelRecoveryBtn = document.getElementById("cancelRecoveryBtn");
    const recoveryCloseBtn = document.getElementById("recoveryCloseBtn");
    const resendCode = document.getElementById("resendCode");

    confirmRecoveryBtn.addEventListener("click", async () => {
        const code = recoveryCodeInput.value.trim();

        if (!code) {
            alert("Please enter the verification code.");
            return;
        }

        const email = sessionStorage.getItem("recoveryEmail");  // ✅ Get stored email
        const response = await fetch("/verify-recovery-code", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, code }),  // ✅ Now it sends both
        });

        const result = await response.json();
        if (response.ok) {
            alert("Code verified. Proceed to reset password.");
            show('resetPassword');  // Show reset password UI
            hide('recoveryUI');  // Hide recovery UI
        } else {
            alert(result.message);
        }
    });

    cancelRecoveryBtn.addEventListener("click", () => {
        recoveryUI.style.display = "none";
    });

    recoveryCloseBtn.addEventListener("click", () => {
        recoveryUI.style.display = "none";
    });

    document.getElementById("resendCode").addEventListener("click", async (e) => {
        e.preventDefault();

        const email = document.getElementById("forgotEmail")?.value;
        
        if (!email) {
            alert("Email not found. Please go back and enter your email.");
            return;
        }

        const response = await fetch("/resend-recovery-code", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });

        const result = await response.json();
        alert(result.message);
    });
});

// Forgot Password logic
document.getElementById('sendCodeBtn').addEventListener('click', async function (e) {
    e.preventDefault();  // Prevent the default button behavior

    const email = document.getElementById('forgotEmail').value.trim();

    if (!email) {
        alert("Please enter your email address.");
        return;
    }

    sessionStorage.setItem("recoveryEmail", email);

    try {
        // Sending email to backend to request a verification code
        const response = await fetch("/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();

        if (response.ok) {
            alert("A verification code has been sent to your email.");
            // Hide forgot password UI and maybe show recovery UI
            hide('forgotPasswordUI');
            show('recoveryUI');  // Assuming you have the recovery UI to enter the code
        } else {
            alert("Error: " + data.message); // Show the error message from backend
        }
    } catch (error) {
        console.error("Error:", error);
        alert("There was an error processing your request.");
    }
    
});

// Reset Password logic
document.addEventListener("DOMContentLoaded", function () {
    const resetPassword = document.getElementById("resetPassword");
    const newPasswordInput = document.getElementById("newPassword");
    const repeatNewPasswordInput = document.getElementById("repeatNewPassword");
    const confirmResetBtn = document.getElementById("confirmNewPasswordBtn");
    const cancelRecoveryBtn = document.getElementById("cancelNewPasswordBtn");

    // Handle resetting password after verification
    confirmResetBtn.addEventListener("click", async function () {
        const newPassword = newPasswordInput.value.trim();
        const repeatNewPassword = repeatNewPasswordInput.value.trim();

        // Validate password fields
        if (newPassword !== repeatNewPassword) {
            alert("Passwords do not match. Please try again.");
            return;
        }

        if (!newPassword || !repeatNewPassword) {
            alert("Please enter both password fields.");
            return;
        }

        // Disable the button to prevent multiple clicks
        confirmResetBtn.disabled = true;

        try {
            const email = sessionStorage.getItem("recoveryEmail");  // Get the email from session storage
            if (!email) {
                alert("No email found for recovery. Please try again.");
                return;
            }

            const response = await fetch("/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, new_password: newPassword })
            });

            const result = await response.json();

            // Log the response for debugging
            console.log("Response:", response);  // Log full response object
            console.log("Result:", result);  // Log parsed response JSON

            if (response.ok && result.success) {
                alert("Password reset successful!");
                hide('recoveryUI');  // Hide recovery UI
                newPasswordInput.value = "";  // Clear inputs
                repeatNewPasswordInput.value = "";  // Clear inputs
            } else {
                alert("Password reset failed: " + result.message);
            }
        } catch (error) {
            console.error("Error during password reset:", error);
            alert("An error occurred while resetting your password.");
        } finally {
            // Re-enable the button
            confirmResetBtn.disabled = false;
        }
    });

    resetPasswordCloseBtn.addEventListener("click", function () {
        hide('resetPassword');
        newPasswordInput.value = "";  // Clear inputs
        repeatNewPasswordInput.value = "";  // Clear inputs
    });

    cancelNewPasswordBtn.addEventListener("click", function () {
        hide('resetPassword');
        newPasswordInput.value = "";  // Clear inputs
        repeatNewPasswordInput.value = "";  // Clear inputs
    });
});

    // Show the About Us content when clicked
    document.getElementById('aboutUsLink').addEventListener('click', function () {
        fetch('static/assets/aboutus.txt')
            .then(response => response.text())  // Read the content of the file
            .then(data => {
                // Use innerHTML to insert HTML content (including <strong> tags) into the About Us UI
                document.getElementById('aboutUsContent').innerHTML = data;  // This allows <strong> to be rendered as bold
                document.getElementById('aboutUsUI').style.display = 'block';  // Show the floating UI
            });
    });