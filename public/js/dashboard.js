
document.addEventListener("DOMContentLoaded", function () {

    const userInfo = document.getElementById("userInfo");
    const itemContainer = document.getElementById("itemContainer");
    const claimsContainer = document.getElementById("claimsContainer");
    const logoutBtn = document.getElementById("logoutBtn");


    // Load logged-in user's details
    async function loadUser() {

        try {

            const response = await fetch("/api/auth/me");

            if (response.status === 401) {
                window.location.href = "login.html";
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load user details");
            }

            userInfo.innerHTML = `
                <h3>Welcome, ${escapeHTML(data.user.name)}!</h3>
                <p>Email: ${escapeHTML(data.user.email)}</p>
                <p>Student PRN: ${escapeHTML(data.user.studentPRN)}</p>
            `;

        } catch (error) {

            userInfo.textContent = error.message;

        }

    }


    // Load items reported by logged-in user
    async function loadMyItems() {

        try {

            const response = await fetch("/api/my-items");

            if (response.status === 401) {
                window.location.href = "login.html";
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load your items");
            }

            const items = data.items;

            itemContainer.innerHTML = "";

            if (!items || items.length === 0) {

                itemContainer.innerHTML = `
                    <p>You have not reported any items yet.</p>
                `;

                return;

            }

            items.forEach(function (item) {

                const card = document.createElement("div");
                card.className = "item-card";

                const heading = document.createElement("h3");
                heading.textContent = item.itemName;

                const type = document.createElement("p");
                type.textContent = "Type: " + item.itemType;

                const category = document.createElement("p");
                category.textContent = "Category: " + item.category;

                const description = document.createElement("p");
                description.textContent = "Description: " + item.description;

                const location = document.createElement("p");
                location.textContent = "Location: " + item.location;

                const date = document.createElement("p");
                date.textContent = "Date: " +
                    (item.date
                        ? new Date(item.date).toLocaleDateString()
                        : "Not specified");

                // Display item status
                const status = document.createElement("p");

                status.textContent =
                    "Item Status: " +
                    (item.status || "active").toUpperCase();

                card.appendChild(heading);
                card.appendChild(type);
                card.appendChild(category);
                card.appendChild(description);
                card.appendChild(location);
                card.appendChild(date);
                card.appendChild(status);

                // Display uploaded image
                if (item.image) {

                    const image = document.createElement("img");

                    image.src = item.image;
                    image.alt = item.itemName;
                    image.style.width = "150px";

                    card.appendChild(image);

                }

                itemContainer.appendChild(card);

            });

        } catch (error) {

            itemContainer.textContent = error.message;

        }

    }


    // Load claims submitted by logged-in user
    async function loadMyClaims() {

        try {

            const response = await fetch("/api/my-claims");

            if (response.status === 401) {
                window.location.href = "login.html";
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load your claims");
            }

            const claims = data.claims;

            claimsContainer.innerHTML = "";

            if (!claims || claims.length === 0) {

                claimsContainer.innerHTML = `
                    <p>You have not submitted any claims yet.</p>
                `;

                return;

            }

            claims.forEach(function (claim) {

                const card = document.createElement("div");
                card.className = "item-card";

                const heading = document.createElement("h3");

                heading.textContent = claim.item
                    ? claim.item.itemName
                    : "Item details unavailable";

                const description = document.createElement("p");
                description.textContent =
                    "Claim Description: " + claim.claimDescription;

                const status = document.createElement("p");

                status.textContent =
                    "Claim Status: " + claim.status.toUpperCase();

                const date = document.createElement("p");

                date.textContent = "Submitted On: " +
                    new Date(claim.createdAt).toLocaleDateString();

                card.appendChild(heading);
                card.appendChild(description);
                card.appendChild(status);
                card.appendChild(date);

                claimsContainer.appendChild(card);

            });

        } catch (error) {

            claimsContainer.textContent = error.message;

        }

    }


    // Safely display user-provided text
    function escapeHTML(value) {

        return String(value ?? "").replace(/[&<>"']/g, function (character) {

            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entities[character];

        });

    }


    // Logout
    logoutBtn.addEventListener("click", async function () {

        try {

            const response = await fetch("/api/auth/logout", {
                method: "POST"
            });

            if (response.ok) {
                window.location.href = "login.html";
            }

        } catch (error) {

            alert("Unable to logout. Please try again.");

        }

    });


    // Load dashboard information
    loadUser();
    loadMyItems();
    loadMyClaims();

});
