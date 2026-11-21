
console.log("CampusFind search.js is working!");

document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const searchResults = document.getElementById("searchResults");

    let allItems = [];

    // =====================================
    // 1. FETCH ITEMS FROM MONGODB
    // =====================================

    async function loadItems() {

        try {

            const response = await fetch("/api/items");
            const data = await response.json();

            if (!response.ok) {
                throw new Error("Failed to fetch items");
            }

            allItems = data.items || [];

            console.log("Items received from MongoDB:", allItems);

            console.log("Items loaded:", allItems);

        } catch (error) {

            console.error("Error loading items:", error);

            searchResults.textContent = "Unable to load items.";

        }

    }


    // =====================================
    // 2. DISPLAY SEARCH RESULTS
    // =====================================

    function displayItems(items) {

        searchResults.innerHTML = "";

        if (items.length === 0) {

            searchResults.textContent = "No items found!";

            return;
        }

        items.forEach(function (item) {

            const card = document.createElement("div");
            card.className = "item-card";


            // Lost or Found label
            const label = document.createElement("span");

            label.className =
                item.itemType &&
                item.itemType.toLowerCase() === "lost"
                    ? "lost-label"
                    : "found-label";

            label.textContent = (item.itemType || "Unknown").toUpperCase();


            // =====================================
            // ITEM IMAGE
            // =====================================

            if (item.image && item.image.trim() !== "") {

                const image = document.createElement("img");

                // Image path from MongoDB
                image.src = item.image;

                image.alt = item.itemName || "Item image";

                image.style.width = "100%";
                image.style.maxWidth = "300px";
                image.style.height = "200px";
                image.style.objectFit = "contain";
                image.style.borderRadius = "8px";
                image.style.marginTop = "10px";
                image.style.marginBottom = "10px";

                // If image cannot be loaded
                image.onerror = function () {

                    image.style.display = "none";

                    const errorMessage = document.createElement("p");

                    errorMessage.textContent =
                        "Image could not be loaded.";

                    card.insertBefore(errorMessage, heading);

                };

                card.appendChild(image);

            } else {

                const noImage = document.createElement("p");

                noImage.textContent = "No image uploaded.";

                card.appendChild(noImage);

            }


            // Item name
            const heading = document.createElement("h3");

            heading.textContent = item.itemName || "Unnamed Item";


            // Category
            const category = document.createElement("p");

            category.textContent =
                "Category: " + (item.category || "Not specified");


            // Location
            const location = document.createElement("p");

            location.textContent =
                "Location: " + (item.location || "Not specified");


            // Description
            const description = document.createElement("p");

            description.textContent =
                "Description: " + (item.description || "Not specified");


            // Date
            const date = document.createElement("p");

            date.textContent =
                "Date: " +
                (item.date
                    ? new Date(item.date).toLocaleDateString()
                    : "Not specified");


            // Add elements to card
            card.appendChild(label);
            card.appendChild(heading);
            card.appendChild(category);
            card.appendChild(location);
            card.appendChild(description);
            card.appendChild(date);


            // Add card to search results
            searchResults.appendChild(card);

        });

    }


    // =====================================
    // 3. SEARCH FUNCTION
    // =====================================

    function searchItems() {

        const value = searchInput.value.toLowerCase().trim();

        if (value === "") {

            searchResults.textContent =
                "Please enter an item name or keyword.";

            return;
        }

        const filteredItems = allItems.filter(function (item) {

            return (

                (item.itemName || "").toLowerCase().includes(value) ||

                (item.category || "").toLowerCase().includes(value) ||

                (item.location || "").toLowerCase().includes(value) ||

                (item.description || "").toLowerCase().includes(value) ||

                (item.itemType || "").toLowerCase().includes(value)

            );

        });

        displayItems(filteredItems);

    }


    // =====================================
    // 4. SEARCH BUTTON
    // =====================================

    searchBtn.addEventListener("click", searchItems);


    // Search using Enter key
    searchInput.addEventListener("keypress", function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            searchItems();

        }

    });


    // Load items when page opens
    loadItems();

});
