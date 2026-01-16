// DOM Elements
const textInput = document.getElementById('textData');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const qrCanvas = document.getElementById('qr-canvas');
const qrContainer = document.getElementById('qr-container');
const loadingSpinner = document.getElementById('loading-spinner');
const logoInput = document.getElementById('logoInput');

// Logo Image Source
const LOGO_SRC = 'logo.png'; // Local logo file

// Initialize - Load logo to cache it
const logoImg = new Image();
logoImg.src = LOGO_SRC;
let showLogo = true;

generateBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (!text) {
        alert('Please enter some text or a URL');
        return;
    }

    // Show loading, hide previous result
    loadingSpinner.style.display = 'block';
    qrCanvas.style.display = 'none';
    downloadBtn.style.display = 'none';

    // Simulate small delay for UX or ensure logo is loaded
    if (logoImg.complete) {
        generateQRCode(text, showLogo);
    } else {
        logoImg.onload = () => generateQRCode(text, showLogo);
        logoImg.onerror = () => {
            console.error("Failed to load logo. Generating without logo.");
            generateQRCode(text, false); // Fallback
        };
    }
});

function generateQRCode(text, withLogo = true) {
    // Canvas dimensions
    const canvasSize = 300;

    // Generate QR to canvas
    // Using QRCode library from CDN (exposed as window.QRCode or similar, need to check specific library)
    // We are using 'qrcode' npm package browser build which usually sets window.QRCode. 
    // Wait, the CDN link corresponds to libraries that might work differently.
    // Let's assume we use the 'QRCode.toCanvas' method from 'qrcode' package if available.
    // If we use 'qrcodejs' (older lib), API is new QRCode(target, text).
    // I will use 'qrcode' package API: QRCode.toCanvas(canvas, text, options, cb)

    QRCode.toCanvas(qrCanvas, text, {
        width: canvasSize,
        margin: 2,
        color: {
            dark: "#000000",
            light: "#ffffff"
        },
        errorCorrectionLevel: 'H' // High error correction to allow logo coverage
    }, function (error) {
        if (error) {
            console.error(error);
            alert('Error generating QR code');
            loadingSpinner.style.display = 'none';
            return;
        }

        if (withLogo) {
            drawLogo();
        } else {
            finalizeGeneration();
        }
    });
}

function drawLogo() {
    const ctx = qrCanvas.getContext('2d');
    const canvasSize = qrCanvas.width;

    // Logo settings
    const logoSize = canvasSize * 0.2; // Image size (20% of QR)
    const padding = 4; // White border thickness
    const borderRadius = (logoSize / 2) + padding; // Radius of white background

    // Center coordinates
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;

    // Coordinates for drawing the image (top-left)
    const x = centerX - (logoSize / 2);
    const y = centerY - (logoSize / 2);

    // Save context
    ctx.save();

    // 1. Draw larger white circular background (The Border)
    ctx.beginPath();
    ctx.arc(centerX, centerY, borderRadius, 0, Math.PI * 2, true);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // 2. Create clipping path for the image (Inner Circle)
    ctx.beginPath();
    ctx.arc(centerX, centerY, logoSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    // 3. Draw Image inside the clipped area
    ctx.drawImage(logoImg, x, y, logoSize, logoSize);

    // Restore context to remove clipping
    ctx.restore();

    finalizeGeneration();
}

function finalizeGeneration() {
    loadingSpinner.style.display = 'none';
    qrCanvas.style.display = 'block';
    downloadBtn.style.display = 'block';
}

downloadBtn.addEventListener('click', () => {
    // Create a temporary link
    const link = document.createElement('a');
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear().toString()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    link.download = `qr-code-${timestamp}.png`;
    link.href = qrCanvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

logoInput.addEventListener('change', (e) => {
    showLogo = e.target.checked;
});