
// Display lost items
async function loadLostItems() {

    const itemContainer = document.getElementById("itemContainer");

    try {

        const response = await fetch("/api/items");
        const data = await response.json();

        if (!response.ok) {
            throw new Error("Failed to fetch items");
        }

        const items = data.items || [];

        const lostItems = items.filter(item =>
            item.itemType &&
            item.itemType.toLowerCase() === "lost"
        );

        itemContainer.innerHTML = "";

        if (lostItems.length === 0) {
            itemContainer.textContent = "No lost items reported yet.";
            return;
        }

        lostItems.forEach(item => {

            const card = document.createElement("div");
            card.className = "item-card";

            const label = document.createElement("span");
            label.className = "lost-label";
            label.textContent = "LOST";

            const name = document.createElement("h3");
            name.textContent = item.itemName;

            // Item image
            if (item.image) {

                const image = document.createElement("img");

                image.src = item.image;
                image.alt = item.itemName || "Lost item image";

                image.style.width = "100%";
                image.style.maxWidth = "300px";
                image.style.height = "200px";
                image.style.objectFit = "contain";
                image.style.borderRadius = "8px";
                image.style.marginBottom = "10px";

                image.onerror = function () {
                    image.style.display = "none";
                };

                card.appendChild(image);

            } else {

                const noImage = document.createElement("p");
                noImage.textContent = "No image uploaded.";
                card.appendChild(noImage);

            }

            const category = document.createElement("p");
            category.textContent = "Category: " + item.category;

            const location = document.createElement("p");
            location.textContent = "Location: " + item.location;

            const description = document.createElement("p");
            description.textContent = "Description: " + item.description;

            const date = document.createElement("p");
            date.textContent = "Date: " +
                (item.date
                    ? new Date(item.date).toLocaleDateString()
                    : "Not specified");

            const status = document.createElement("p");
            status.textContent =
                "Status: " + (item.status || "active").toUpperCase();

            // View Details button
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = "View Details";

            button.addEventListener("click", function () {
                showItemDetails(item);
            });

            card.append(
                label,
                name,
                category,
                location,
                description,
                date,
                status,
                button
            );

            itemContainer.appendChild(card);

        });

    } catch (error) {

        console.error("Error loading lost items:", error);
        itemContainer.textContent = "Unable to load lost items.";

    }
}


// Create and display item details popup
function showItemDetails(item) {

    let modal = document.getElementById("itemDetailsModal");

    // Create modal only once
    if (!modal) {

        modal = document.createElement("div");
        modal.id = "itemDetailsModal";

        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.width = "100%";
        modal.style.height = "100%";
        modal.style.background = "rgba(0,0,0,0.65)";
        modal.style.display = "flex";
        modal.style.justifyContent = "center";
        modal.style.alignItems = "center";
        modal.style.zIndex = "10000";
        modal.style.padding = "15px";
        modal.style.boxSizing = "border-box";

        const content = document.createElement("div");
        content.id = "itemDetailsContent";

        content.style.background = "white";
        content.style.padding = "25px";
        content.style.borderRadius = "12px";
        content.style.width = "100%";
        content.style.maxWidth = "500px";
        content.style.maxHeight = "85vh";
        content.style.overflowY = "auto";
        content.style.position = "relative";

        modal.appendChild(content);
        document.body.appendChild(modal);

        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });

    }

    const content = document.getElementById("itemDetailsContent");
    content.innerHTML = "";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "Close";
    closeButton.style.float = "right";

    closeButton.addEventListener("click", function () {
        modal.style.display = "none";
    });

    const heading = document.createElement("h2");
    heading.textContent = item.itemName;

    content.append(closeButton, heading);

    if (item.image) {

        const image = document.createElement("img");
        image.src = item.image;
        image.alt = item.itemName;

        image.style.width = "100%";
        image.style.maxHeight = "250px";
        image.style.objectFit = "contain";

        content.appendChild(image);

    }

    const details = [
        "Type: LOST",
        "Category: " + item.category,
        "Description: " + item.description,
        "Location: " + item.location,
        "Date: " + (item.date
            ? new Date(item.date).toLocaleDateString()
            : "Not specified"),
        "Status: " + (item.status || "active").toUpperCase()
    ];

    details.forEach(detail => {

        const paragraph = document.createElement("p");
        paragraph.textContent = detail;
        content.appendChild(paragraph);

    });

    modal.style.display = "flex";

}


// Load items when page opens
loadLostItems();
