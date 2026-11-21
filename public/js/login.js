
document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");
    const message = document.getElementById("message");

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        message.textContent = "";

        try {

            const response = await fetch("/api/auth/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })

            });

            const data = await response.json();

            if (response.ok) {

                message.textContent = "Login successful! Redirecting...";
                message.style.color = "green";

                loginForm.reset();

                // Get the logged-in user's role
                const userResponse = await fetch("/api/auth/me");
                const userData = await userResponse.json();

                if (!userResponse.ok) {
                    throw new Error("Unable to verify user role.");
                }

                setTimeout(function () {

                    if (userData.user.role === "admin") {

                        window.location.href = "admin.html";

                    } else {

                        window.location.href = "dashboard.html";

                    }

                }, 1000);

            } else {

                message.textContent = data.message || "Invalid email or password.";
                message.style.color = "red";

            }

        } catch (error) {

            console.error("Login error:", error);

            message.textContent = "Unable to complete login. Please try again.";
            message.style.color = "red";

        }

    });

});
