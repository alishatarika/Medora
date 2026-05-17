let html5QrCode;

function openScannerModal() {
    document.getElementById("scannerModal").style.display = "flex";

    html5QrCode = new Html5Qrcode("qr-reader");

    const qrConfig = { fps: 10, qrbox: 250 };
    html5QrCode.start(
        { facingMode: "environment" },
        qrConfig,
        qrCodeMessage => {
            document.getElementById("qr-result").innerText = qrCodeMessage;
            // Optionally stop scanning after first scan
            html5QrCode.stop().then(() => {
                console.log("Scanner stopped after scan.");
            }).catch(err => console.error(err));
        },
        error => {
            console.warn(QR error: ${error});
        }
    ).catch(err => {
        console.error("Unable to start scanner:", err);
    });
}

function closeScannerModal() {
    document.getElementById("scannerModal").style.display = "none";
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            html5QrCode.clear();
        }).catch(err => {
            console.error("Stop failed:", err);
        });
    }
}

// ========== SOS SYSTEM ==========

function triggerSOS() {
    alert("🚨 Sending SOS alert to top 3 contacts...\nFetching nearby ambulances...");
    
    // Simulate contact messaging (replace with real API in future)
    const topContacts = ["+91-9999999999", "+91-8888888888", "+91-7777777777"];
    topContacts.forEach(contact => {
        console.log(📩 Emergency SMS sent to: ${contact});
    });

    // Animate a flashing effect
    const sosBlock = document.querySelector(".feature-block:nth-child(2)");
    sosBlock.classList.add("sos-flash");

    setTimeout(() => {
        sosBlock.classList.remove("sos-flash");

        // Open Google Maps to search nearby ambulance
        window.open("https://www.google.com/maps/search/ambulance+near+me", "_blank");
    }, 3000);
}

// ========== QR SCANNER BLOCK REDIRECTION ==========

// Function to handle the click on the QR Scanner block and redirect to the medora_scan.html page
function redirectToScanner() {
    window.location.href = "medora_scan.html";  // Link the QR Scanner block to medora_scan.html
}

// Assign the click event to the QR Scanner block
document.querySelector(".feature-block:nth-child(1)").addEventListener("click", redirectToScanner);

// ========== SOS BLOCK REDIRECTION ==========

// Function to handle the click on the SOS block and redirect to the medora_sos.html page
function redirectToSOSPage() {
    window.location.href = "medora_sos.html";  // Link the SOS block to medora_sos.html
}

// Assign the click event to the SOS block
document.querySelector(".feature-block:nth-child(2)").addEventListener("click", redirectToSOSPage);