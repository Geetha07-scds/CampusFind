
// Display found items
async function loadFoundItems() {

    const itemContainer = document.getElementById("itemContainer");

    try {

        const response = await fetch("/api/items");
        const data = await response.json();

        if (!response.ok) {
            throw new Error("Failed to fetch items");
        }

        const items = data.items || [];

        const foundItems = items.filter(item =>
            item.itemType &&
            item.itemType.toLowerCase() === "found"
        );

        itemContainer.innerHTML = "";

        if (foundItems.length === 0) {
            itemContainer.textContent = "No found items reported yet.";
            return;
        }

        foundItems.forEach(item => {

            const card = document.createElement("div");
            card.className = "item-card";

            const label = document.createElement("span");
            label.className = "found-label";
            label.textContent = "FOUND";

            const name = document.createElement("h3");
            name.textContent = item.itemName;

            // Display uploaded image
            if (item.image) {

                const image = document.createElement("img");

                image.src = item.image;
                image.alt = item.itemName || "Found item image";

                image.style.width = "100%";
                image.style.maxWidth = "300px";
                image.style.height = "200px";
                image.style.objectFit = "contain";
                image.style.display = "block";
                image.style.margin = "10px 0";

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
            const detailsButton = document.createElement("button");
            detailsButton.type = "button";
            detailsButton.textContent = "View Details";

            detailsButton.addEventListener("click", function () {
                showItemDetails(item);
            });

            // Claim button
            const claimButton = document.createElement("button");
            claimButton.type = "button";
            claimButton.textContent = "Submit Claim";
            claimButton.style.marginLeft = "10px";

            // Claim form
            const claimForm = document.createElement("form");
            claimForm.style.display = "none";
            claimForm.style.marginTop = "15px";

            const claimHeading = document.createElement("h4");
            claimHeading.textContent = "Submit Your Claim";

            const claimTextarea = document.createElement("textarea");
            claimTextarea.placeholder =
                "Explain why you believe this item belongs to you...";
            claimTextarea.required = true;
            claimTextarea.rows = 4;
            claimTextarea.style.width = "100%";
            claimTextarea.style.marginBottom = "10px";

            const submitButton = document.createElement("button");
            submitButton.type = "submit";
            submitButton.textContent = "Send Claim";

            const cancelButton = document.createElement("button");
            cancelButton.type = "button";
            cancelButton.textContent = "Cancel";
            cancelButton.style.marginLeft = "10px";

            const claimMessage = document.createElement("p");

            // Show claim form
            claimButton.addEventListener("click", function () {

                claimForm.style.display = "block";
                claimButton.disabled = true;

            });

            // Cancel claim
            cancelButton.addEventListener("click", function () {

                claimForm.style.display = "none";
                claimButton.disabled = false;
                claimTextarea.value = "";
                claimMessage.textContent = "";

            });

            // Submit claim
            claimForm.addEventListener("submit", async function (event) {

                event.preventDefault();

                const claimDescription = claimTextarea.value.trim();

                if (!claimDescription) {
                    claimMessage.textContent =
                        "Please enter a claim description.";
                    return;
                }

                submitButton.disabled = true;
                submitButton.textContent = "Submitting...";

                try {

                    const claimResponse = await fetch("/api/claims", {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            itemId: item._id,
                            claimDescription: claimDescription
                        })

                    });

                    const claimData = await claimResponse.json();

                    if (!claimResponse.ok) {
                        throw new Error(
                            claimData.message || "Unable to submit claim."
                        );
                    }

                    claimMessage.textContent =
                        "Claim submitted successfully! Status: Pending";

                    claimMessage.style.color = "green";

                    claimTextarea.disabled = true;
                    submitButton.style.display = "none";
                    cancelButton.style.display = "none";

                    claimButton.textContent = "Claim Submitted";
                    claimButton.disabled = true;

                } catch (error) {

                    console.error("Claim submission error:", error);

                    claimMessage.textContent = error.message;
                    claimMessage.style.color = "red";

                    submitButton.disabled = false;
                    submitButton.textContent = "Send Claim";

                }

            });

            claimForm.append(
                claimHeading,
                claimTextarea,
                submitButton,
                cancelButton,
                claimMessage
            );

            card.append(
                label,
                name,
                category,
                location,
                description,
                date,
                status,
                detailsButton,
                claimButton,
                claimForm
            );

            itemContainer.appendChild(card);

        });

    } catch (error) {

        console.error("Error loading found items:", error);

        itemContainer.textContent =
            "Unable to load found items.";

    }
}


// Create and display item details popup
function showItemDetails(item) {

    let modal = document.getElementById("itemDetailsModal");

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
        "Type: FOUND",
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
loadFoundItems();
