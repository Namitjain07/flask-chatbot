window.onload = function () {
    Particles.init({
        selector: '.background',
        maxParticles: 30,
        connectParticles: true,
        speed: 2,
        minDistance: 250,
        sizeVariations: 4,
        color: 'd9d9d9',
    });
};

const uploadContainer = document.getElementById("uploadContainer");
const pdfFileInput = document.getElementById("pdfFile");
const browseButton = document.getElementById("browseButton");
const pdfViewer = document.getElementById("pdfViewer");
const loading = document.getElementById("loading");
const floatingMenu = document.querySelector(".floating_menu");
let pdfDoc = null;

// Ensure floating menu is hidden initially
floatingMenu.style.display = "none";

// Trigger file input on button click
browseButton.addEventListener("click", () => {
    pdfFileInput.click();
});

// Handle drag-and-drop upload
uploadContainer.addEventListener("dragover", (event) => {
    event.preventDefault();
    uploadContainer.style.background = "rgba(255, 255, 255, 0.3)";
});

uploadContainer.addEventListener("dragleave", () => {
    uploadContainer.style.background = "rgba(255, 255, 255, 0.1)";
});

uploadContainer.addEventListener("drop", (event) => {
    event.preventDefault();
    uploadContainer.style.background = "rgba(255, 255, 255, 0.1)";
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        loadPDF(files[0]);
    }
});

// Handle file input change
pdfFileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        loadPDF(file);
    }
});

// Load and render PDF
function loadPDF(file) {
    const reader = new FileReader();
    loading.style.display = "flex"; // Show loading spinner

    reader.onload = function (e) {
        const pdfData = new Uint8Array(e.target.result);

        // Use PDF.js to load and render the PDF
        pdfjsLib.getDocument(pdfData).promise.then(function (pdf) {
            pdfDoc = pdf;
            pdfViewer.innerHTML = ""; // Clear previous PDF pages
            renderAllPages(pdf);
        }).catch((error) => {
            alert("Error loading PDF: " + error.message);
            loading.style.display = "none"; // Hide spinner
        });
    };

    reader.readAsArrayBuffer(file);
}

// Render all pages of the PDF
function renderAllPages(pdf) {
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        pdf.getPage(pageNum).then(function (page) {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const viewport = page.getViewport({ scale: 1.5 });
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            page.render({ canvasContext: ctx, viewport: viewport }).promise.then(() => {
                pdfViewer.appendChild(canvas);

                // Show floating menu after the first page is rendered
                if (pageNum === 1) {
                    floatingMenu.style.display = "flex"; // Make floating menu visible
                    loading.style.display = "none"; // Hide loading spinner
                    uploadContainer.style.display = "none"; // Hide drag-and-drop box
                    pdfViewer.style.display = "block"; // Show PDF viewer
                }
            });
        });
    }
}

var menu = document.querySelector("#FloatMenu");
var menuIcon = document.querySelector(".menu");
var submenu = document.querySelector(".sub_menu");
var isDragging = false;
var offsetX, offsetY;
var margin = 85;

menuIcon.onclick = function () {
    menu.classList.toggle("active");

    var rect = menu.getBoundingClientRect();
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var submenuWidth = submenu.offsetWidth;
    var submenuHeight = submenu.offsetHeight;

    if (rect.left + rect.width / 2 > windowWidth / 2) {
        submenu.style.left = 'auto';
        submenu.style.right = '100%'; 
    } else {
        submenu.style.left = '100%';
        submenu.style.right = 'auto';
    }

    if (submenu.offsetLeft + submenu.offsetWidth > windowWidth) {
        submenu.style.left = 'auto';
        submenu.style.right = '100%';
    }
};

