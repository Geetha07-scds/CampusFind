
document.addEventListener("DOMContentLoaded", function () {

    const lostContainer = document.getElementById("homeLostItems");
    const foundContainer = document.getElementById("homeFoundItems");

    const modal = document.getElementById("itemDetailsModal");
    const detailsContent = document.getElementById("itemDetailsContent");
    const closeModalBtn = document.getElementById("closeDetailsModal");

    let allItems = [];

    // Load items from MongoDB
    async function loadHomeItems() {

        try {

            const response = await fetch("/api/items");
            const data = await response.json();

            if (!response.ok) {
                throw new Error("Unable to load items");
            }

            allItems = data.items || [];

            displayLostItems();
            displayFoundItems();

        } catch (error) {

            console.error("Homepage loading error:", error);

            lostContainer.textContent = "Unable to load lost items.";
            foundContainer.textContent = "Unable to load found items.";

        }
    }

    // Format date
    function formatDate(date) {

        if (!date) {
            return "Not provided";
        }

        return new Date(date).toLocaleDateString("en-IN");

    }

    // Create an item card
    function createItemCard(item) {

        const card = document.createElement("div");
        card.className = "item-card";

        const label = document.createElement("span");

        label.className =
            item.itemType.toLowerCase() === "lost"
                ? "lost-label"
                : "found-label";

        label.textContent = item.itemType.toUpperCase();

        const name = document.createElement("h3");
        name.textContent = item.itemName;

        const category = document.createElement("p");
        category.textContent = "Category: " + item.category;

        const location = document.createElement("p");
        location.textContent = "Location: " + item.location;

        const date = document.createElement("p");
        date.textContent = "Date: " + formatDate(item.date);

        const status = document.createElement("p");
        status.textContent =
            "Status: " + (item.status || "active").toUpperCase();

        card.appendChild(label);

        // Display item image if available
        if (item.image) {

            const image = document.createElement("img");

            image.src = item.image;
            image.alt = item.itemName;
            image.className = "home-item-image";

            card.appendChild(image);

        }

        card.appendChild(name);
        card.appendChild(category);
        card.appendChild(location);
        card.appendChild(date);
        card.appendChild(status);

        // View Details Button
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = "View Details";

        button.addEventListener("click", function () {
            showItemDetails(item);
        });

        card.appendChild(button);

        return card;

    }

    // Display lost items
    function displayLostItems() {

        lostContainer.innerHTML = "";

        const lostItems = allItems.filter(item =>
            item.itemType &&
            item.itemType.toLowerCase() === "lost"
        );

        if (lostItems.length === 0) {

            lostContainer.textContent = "No lost items reported yet.";
            return;

        }

        lostItems.slice(0, 4).forEach(item => {

            lostContainer.appendChild(createItemCard(item));

        });

    }

    // Display found items
    function displayFoundItems() {

        foundContainer.innerHTML = "";

        const foundItems = allItems.filter(item =>
            item.itemType &&
            item.itemType.toLowerCase() === "found"
        );

        if (foundItems.length === 0) {

            foundContainer.textContent = "No found items reported yet.";
            return;

        }

        foundItems.slice(0, 4).forEach(item => {

            foundContainer.appendChild(createItemCard(item));

        });

    }

    // Show complete item details
    function showItemDetails(item) {

        detailsContent.innerHTML = "";

        const heading = document.createElement("h2");
        heading.textContent = item.itemName;

        const type = document.createElement("p");
        type.textContent = "Type: " + item.itemType.toUpperCase();

        const category = document.createElement("p");
        category.textContent = "Category: " + item.category;

        const description = document.createElement("p");
        description.textContent =
            "Description: " + (item.description || "Not provided");

        const location = document.createElement("p");
        location.textContent = "Location: " + item.location;

        const date = document.createElement("p");
        date.textContent = "Date: " + formatDate(item.date);

        const status = document.createElement("p");
        status.textContent =
            "Status: " + (item.status || "active").toUpperCase();

        detailsContent.appendChild(heading);

        if (item.image) {

            const image = document.createElement("img");

            image.src = item.image;
            image.alt = item.itemName;
            image.className = "details-item-image";

            detailsContent.appendChild(image);

        }

        detailsContent.appendChild(type);
        detailsContent.appendChild(category);
        detailsContent.appendChild(description);
        detailsContent.appendChild(location);
        detailsContent.appendChild(date);
        detailsContent.appendChild(status);

        modal.hidden = false;

    }

    // Close modal
    closeModalBtn.addEventListener("click", function () {

        modal.hidden = true;

    });

    // Close when clicking outside the modal content
    modal.addEventListener("click", function (event) {

        if (event.target === modal) {
            modal.hidden = true;
        }

    });

    // Close using Escape key
    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {
            modal.hidden = true;
        }

    });

    // Load homepage items
    loadHomeItems();

});
