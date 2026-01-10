(function() {
  const init = () => {
    const tabContainers = document.querySelectorAll('.zodiac-tab-content-container');

    tabContainers.forEach(container => {
      const parentDiv = container.closest('div');
      const tabButtons = parentDiv.querySelectorAll('.zodiac-tab-btn');
      const tabContents = container.querySelectorAll('.zodiac-tab-content');

      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          const targetTab = button.getAttribute('data-tab');

          // Remove active state from all buttons
          tabButtons.forEach(btn => {
            btn.classList.remove('bg-gray-50', 'border-b-2', 'border-blue-600', 'text-blue-600');
            btn.classList.add('text-gray-600');
          });

          // Add active state to clicked button
          button.classList.add('bg-gray-50', 'border-b-2', 'border-blue-600', 'text-blue-600');
          button.classList.remove('text-gray-600');

          // Hide all tab contents
          tabContents.forEach(content => {
            content.classList.add('hidden');
          });

          // Show target tab content
          const targetContent = container.querySelector(`[data-content="${targetTab}"]`);
          if (targetContent) {
            targetContent.classList.remove('hidden');
          }
        });
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();