document.querySelectorAll(".accordion .item .header").forEach((header) => {
  header.addEventListener("click", function () {
    const item = this.parentNode;
    if (item.classList.contains("active")) {
      item.classList.remove("active");
    } else {
      document
        .querySelectorAll(".accordion .item")
        .forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
    }
  });
});

function getQueryParams() {
  return new URLSearchParams(window.location.search);
}

// Função para combinar os parâmetros do href original com os parâmetros da URL atual
function combineParams(originalHref, currentParams) {
  let [baseUrl, originalParamsString] = originalHref.split("?");
  let originalParams = new URLSearchParams(originalParamsString || "");

  // Adiciona os parâmetros atuais da URL aos parâmetros originais
  currentParams.forEach((value, key) => {
    // Verifica se o parâmetro já existe para evitar duplicação
    if (!originalParams.has(key)) {
      originalParams.append(key, value);
    }
  });

  // Monta a URL final
  let finalParamsString = originalParams.toString();
  return finalParamsString ? `${baseUrl}?${finalParamsString}` : baseUrl;
}

// Adiciona os parâmetros da URL aos links de checkout
document.addEventListener("DOMContentLoaded", function () {
  let buttons = document.querySelectorAll(".area-kits a");
  let currentParams = getQueryParams();

  buttons.forEach(function (button) {
    let originalHref = button.getAttribute("href");
    button.setAttribute("href", combineParams(originalHref, currentParams));
  });
});


class NeuralNetworkCanvas {
  constructor() {
    this.canvas = document.getElementById('neural-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.main = document.querySelector('main');
    this.nodes = [];
    this.numNodes = 80;
    this.maxConnectionDist = 120;
    this.mouse = { x: null, y: null };
    this.init();
  }

  init() {
    if (!this.canvas || !this.main) return;
    this.resizeCanvas();
    this.createNodes();
    this.addEventListeners();
    this.animate();
  }

  resizeCanvas() {
    const rect = this.main.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  createNodes() {
    this.nodes = [];
    for (let i = 0; i < this.numNodes; i++) {
      this.nodes.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3
      });
    }
  }

  addEventListeners() {
    this.main.addEventListener('mousemove', (e) => {
      const rect = this.main.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.main.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.createNodes();
    });
  }

  updateNodes() {
    this.nodes.forEach(node => {
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < 0 || node.x > this.canvas.width) node.vx *= -1;
      if (node.y < 0 || node.y > this.canvas.height) node.vy *= -1;

      if (this.mouse.x && this.mouse.y) {
        const dx = this.mouse.x - node.x;
        const dy = this.mouse.y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = (100 - distance) / 100;
          node.x -= dx * force * 0.01;
          node.y -= dy * force * 0.01;
        }
      }
    });
  }

  drawNodes() {
    this.nodes.forEach(node => {
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(6, 103, 143, ${node.opacity})`;
      this.ctx.fill();
      
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius + 1, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(131, 196, 234, ${node.opacity * 0.5})`;
      this.ctx.lineWidth = 0.5;
      this.ctx.stroke();
    });
  }

  drawConnections() {
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const dx = this.nodes[i].x - this.nodes[j].x;
        const dy = this.nodes[i].y - this.nodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.maxConnectionDist) {
          const opacity = (1 - distance / this.maxConnectionDist) * 0.3;
          
          this.ctx.beginPath();
          this.ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
          this.ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
          this.ctx.strokeStyle = `rgba(235, 110, 135, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }
  }

  drawMouseConnections() {
    if (!this.mouse.x || !this.mouse.y) return;

    this.nodes.forEach(node => {
      const dx = this.mouse.x - node.x;
      const dy = this.mouse.y - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 150) {
        const opacity = (1 - distance / 150) * 0.6;
        
        this.ctx.beginPath();
        this.ctx.moveTo(node.x, node.y);
        this.ctx.lineTo(this.mouse.x, this.mouse.y);
        this.ctx.strokeStyle = `rgba(235, 110, 135, ${opacity})`;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }
    });

    this.ctx.beginPath();
    this.ctx.arc(this.mouse.x, this.mouse.y, 8, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(235, 110, 135, 0.8)';
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.arc(this.mouse.x, this.mouse.y, 12, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(235, 110, 135, 0.4)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.updateNodes();
    this.drawConnections();
    this.drawNodes();
    this.drawMouseConnections();
    
    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new NeuralNetworkCanvas();
});
