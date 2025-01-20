const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Tamaño del canvas.
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Propiedades de las circunferencias
const lightCircle = {
  x: 300,
  y: 300,
  radius: 30,
  color: 'yellow',
  isDragging: false
};
const absorbCircle = {
  x: 600,
  y: 300,
  radius: 40,
  color: 'red',
  isDragging: false
};

let mouseX = 0;
let mouseY = 0;

// Función para dibujar las circunferencias
function drawCircle(x, y, radius, color) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

// Función para dibujar los rayos
function drawRays(x, y, numRays) {
  const rayLength = canvas.width * 2; // Rayos más largos
  for (let i = 0; i < numRays; i++) {
    const angle = (i / numRays) * Math.PI * 2; // Disposición angular de los rayos
    const endX = x + Math.cos(angle) * rayLength; 
    const endY = y + Math.sin(angle) * rayLength;

    // Verificar si el rayo intersecta la circunferencia roja
    const intersection = getRayCircleIntersection(x, y, angle, absorbCircle);
      
    if (intersection) {
      // Rayos bloqueados
      ctx.strokeStyle = 'green'; 
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(intersection.x, intersection.y);
      ctx.stroke();
    } else {
      // Rayos normales, sin colisión
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }
}

// Acá me agarró un acv pero al final se pudo :D
function getRayCircleIntersection(x, y, angle, circle) {
  // Dirección del rayo
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);

  // Resolvemos para el valor de t cuando el rayo toca el borde de la circunferencia
  const A = dx * dx + dy * dy;
  const B = 2 * (dx * (x - circle.x) + dy * (y - circle.y));
  const C = (x - circle.x) * (x - circle.x) + (y - circle.y) * (y - circle.y) - circle.radius * circle.radius;

  // Solución cuadrática (t)
  const discriminant = B * B - 4 * A * C;
  
  if (discriminant < 0) {
    return null; // No hay intersección
  }

  // Calculamos los valores t para los puntos de intersección
  const t1 = (-B + Math.sqrt(discriminant)) / (2 * A);
  const t2 = (-B - Math.sqrt(discriminant)) / (2 * A);

  // Elegir el valor t positivo más cercano
  let t = Math.min(t1, t2);
  if (t < 0) {
    t = Math.max(t1, t2); // Acá se podría hacer distinto, por ejemplo borrar los t y usar solo t final y si es menor retornar null
  }

  // Coordenadas de la intersección
  const intersectionX = x + t * dx;
  const intersectionY = y + t * dy;

  // Solo devolver la intersección si está en la dirección correcta y en el borde exacto
  if (t > 0) {
    return { x: intersectionX, y: intersectionY };
  }
  return null; // Si el valor de t es negativo, el rayo va en dirección opuesta
}

// Dibuja las circunferencias y los rayos
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dibuja los rayos de la circunferencia de luz
  drawRays(lightCircle.x, lightCircle.y, 102);  // 102 rayos

  // Dibuja las circunferencias
  drawCircle(lightCircle.x, lightCircle.y, lightCircle.radius, lightCircle.color);
  drawCircle(absorbCircle.x, absorbCircle.y, absorbCircle.radius, absorbCircle.color);
}

// Función para verificar si el mouse está sobre una circunferencia
function isMouseInsideCircle(circle, x, y) {
  const dist = Math.hypot(circle.x - x, circle.y - y);
  return dist < circle.radius;
}

// Manejo del evento de clic y arrastre
canvas.addEventListener('mousedown', (e) => {
  mouseX = e.offsetX;
  mouseY = e.offsetY;

  if (isMouseInsideCircle(lightCircle, mouseX, mouseY)) {
    lightCircle.isDragging = true;
  } else if (isMouseInsideCircle(absorbCircle, mouseX, mouseY)) {
    absorbCircle.isDragging = true;
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (lightCircle.isDragging || absorbCircle.isDragging) {
    const dx = e.offsetX - mouseX;
    const dy = e.offsetY - mouseY;
            
    if (lightCircle.isDragging) {
      lightCircle.x += dx;
      lightCircle.y += dy;
    } else if (absorbCircle.isDragging) {
      absorbCircle.x += dx;
      absorbCircle.y += dy;
    }

    mouseX = e.offsetX;
    mouseY = e.offsetY;
  }
});

canvas.addEventListener('mouseup', () => {
  lightCircle.isDragging = false;
  absorbCircle.isDragging = false;
});

// Bucle de animación
function animate() {
  draw();
  requestAnimationFrame(animate);
}

animate();