menu.addEventListener('mousedown', function (e) {
    isDragging = true;
    offsetX = e.clientX - menu.offsetLeft;
    offsetY = e.clientY - menu.offsetTop;
    document.body.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', function (e) {
    if (isDragging) {
        var newLeft = e.clientX - offsetX;
        var newTop = e.clientY - offsetY;
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;

        if (newLeft < margin) {
            newLeft = margin;
        } else if (newLeft > windowWidth - menu.offsetWidth - margin) {
            newLeft = windowWidth - menu.offsetWidth - margin;
        }

        if (newTop < margin) {
            newTop = margin;
        } else if (newTop > windowHeight - menu.offsetHeight - margin) {
            newTop = windowHeight - menu.offsetHeight - margin;
        }

        menu.style.left = newLeft + 'px';
        menu.style.top = newTop + 'px';
    }
});

document.getElementById("pdfFile").addEventListener("change", function () {
    // Show the "Upload Again" button when a PDF is selected
    document.getElementById("upload-again-button").style.display = "block";
    document.getElementById("summary-view").style.display = "block";
});

document.getElementById("upload-again-button").addEventListener("click", function () {
    location.reload(); // Reload the page
});

document.getElementById("view-toggle-button").addEventListener("click", function () {
    const button = document.getElementById("view-toggle-button");
    button.classList.toggle("active");
    toggleSideMenu();
});

document.addEventListener('mouseup', function () {
    isDragging = false;
    document.body.style.cursor = 'default';
});

document.addEventListener("keydown", function (event) {
    if (event.key.toUpperCase() === "U") {
        toggleSideMenu();
    }
});

function toggleSideMenu() {
    const summaryView = document.getElementById("summary-view");
    const pdfViewer = document.getElementById("pdfViewer");

    if (summaryView.classList.contains("open")) {
        // Close menu
        summaryView.classList.remove("open");
        pdfViewer.classList.remove("shift-left");
    } else {
        // Open menu
        summaryView.classList.add("open");
        pdfViewer.classList.add("shift-left");
    }
}

function openSideMenu() {
    const summaryView = document.getElementById("summary-view");
    const pdfViewer = document.getElementById("pdfViewer");

        // Open menu
    summaryView.classList.add("open");
    pdfViewer.classList.add("shift-left");
}

document.getElementById("summarize-button").addEventListener("click", async function () {
    const summaryView = document.getElementById("summary-view");

    if (!pdfDoc) {
        alert("No PDF loaded.");
        return;
    }

    const fileInput = document.getElementById("pdfFile");
    const file = fileInput.files[0];

    if (!file) {
        alert("No PDF file selected.");
        return;
    }

    // Read PDF file as binary
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async function () {
        const pdfData = new Uint8Array(reader.result);

        // Show loading text
        openSideMenu();

        summaryView.innerHTML = "<p>Summarizing... ⏳</p>";

        try {
            const response = await fetch("/summarize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/pdf",
                },
                body: pdfData,
            });

            if (!response.ok) {
                throw new Error("Error fetching summary");
            }

            const data = await response.json();

            // Update the summary menu with the response
            summaryView.innerHTML = `<p>${data.summary}</p>`;



        } catch (error) {
            summaryView.innerHTML = "<p>Error summarizing PDF.</p>";
            console.error("Error:", error);
        }
    };
});

document.getElementById("translate-button").addEventListener("click", async function () {
    const summaryView = document.getElementById("summary-view");

    if (!pdfDoc) {
        alert("No PDF loaded.");
        return;
    }

    const fileInput = document.getElementById("pdfFile");
    const file = fileInput.files[0];

    if (!file) {
        alert("No PDF file selected.");
        return;
    }

    // Read PDF file as binary
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async function () {
        const pdfData = new Uint8Array(reader.result);

        // Show loading text
        openSideMenu();
        
        summaryView.innerHTML = "<p>Translating... ⏳</p>";

        try {
            const response = await fetch("/translate_pdf", {
                method: "POST",
                headers: {
                    "Content-Type": "application/pdf",
                },
                body: pdfData,
            });

            if (!response.ok) {
                throw new Error("Error fetching translation");
            }

            const data = await response.json();

            // Update the summary menu with the response
            summaryView.innerHTML = `<p>${data.summary}</p>`;



        } catch (error) {
            summaryView.innerHTML = "<p>Error translating</p>";
            console.error("Error:", error);
        }
    };
});
