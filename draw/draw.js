
"use strict";

function onLine(x0, y0, x1, y1) {
	// apply a function f to all points on the line from (x0,y0) to (x1,y1)
	return (f) => {
		// Bresenham's line algorithm
		const dx = Math.abs(x1 - x0);
		const sx = x0 < x1 ? 1 : -1;
		const dy = -Math.abs(y1 - y0);
		const sy = y0 < y1 ? 1 : -1;
		let error = dx + dy
		
		for (let i = 0; i < 1000; i++) {
			f(x0,y0);
			let e2 = 2 * error;
			if (e2 >= dy) {
				if (x0 == x1) break;
				error = error + dy;
				x0 = x0 + sx;
			}
			if (e2 <= dx) {
				if (y0 == y1) break;
				error = error + dx;
				y0 = y0 + sy;
			}
		}
	};
}

let progress = 0;

document.addEventListener("DOMContentLoaded", () => {
	
	// if there's a foreground-canvases element, create page-covering canvases inside it
	// using document.body.scrollHeight to determine how many
	const foreground = document.getElementById("foreground-canvases");
	if (foreground) {
		const halfpageLeft = foreground.appendChild(document.createElement("div"));
		halfpageLeft.classList.add("halfpage");
		halfpageLeft.classList.add("left");
		
		const halfpageRight = foreground.appendChild(document.createElement("div"));
		halfpageRight.classList.add("halfpage");
		halfpageRight.classList.add("right");
		
		const scrollHeight = document.body.scrollHeight;

		
		let c = foreground.appendChild(document.createElement("canvas"));
		c.classList.add("drawable", "erasable", "pickable");
		c.width = 1600;
		c.height = scrollHeight;
		c.style.left = "0px";
		c.style.top = "0px";
		
		// for (let i = 0; i < Math.ceil(scrollHeight/1000); i++) {
			// let cL = halfpageLeft.appendChild(document.createElement("canvas"));
			// cL.classList.add("drawable");
			// cL.classList.add("erasable");
			// cL.classList.add("pickable");
			// cL.width = "1000";
			// cL.height = "1000";
			// cL.style.left = "0px";
			// cL.style.top = i * 1000 + "px";
			
			// let cR = halfpageRight.appendChild(document.createElement("canvas"));
			// cR.classList.add("drawable");
			// cR.classList.add("erasable");
			// cR.classList.add("pickable");
			// cR.width = "1000";
			// cR.height = "1000";
			// cR.style.right = "0px";
			// cR.style.top = i * 1000 + "px";
			
			
			/*
			let oL = halfpageLeft.appendChild(document.createElement("div"));
			oL.classList.add("overlay");
			oL.style.top = i * 1000 + "px";
			
			let oR = halfpageRight.appendChild(document.createElement("div"));
			oR.classList.add("overlay");
			oR.style.top = i * 1000 + "px";*/
			
		// }
	}
	
	const height = document.body.scrollHeight + 20;
	// get elements
	// we sort the canvases by z-index so that the eyedropper works
	const root = document.querySelector(":root");
	const colorInput = document.getElementById("color-input");
	const canvases = Array.from(document.querySelectorAll("canvas.drawable, canvas.erasable, canvas.pickable")).sort(function(a,b) {
		return window.getComputedStyle(a).zIndex - window.getComputedStyle(b).zIndex
	});
	const imageCanvases = document.querySelectorAll("canvas.image");
	
	const l = document.getElementById("bg-left");
	const r = document.getElementById("bg-right");

	if (l) {
		// stupid hack to get rid of the gap at the bottom since I don't know where it comes from
		l.style.height = (height - 20) + "px";
		r.style.height = (height - 20) + "px";
	}
	
	let hidden = document.querySelectorAll(".hidden");
	// load image canvases
	imageCanvases.forEach((canvas) => {
		const img = new Image()
		const scale = canvas.dataset.scale ? parseInt(canvas.dataset.scale) : 1;
		//img.crossOrigin = "anonymous"; // we might need this i'm not sure
		img.src = canvas.dataset.src;
		const ctx = canvas.getContext("2d");
		ctx.imageSmoothingEnabled = false;
		img.addEventListener("load", () => {
			canvas.width = img.width * scale;
			if (canvas.classList.contains("vtile")) {
				canvas.height = height;
				for (let y = 0; y < height; y += img.height * scale) {
					ctx.drawImage(img, 0, y);
				}
			} else {
				canvas.height = img.height * scale;
				ctx.imageSmoothingEnabled = false;
				ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale);
			}
		});
	});
	
	// set --draw-color depending on the color input
	root.style.setProperty("--draw-color", colorInput.value);
	colorInput.addEventListener("change", (event) => {
		root.style.setProperty("--draw-color", event.target.value);
	});
	
	// track the mouse
	let pos = {x: 0, y: 0};
	let held = false;
	
	// keep track of whether any tool is selected
	let anyToolSelected = false;
	
	// when a tool is clicked, set it and only it to have the "selected" class
	// and disable userselect
	// if it was already selected, instead deselect it
	document.querySelectorAll("button.tool").forEach((element) => {
		element.addEventListener("click", () => {
			if (element.classList.contains("selected")) {
				element.classList.remove("selected");
				root.style.setProperty("user-select", "inherit");
				root.style.setProperty("-webkit-user-select", "inherit");
				anyToolSelected = false;
			} else {
				document.querySelectorAll("button.tool").forEach((element) => {
					element.classList.remove("selected");
				});
				element.classList.add("selected");
				root.style.setProperty("user-select", "none");
				root.style.setProperty("-webkit-user-select", "none");
				anyToolSelected = true;
			}
		});
	});
	
	// initialize tool-dependent drawing function
	let drawSegment = (x0, y0, x1, y1, ctx) => {};
	
	// update tool-dependent drawing function when a new tool is selected
	document.getElementById("eyedropper-button").addEventListener("click", () => {
		drawSegment = (x0, y0, x1, y1, ctx) => {
			if (ctx.canvas.classList.contains("pickable")) {
				const data = ctx.getImageData(x1, y1, 1, 1).data;
				
				if (data[3] !== 0) {
					const dataColor = `rgb(${data[0]} ${data[1]} ${data[2]} / ${data[3] / 255})`
					root.style.setProperty("--draw-color", dataColor);
				}
			}
		};
	});
	document.getElementById("eraser-button").addEventListener("click", () => {
		drawSegment = (x0, y0, x1, y1, ctx) => {
			if (ctx.canvas.classList.contains("erasable")) {
				onLine(x0, y0, x1, y1)((x, y) => {
					ctx.clearRect(x - 6, y - 6, 13, 13);
				});
			}
		};
	});
	document.getElementById("pencil-button").addEventListener("click", () => {
		drawSegment = (x0, y0, x1, y1, ctx) => {
			if (ctx.canvas.classList.contains("drawable")) {
				ctx.fillStyle = root.style.getPropertyValue("--draw-color");
				onLine(x0, y0, x1, y1)((x, y) => {
					ctx.fillRect(x, y, 1, 1);
				});
			}
		};
	});
	document.getElementById("brush-button").addEventListener("click", () => {
		drawSegment = (x0, y0, x1, y1, ctx) => {
			if (ctx.canvas.classList.contains("drawable")) {
				ctx.fillStyle = root.style.getPropertyValue("--draw-color");
				
				onLine(x0, y0, x1, y1)(brush(ctx));
			}
		};
	});
	
	// start with the brush tool selected
	// DEBUG ██████████████████ document.getElementById("brush-button").dispatchEvent(new Event("click"));
	
	// when a brush option is clicked, set it and only it to have the "selected" class
	document.querySelectorAll("button.brush").forEach((element) => {
		element.addEventListener("click", () => {
			document.querySelectorAll("button.brush").forEach((element) => {
				element.classList.remove("selected");
			});
			element.classList.add("selected");
		});
	});
	
	// initialize brush-dependent drawing function
	let brush;
	
	// update brush-dependent drawing function when a new brush is selected
	document.getElementById("brush-large-circle").addEventListener("click", () => {
		brush = (ctx) => (x, y) => {
			ctx.fillRect(x - 2, y - 4, 5, 9);
			ctx.fillRect(x - 4, y - 2, 9, 5);
			ctx.fillRect(x - 3, y - 3, 7, 7);
		};
	});
	document.getElementById("brush-small-circle").addEventListener("click", () => {
		brush = (ctx) => (x, y) => {
			ctx.fillRect(x - 1, y - 2, 3, 5);
			ctx.fillRect(x - 2, y - 1, 5, 3);
		};
	});
	document.getElementById("brush-oblique").addEventListener("click", () => {
		brush = (ctx) => (x, y) => {
			ctx.fillRect(x - 3, y + 3, 2, 1);
			ctx.fillRect(x - 2, y + 2, 2, 1);
			ctx.fillRect(x - 1, y + 1, 2, 1);
			ctx.fillRect(x, y, 2, 1);
			ctx.fillRect(x + 1, y - 1, 2, 1);
			ctx.fillRect(x + 2, y - 2, 2, 1);
			ctx.fillRect(x - 3, y + 3, 2, 1);
		};
	});
	document.getElementById("brush-large-square").addEventListener("click", () => {
		brush = (ctx) => (x, y) => {
			ctx.fillRect(x - 4, y - 4, 9, 9);
		};
	});
	document.getElementById("brush-small-square").addEventListener("click", () => {
		brush = (ctx) => (x, y) => {
			ctx.fillRect(x - 2, y - 2, 5, 5);
		};
	});
	document.getElementById("brush-smaller-square").addEventListener("click", () => {
		brush = (ctx) => (x, y) => {
			ctx.fillRect(x - 1, y - 1, 3, 3);
		};
	});
	
	// start with the small circle brush selected
	document.getElementById("brush-small-circle").dispatchEvent(new Event("click"));
	
	// call drawSegment on all canvases when the mouse is clicked or dragged
	function draw(event) {
		if (anyToolSelected) {
			for (const canvas of canvases) {
				const ctx = canvas.getContext("2d");
				const top  = Math.round(canvas.getBoundingClientRect().top  + window.scrollY);
				const left = Math.round(canvas.getBoundingClientRect().left + window.scrollX);
				
				const x0 = pos.x - left;
				const y0 = pos.y - top;
				const x1 = event.pageX - left;
				const y1 = event.pageY - top;
				
				drawSegment(x0,y0,x1,y1,ctx);

				const start_inside = x0 > 0 && y0 > 0 && x0 < canvas.width && y0 < canvas.height;
				const end_inside = x1 > 0 && y1 > 0 && x1 < canvas.width && y1 < canvas.height;
				
				if (canvas.classList.contains("progress") && (start_inside || end_inside)) {
					progress += Math.sqrt((x1-x0)*(x1-x0)+(y1-y0)*(y1-y0));
					if (progress > 5000) {
						// enable finished button after a certain amount of drawing
						document.getElementById("gallery-finished").disabled = false;
					}
					// document.getElementById("gallery-finished").innerText = `finished (${progress})`;

					// break;
				}
			}
		}
	}

	function clear_canvas() {
		progress = 0;
		document.getElementById("gallery-finished").disabled = true;
		const ccanvas = document.getElementById("clear_canvas");
		const clear_rect = ccanvas.getBoundingClientRect();
		for (const canvas of canvases) {
			const canvas_rect = canvas.getBoundingClientRect();
			const x = clear_rect.x - canvas_rect.x;
			const y = clear_rect.y - canvas_rect.y;
			const ctx = canvas.getContext("2d");
			ctx.clearRect(x, y, clear_rect.width, clear_rect.height);
		}
	}

	const clear_button = document.getElementById("clear_button");
	if (clear_button != null) {
		clear_button.addEventListener("click", clear_canvas);
	}
	
	// mouse eventListeners
	document.addEventListener("mousedown", (event) => {
		if (event.buttons !== 1) return;
		pos.x = event.pageX;
		pos.y = event.pageY;
		draw(event);
		held = true;
	});
	
	document.addEventListener("mouseup", (event) => {
		held = false;
	});
	
	document.addEventListener("mousemove", (event) => {
		if (hidden.length > 0) {
			// check whether mouse is blocked by a canvas
			let clear = true;
			canvases.forEach((canvas) => {
				const ctx = canvas.getContext("2d");
				const top  = Math.round(canvas.getBoundingClientRect().top  + window.scrollY);
				const left = Math.round(canvas.getBoundingClientRect().left + window.scrollX);
				
				const x = event.pageX - left;
				const y = event.pageY - top;
				
				if (ctx.getImageData(x, y, 1, 1).data[3] != 0) {
					clear = false;
				}

				// check for hidden elements
				for (const h of hidden) {
					const b = h.getBoundingClientRect();
					const ex = event.pageX - window.scrollX;
					const ey = event.pageY - window.scrollY;

					if (ex > b.x && ex < (b.x + b.width) && ey > b.y && ey < (b.y + b.height)) {
						if (clear) {
							// if the mouse is over the element and it's not blocked, reveal it and allow interaction
							h.style.opacity = "1";							
							h.style.pointerEvents = "auto";
						} else {
							// if it's blocked, block interaction with it!
							h.style.pointerEvents = "none";
						}
					}
				}
			});
		}
		if (!held) return;
		draw(event);
		pos.x = event.pageX;
		pos.y = event.pageY;
	});
	
});

