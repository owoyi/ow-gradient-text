const input = document.getElementById('inputText');
const lengthInfo = document.getElementById('lengthInfo');
const warning = document.getElementById('warning');
const copyBtn = document.getElementById('copyBtn');
const output = document.getElementById('output');
const preview = document.getElementById('preview');
const middleColorsDiv = document.getElementById('middleColors');

input.addEventListener('input', updateLength);
updateLength();

function updateLength() {
	const len = input.value.length;
	lengthInfo.textContent = `${len} / 15`;
  lengthInfo.style.color = "#555";
  warning.style.display = 'none';

  if (len === 15) {
    lengthInfo.style.color = "#ff9800";
  } else if (len > 15) {
    lengthInfo.style.color = "#e74c3c";
  }
	warning.style.display = len > 15 ? 'inline' : 'none';
}

function addMiddleColor(value = '#00FF00') {
	const wrapper = document.createElement('div');
	wrapper.className = 'middleColorItem';
	wrapper.draggable = true;

	const colorInput = document.createElement('input');
	colorInput.type = 'color';
	colorInput.className = 'gradientColor';
	colorInput.value = value;

	const removeBtn = document.createElement('button');
	removeBtn.className = 'removeBtn';
	removeBtn.textContent = '❌';
	removeBtn.onclick = () => wrapper.remove();

	wrapper.appendChild(colorInput);
	wrapper.appendChild(removeBtn);
	middleColorsDiv.appendChild(wrapper);

	addDragEvents(wrapper);
}

function addDragEvents(element) {
	element.addEventListener('dragstart', (e) => {
	  e.dataTransfer.setData('text/plain', null);
	  element.classList.add('dragging');
	});
	element.addEventListener('dragend', () => {
	  element.classList.remove('dragging');
	});
	element.addEventListener('dragover', (e) => e.preventDefault());
	element.addEventListener('drop', (e) => {
	  e.preventDefault();
	  const dragging = document.querySelector('.dragging');
	  if (dragging && dragging !== element) {
		  middleColorsDiv.insertBefore(dragging, element);
	  }
	});
}

function hexToRgb(hex) {
	hex = hex.replace('#', '');
	return [
	  parseInt(hex.substring(0, 2), 16),
	  parseInt(hex.substring(2, 4), 16),
	  parseInt(hex.substring(4, 6), 16)
	];
}

function rgbToHex([r, g, b]) {
	return (
	  r.toString(16).padStart(2, '0') +
	  g.toString(16).padStart(2, '0') +
	  b.toString(16).padStart(2, '0')
	).toUpperCase();
}

function interpolateColors(colors, steps) {
	const result = [];
	const segments = colors.length - 1;
	for (let i = 0; i < steps; i++) {
		const t = i / (steps - 1); 
		const seg = Math.min(Math.floor(t * segments), segments - 1);
		const localT = (t - seg / segments) * segments;
		const [r1, g1, b1] = colors[seg];
		const [r2, g2, b2] = colors[seg + 1];
		const r = Math.round(r1 + (r2 - r1) * localT);
		const g = Math.round(g1 + (g2 - g1) * localT);
		const b = Math.round(b1 + (b2 - b1) * localT);
		result.push([r, g, b]);
	}
	return result;
}

function convertText() {
	const text = input.value;
	const effectiveLength = text.replace(/ /g, '').length;

	const startColor = document.getElementById('startColor').value;
	const endColor = document.getElementById('endColor').value;
	const middleColors = Array.from(
		middleColorsDiv.querySelectorAll('input.gradientColor')
	).map(el => el.value);

	const hexColors = [startColor, ...middleColors, endColor];
	const colorList = hexColors.map(hex => hexToRgb(hex));
	if (colorList.length < 2) return;

	const gradient = interpolateColors(colorList, effectiveLength);

	let result = '';
	let previewHTML = '';
	let colorIndex = 0;

	for (let i = 0; i < text.length; i++) {
		const char = text[i];
		if (char === ' ') {
			result += ' ';
			previewHTML += ' ';
		} else {
			const [r, g, b] = gradient[colorIndex];
			const hex = rgbToHex([r, g, b]);
			result += `<FG${hex}FF>${char}`;
			previewHTML += `<span style="color:#${hex}">${char}</span>`;
			colorIndex++;
		}
	}

	output.textContent = result;
	preview.innerHTML = previewHTML;
}


function copyOutput() {
	const text = output.textContent;
	navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = "✅ 복사됨!";
    setTimeout(() => {
      copyBtn.textContent = "📋 복사";
    }, 1500);
	});
}