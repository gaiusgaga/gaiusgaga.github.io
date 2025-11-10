const imageFileInput = document.querySelector("#imageFileInput");
const canvas = document.querySelector("#meme");
const topTextInput = document.querySelector("#topTextInput");
const singleTextInput = document.querySelector("#singleTextInput");
const FontTextInput = document.querySelector("#FontTextInput");
const fontSizeLine1Input = document.querySelector("#fontSizeLine1");
const fontSizeLine2Input = document.querySelector("#fontSizeLine2");
const fontSizeLine3Input = document.querySelector("#fontSizeLine3");
const toggleFontSettings = document.querySelector("#toggleFontSettings");
const fontSizeSettings = document.querySelector("#font-size-settings");
const resetFontSizes = document.querySelector("#resetFontSizes");
const fontColorInput = document.querySelector("#fontColor");

let image;
let template;

// Track whether the user has manually changed the font size
let hasManuallyChangedFontSize = [false, false, false];

imageFileInput.addEventListener("change", (e) => {
  const imageDataUrl = URL.createObjectURL(e.target.files[0]);

  image = new Image();
  image.src = imageDataUrl;
  template = new Image();
  template.src = 'dusadas.png'; // Zaktualizowana nazwa szablonu
    
  Promise.all([
    new Promise((resolve) => image.addEventListener("load", resolve, { once: true })),
    new Promise((resolve) => template.addEventListener("load", resolve, { once: true }))
  ])
    .then(() => {
      updateMemeCanvas(
        canvas,
        image,
        topTextInput.value,
        singleTextInput.value,
        FontTextInput ? FontTextInput.value : 17
      );
    })
    .catch((error) => {
      console.error("BÅ‚Ä…d podczas Å‚adowania obrazÃ³w:", error);
    });
});

singleTextInput.addEventListener("input", (e) => {
  const lines = e.target.value.split('\n');
  if (lines.length > 3) {
    e.target.value = lines.slice(0, 3).join('\n');
  }
  updateMemeCanvas(canvas, image, topTextInput.value, e.target.value, FontTextInput ? FontTextInput.value : 17);
});

// Toggle font size settings dropdown
toggleFontSettings.addEventListener("click", () => {
  fontSizeSettings.classList.toggle("active");
});

// Reset font sizes and color to default
resetFontSizes.addEventListener("click", () => {
  fontSizeLine1Input.value = FontTextInput ? FontTextInput.value : 17;
  fontSizeLine2Input.value = FontTextInput ? FontTextInput.value : 17;
  fontSizeLine3Input.value = FontTextInput ? FontTextInput.value : 17;
  fontColorInput.value = "#FFFFFF"; // Reset color to default white
  hasManuallyChangedFontSize = [false, false, false]; // Reset manual change flag
  updateMemeCanvas(canvas, image, topTextInput.value, singleTextInput.value, FontTextInput ? FontTextInput.value : 17);
});

// Add event listeners for font size and color inputs
[fontSizeLine1Input, fontSizeLine2Input, fontSizeLine3Input].forEach((input, index) => {
  input.addEventListener("input", () => {
    hasManuallyChangedFontSize[index] = !!input.value; // Set to true if the user entered a value
    updateMemeCanvas(canvas, image, topTextInput.value, singleTextInput.value, FontTextInput ? FontTextInput.value : 17);
  });
});

fontColorInput.addEventListener("input", () => {
  updateMemeCanvas(canvas, image, topTextInput.value, singleTextInput.value, FontTextInput ? FontTextInput.value : 17);
});

function updateMemeCanvas(canvas, image, topText, singleText, FontText) {
  const ctx = canvas.getContext("2d");
  const width = 1080;
  const height = 1350;
  const imageHeight = 1080;
  const baseFontSize = FontText * 10; // DomyÅ›lny rozmiar czcionki (np. 170 dla FontText = 17)
  const yOffset = 300;
  const maxWidth = width * 0.9;
  const lineSpacing = 150;

  canvas.width = 1080;
  canvas.height = 1350;

  const imgWidth = image.width;
  const imgHeight = image.height;
  let sx, sy, sWidth, sHeight;

  if (imgWidth > imgHeight) {
    sWidth = imgHeight;
    sHeight = imgHeight;
    sx = (imgWidth - sWidth) / 2;
    sy = 0;
  } else {
    sWidth = imgWidth;
    sHeight = imgWidth;
    sx = 0;
    sy = (imgHeight - sHeight) / 2;
  }

  ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, width, imageHeight);
  ctx.drawImage(template, 0, 0, width, height);

  // Set font color based on user selection
  ctx.fillStyle = fontColorInput.value;
  ctx.textAlign = "center";
  ctx.lineJoin = "round";

  // Draw top text without shadow
  ctx.font = `${baseFontSize}px Raleway`;
  ctx.textBaseline = "top";
  ctx.fillText(topText, width / 2, yOffset);

  const lines = singleText.split('\n').slice(0, 3);
  const customFontSizes = [
    (parseInt(fontSizeLine1Input.value) || FontText) * 10,
    (parseInt(fontSizeLine2Input.value) || FontText) * 10,
    (parseInt(fontSizeLine3Input.value) || FontText) * 10
  ];

  const positions = [];
  const baseY = height - 50 - ((lines.length - 1) * lineSpacing);
  for (let i = 0; i < lines.length; i++) {
    positions.push(baseY + (i * lineSpacing));
  }

  // Track the actual font sizes after auto-scaling to update input fields
  const actualFontSizes = new Array(lines.length).fill(0);

  // Draw each line with its own font size, respecting manual override
  for (let i = 0; i < lines.length; i++) {
    const text = lines[i].toUpperCase();
    let fontSize = customFontSizes[i];
    ctx.font = `${fontSize}px Raleway`;
    ctx.textBaseline = "bottom";
    const yPos = positions[i];

    // Apply auto-scaling only if the user hasn't manually set a font size
    if (!hasManuallyChangedFontSize[i]) {
      let textWidth = ctx.measureText(text).width;
      while (textWidth > maxWidth && fontSize > 50) {
        fontSize -= 10;
        ctx.font = `${fontSize}px Raleway`;
        textWidth = ctx.measureText(text).width;
      }
    }

    actualFontSizes[i] = fontSize / 10; // Store the actual font size (divided by 10 for input field)

    ctx.fillText(text, width / 2, yPos);
  }

  // Update input fields with actual font sizes if they haven't been manually changed
  for (let i = 0; i < lines.length; i++) {
    if (!hasManuallyChangedFontSize[i]) {
      if (i === 0) fontSizeLine1Input.value = actualFontSizes[i];
      if (i === 1) fontSizeLine2Input.value = actualFontSizes[i];
      if (i === 2) fontSizeLine3Input.value = actualFontSizes[i];
    }
  }
}

function zapisz() {
  var canvas = document.getElementById("meme");
  var img = canvas.toDataURL("image/png");
  var download = document.createElement('a');
  download.href = img;
  download.download = 'underway.png';
  download.click();
}