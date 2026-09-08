(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const hasVid = urlParams.get('param') === 'vid';

    // 1. Resolve exibição visual imediatamente aplicando estilos no head antes da DOM renderizar
    const style = document.createElement('style');
    if (hasVid) {
        // Tem vid -> Mostra compa, esconde sempa
        style.innerHTML = `
            .sempa { display: none !important; }
            .compa { display: block !important; }
        `;
    } else {
        // Não tem vid -> Mostra sempa, esconde compa
        style.innerHTML = `
            .compa { display: none !important; }
            .sempa { display: block !important; }
        `;
    }
    
    // Garante que o style seja injetado o quanto antes
    if (document.head) {
        document.head.appendChild(style);
    } else {
        document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));
    }

    // 2. Remove completamente o bloco indesejado (.sempa ou .compa) da DOM no momento em que ele é parseado.
    // Isso previne que os scripts do Vturb, o áudio e os delays sejam carregados duplicados.
    const classToRemove = hasVid ? 'sempa' : 'compa';
    
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1) { // Element Node
                    // Se o nó adicionado for o elemento indesejado
                    if (node.classList && node.classList.contains(classToRemove)) {
                        node.remove();
                    }
                    // Se o nó adicionado contiver o elemento indesejado dentro dele
                    else if (node.querySelectorAll) {
                        const badElements = node.querySelectorAll('.' + classToRemove);
                        badElements.forEach(el => el.remove());
                    }
                }
            }
        }
    });

    // Inicia a observação no documento inteiro o mais cedo possível
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // 3. Desconecta o observer após o carregamento completo para liberar performance
    document.addEventListener("DOMContentLoaded", function () {
        observer.disconnect();
        
        // Garantia final: procura e remove se algo escapou
        document.querySelectorAll('.' + classToRemove).forEach(el => el.remove());
    });
})();
