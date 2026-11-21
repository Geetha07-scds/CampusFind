
document.addEventListener("DOMContentLoaded", function () {

    const registerForm = document.getElementById("registerForm");
    const message = document.getElementById("message");

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("name").value.trim();

        const email = document.getElementById("email").value.trim();

        const studentPRN = document.getElementById("studentPRN").value.trim();

        const password = document.getElementById("password").value;

        const confirmPassword = document.getElementById("confirmPassword").value;

        message.textContent = "";

        // Check password confirmation
        if (password !== confirmPassword) {

            message.textContent = "Passwords do not match.";
            message.style.color = "red";

            return;
        }

        // Check password length
        if (password.length < 8) {

            message.textContent = "Password must contain at least 8 characters.";
            message.style.color = "red";

            return;
        }

        try {

            const response = await fetch("/api/auth/register", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    studentPRN: studentPRN,
                    password: password
                })

            });

            const data = await response.json();

            message.textContent = data.message;

            if (response.ok) {

                message.style.color = "green";

                registerForm.reset();

                setTimeout(function () {

                    window.location.href = "login.html";

                }, 1500);

            } else {

                message.style.color = "red";

            }

        } catch (error) {

            console.error("Registration error:", error);

            message.textContent = "Unable to connect to the server.";
            message.style.color = "red";

        }

    });

});
