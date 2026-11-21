
document.addEventListener("DOMContentLoaded", function () {

    const adminInfo = document.getElementById("adminInfo");
    const logoutBtn = document.getElementById("logoutBtn");


    // Check whether the logged-in user is an admin
    async function checkAdmin() {

        try {

            const response = await fetch("/api/auth/me");
            const data = await response.json();

            if (!response.ok) {
                window.location.href = "login.html";
                return false;
            }

            if (data.user.role !== "admin") {

                adminInfo.textContent = "Access denied. Admin only.";

                setTimeout(function () {
                    window.location.href = "dashboard.html";
                }, 2000);

                return false;
            }

            adminInfo.textContent =
                "Welcome, " + data.user.name + " (Administrator)";

            return true;

        } catch (error) {

            console.error("Admin check error:", error);
            adminInfo.textContent = "Unable to verify admin access.";

            return false;
        }
    }


    // Load dashboard statistics
    async function loadStats() {

        try {

            const response = await fetch("/api/admin/stats");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            document.getElementById("totalItems").textContent =
                data.stats.totalItems;

            document.getElementById("lostItems").textContent =
                data.stats.lostItems;

            document.getElementById("foundItems").textContent =
                data.stats.foundItems;

            document.getElementById("pendingClaims").textContent =
                data.stats.pendingClaims;

        } catch (error) {

            console.error("Statistics error:", error);
            document.getElementById("totalItems").textContent = "Error";
        }
    }


    // Load all reported items
    async function loadItems() {

        const container = document.getElementById("adminItems");

        try {

            const response = await fetch("/api/admin/items");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            container.innerHTML = "";

            if (data.items.length === 0) {
                container.textContent = "No items reported yet.";
                return;
            }

            data.items.forEach(function (item) {

                const card = document.createElement("div");
                card.className = "item-card";

                const name = document.createElement("h3");
                name.textContent = item.itemName;

                const type = document.createElement("p");
                type.textContent = "Type: " + item.itemType;

                const category = document.createElement("p");
                category.textContent = "Category: " + item.category;

                const description = document.createElement("p");
                description.textContent = "Description: " + item.description;

                const location = document.createElement("p");
                location.textContent = "Location: " + item.location;

                const reporter = document.createElement("p");
                reporter.textContent =
                    "Reported by: " +
                    (item.reportedBy?.name || "Unknown");

                const currentStatus = item.status || "active";

                const statusText = document.createElement("p");
                statusText.textContent =
                    "Current Status: " + currentStatus;

                // Status dropdown
                const statusLabel = document.createElement("label");
                statusLabel.textContent = "Change Item Status: ";

                const statusSelect = document.createElement("select");

                const statuses = [
                    { value: "active", text: "Active" },
                    { value: "returned", text: "Returned" },
                    { value: "resolved", text: "Resolved" }
                ];

                statuses.forEach(function (status) {

                    const option = document.createElement("option");
                    option.value = status.value;
                    option.textContent = status.text;

                    if (status.value === currentStatus) {
                        option.selected = true;
                    }

                    statusSelect.appendChild(option);
                });

                // Update status button
                const updateBtn = document.createElement("button");
                updateBtn.textContent = "Update Status";

                updateBtn.addEventListener("click", function () {

                    updateItemStatus(
                        item._id,
                        statusSelect.value
                    );

                });

                // Delete item button
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Delete Item";
                deleteBtn.style.backgroundColor = "#dc3545";
                deleteBtn.style.color = "white";
                deleteBtn.style.marginLeft = "10px";

                deleteBtn.addEventListener("click", function () {

                    deleteItem(item._id, item.itemName);

                });

                card.append(
                    name,
                    type,
                    category,
                    description,
                    location,
                    reporter,
                    statusText,
                    statusLabel,
                    statusSelect,
                    updateBtn,
                    deleteBtn
                );

                if (item.image) {

                    const image = document.createElement("img");
                    image.src = item.image;
                    image.alt = item.itemName;
                    image.style.width = "150px";

                    card.appendChild(image);
                }

                container.appendChild(card);

            });

        } catch (error) {

            console.error("Items loading error:", error);
            container.textContent = "Unable to load reported items.";
        }
    }


    // Update reported item status
    async function updateItemStatus(itemId, newStatus) {

        try {

            const response = await fetch(
                "/api/admin/items/" +
                encodeURIComponent(itemId) +
                "/status",
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            alert("Item status updated successfully!");

            await loadItems();

        } catch (error) {

            console.error("Item status update error:", error);
            alert(error.message || "Unable to update item status.");
        }
    }


    // Delete reported item
    async function deleteItem(itemId, itemName) {

        const confirmDelete = confirm(
            "Are you sure you want to delete '" +
            itemName +
            "'?\n\nThis will also delete all claims associated with this item."
        );

        if (!confirmDelete) {
            return;
        }

        try {

            const response = await fetch(
                "/api/admin/items/" + encodeURIComponent(itemId),
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            alert("Item deleted successfully!");

            await Promise.all([
                loadItems(),
                loadStats(),
                loadClaims()
            ]);

        } catch (error) {

            console.error("Delete item error:", error);

            alert(error.message || "Unable to delete item.");
        }
    }


    // Load and manage student claims
    async function loadClaims() {

        const container = document.getElementById("adminClaims");

        try {

            const response = await fetch("/api/admin/claims");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            container.innerHTML = "";

            if (data.claims.length === 0) {
                container.textContent = "No claims submitted yet.";
                return;
            }

            data.claims.forEach(function (claim) {

                const card = document.createElement("div");
                card.className = "item-card";

                const itemName = document.createElement("h3");
                itemName.textContent =
                    "Item: " + (claim.item?.itemName || "Unknown item");

                const student = document.createElement("p");
                student.textContent =
                    "Claimed by: " +
                    (claim.claimedBy?.name || "Unknown student");

                const email = document.createElement("p");
                email.textContent =
                    "Email: " + (claim.claimedBy?.email || "Not available");

                const description = document.createElement("p");
                description.textContent =
                    "Claim description: " + claim.claimDescription;

                const status = document.createElement("p");
                status.textContent = "Status: " + claim.status;

                card.append(itemName, student, email, description, status);

                // Show buttons only for pending claims
                if (claim.status === "pending") {

                    const approveBtn = document.createElement("button");
                    approveBtn.textContent = "Approve";

                    approveBtn.addEventListener("click", function () {
                        updateClaimStatus(claim._id, "approved");
                    });

                    const rejectBtn = document.createElement("button");
                    rejectBtn.textContent = "Reject";

                    rejectBtn.addEventListener("click", function () {
                        updateClaimStatus(claim._id, "rejected");
                    });

                    card.append(approveBtn, rejectBtn);
                }

                container.appendChild(card);

            });

        } catch (error) {

            console.error("Claims loading error:", error);
            container.textContent = "Unable to load student claims.";
        }
    }


    // Approve or reject a claim
    async function updateClaimStatus(claimId, newStatus) {

        try {

            const response = await fetch(
                "/api/admin/claims/" + encodeURIComponent(claimId),
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            alert("Claim " + newStatus + " successfully!");

            await loadClaims();
            await loadStats();

        } catch (error) {

            console.error("Claim update error:", error);
            alert("Unable to update claim status.");
        }
    }


    // Admin logout
    logoutBtn.addEventListener("click", async function () {

        try {

            await fetch("/api/auth/logout", {
                method: "POST"
            });

            window.location.href = "login.html";

        } catch (error) {

            console.error("Logout error:", error);
        }
    });


    // Start admin dashboard
    async function initializeAdminDashboard() {

        const isAdmin = await checkAdmin();

        if (!isAdmin) {
            return;
        }

        await Promise.all([
            loadStats(),
            loadItems(),
            loadClaims()
        ]);
    }

    initializeAdminDashboard();

});
