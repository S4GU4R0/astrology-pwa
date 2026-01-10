(function() {
  const init = () => {
    const menuItems = document.querySelectorAll('.menu-dropdown-trigger');
    menuItems.forEach(item => {
      item.addEventListener('mouseenter', function() {
        const dropdown = this.querySelector('.menu-dropdown');
        if (dropdown) {
          dropdown.classList.remove('hidden');
        }
      });
      item.addEventListener('mouseleave', function() {
        const dropdown = this.querySelector('.menu-dropdown');
        if (dropdown) {
          dropdown.classList.add('hidden');
        }
      });
    });

    const chartContainer = document.querySelector('.chart-container');
    if (chartContainer) {
      let scale = 1;
      chartContainer.addEventListener('wheel', function(e) {
        if (e.ctrlKey) {
          e.preventDefault();
          scale += e.deltaY > 0 ? -0.1 : 0.1;
          scale = Math.min(Math.max(0.5, scale), 2);
          const svg = this.querySelector('svg');
          if (svg) {
            svg.style.transform = `scale(${scale})`;
          }
        }
      });
    }

    const planetItems = document.querySelectorAll('.planet-item');
    planetItems.forEach(item => {
      item.addEventListener('click', function() {
        planetItems.forEach(p => p.classList.remove('bg-gray-600'));
        this.classList.add('bg-gray-600');
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();