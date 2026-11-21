
const reportForm = document.getElementById("reportForm");

const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");


// =====================================
// 1. IMAGE PREVIEW
// =====================================

imageInput.addEventListener("change", function () {

    const file = imageInput.files[0];

    // Clear previous preview
    imagePreview.onload = null;
    imagePreview.onerror = null;
    imagePreview.removeAttribute("src");
    imagePreview.style.display = "none";

    if (!file) {
        return;
    }

    // Validate image type
    if (!file.type.startsWith("image/")) {

        alert("Please select a valid image!");

        imageInput.value = "";
        return;
    }

    // Validate image size (maximum 5 MB)
    if (file.size > 5 * 1024 * 1024) {

        alert("Image size must be less than 5 MB!");

        imageInput.value = "";
        return;
    }

    // Create temporary URL for preview
    const imageURL = URL.createObjectURL(file);

    imagePreview.onload = function () {

        imagePreview.style.display = "block";

    };

    imagePreview.onerror = function () {

        alert("Unable to display the selected image. Please try another image.");

        imagePreview.style.display = "none";

    };

    imagePreview.src = imageURL;

});


// =====================================
// 2. FORM SUBMISSION
// =====================================

reportForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const formData = new FormData();

    // Add item details
    formData.append(
        "itemType",
        document.getElementById("type").value
    );

    formData.append(
        "itemName",
        document.getElementById("itemName").value.trim()
    );

    formData.append(
        "category",
        document.getElementById("category").value
    );

    formData.append(
        "description",
        document.getElementById("description").value.trim()
    );

    formData.append(
        "location",
        document.getElementById("location").value.trim()
    );

    formData.append(
        "date",
        document.getElementById("date").value
    );


    // Add image if selected
    if (imageInput.files.length > 0) {

        formData.append(
            "image",
            imageInput.files[0]
        );

    }


    // Disable submit button
    const submitBtn = document.getElementById("submitBtn");

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";


    try {

        // Send request to backend
        const response = await fetch("/api/items", {

            method: "POST",
            body: formData

        });

        const result = await response.json();


        if (response.ok) {

            alert("Item reported successfully!");

            console.log("Saved item:", result.item);

            // Reset form
            reportForm.reset();

            // Remove previous preview event handlers
            imagePreview.onload = null;
            imagePreview.onerror = null;

            // Remove preview image safely
            imagePreview.removeAttribute("src");
            imagePreview.style.display = "none";

        } else {

            alert(result.message || "Failed to report item.");

            console.error("Server error:", result);

        }

    } catch (error) {

        console.error("Error submitting item:", error);

        alert("Could not connect to the server. Please try again.");

    } finally {

        // Enable submit button again
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Report";

    }

});
