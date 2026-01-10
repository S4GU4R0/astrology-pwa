/**
 * Main Content Template Function
 * Creates the main content area with chart display
 */

function createMainTemplate() {
  const template = document.createElement('template');
  template.innerHTML = `
    <main class="flex-1 bg-gray-900 flex items-center justify-center p-8 overflow-auto" id="mainContentArea">
      <div id="chartView" class="chart-container relative w-full max-w-2xl aspect-square">
        <svg viewbox="0 0 400 400" class="w-full h-full">
          <circle cx="200" cy="200" r="190" fill="none" stroke="#4B5563" stroke-width="1"></circle>
          <circle cx="200" cy="200" r="160" fill="none" stroke="#4B5563" stroke-width="1"></circle>
          <circle cx="200" cy="200" r="120" fill="none" stroke="#374151" stroke-width="1"></circle>
          <circle cx="200" cy="200" r="60" fill="none" stroke="#374151" stroke-width="1"></circle>
          <line x1="200" y1="10" x2="200" y2="40" stroke="#6B7280" stroke-width="2"></line>
          <line x1="200" y1="360" x2="200" y2="390" stroke="#6B7280" stroke-width="2"></line>
          <line x1="10" y1="200" x2="40" y2="200" stroke="#6B7280" stroke-width="2"></line>
          <line x1="360" y1="200" x2="390" y2="200" stroke="#6B7280" stroke-width="2"></line>
          <text x="200" y="25" text-anchor="middle" fill="#9CA3AF" font-size="10">MC</text>
          <text x="200" y="385" text-anchor="middle" fill="#9CA3AF" font-size="10">IC</text>
          <text x="20" y="204" text-anchor="middle" fill="#9CA3AF" font-size="10">ASC</text>
          <text x="380" y="204" text-anchor="middle" fill="#9CA3AF" font-size="10">DSC</text>
          <g transform="rotate(0, 200, 200)">
            <line x1="200" y1="40" x2="200" y2="60" stroke="#4B5563" stroke-width="1"></line>
          </g>
          <g transform="rotate(30, 200, 200)">
            <line x1="200" y1="40" x2="200" y2="60" stroke="#4B5563" stroke-width="1"></line>
          </g>
          <g transform="rotate(60, 200, 200)">
            <line x1="200" y1="40" x2="200" y2="60" stroke="#4B5563" stroke-width="1"></line>
          </g>
          <g transform="rotate(90, 200, 200)">
            <line x1="200" y1="40" x2="200" y2="60" stroke="#4B5563" stroke-width="1"></line>
          </g>
          <g transform="rotate(120, 200, 200)">
            <line x1="200" y1="40" x2="200" y2="60" stroke="#4B5563" stroke-width="1"></line>
          </g>
          <g transform="rotate(150, 200, 200)">
            <line x1="200" y1="40" x2="200" y2="60" stroke="#4B5563" stroke-width="1"></line>
          </g>
          <g transform="rotate(180, 200, 200)">
            <line x1="200" y1="40" x2="200" y2="60" stroke="#4B5563" stroke-width="1"></line>
          </g>
          <g transform="rotate(210, 200, 200)">
            <line x1="200" y1="40" x2="200" y2="60" stroke="#4B5563" stroke-width="1"></line>
          </g>
          <g transform="rotate(240, 200, 200)">
            <line x1="200" y1="40" x2="200" y2="60" stroke="#4B5563" stroke-width="1"></line>
          </g>
          <g transform="rotate(270, 200, 200)">
            <line x1="200" y1="40" x2="200" y2="60" stroke="#4B5563" stroke-width="1"></line>
          </g>
          <g transform="rotate(300, 200, 200)">
            <line x1="200" y1="40" x2="200" y2="60" stroke="#4B5563" stroke-width="1"></line>
          </g>
          <g transform="rotate(330, 200, 200)">
            <line x1="200" y1="40" x2="200" y2="60" stroke="#4B5563" stroke-width="1"></line>
          </g>
          <text x="195" y="20" fill="#F87171" font-size="12">♈</text>
          <text x="255" y="45" fill="#34D399" font-size="12">♉</text>
          <text x="300" y="95" fill="#FBBF24" font-size="12">♊</text>
          <text x="320" y="160" fill="#60A5FA" font-size="12">♋</text>
          <text x="310" y="230" fill="#F87171" font-size="12">♌</text>
          <text x="275" y="290" fill="#34D399" font-size="12">♍</text>
          <text x="215" y="330" fill="#FBBF24" font-size="12">♎</text>
          <text x="145" y="320" fill="#60A5FA" font-size="12">♏</text>
          <text x="90" y="280" fill="#F87171" font-size="12">♐</text>
          <text x="60" y="220" fill="#34D399" font-size="12">♑</text>
          <text x="60" y="150" fill="#FBBF24" font-size="12">♒</text>
          <text x="100" y="85" fill="#60A5FA" font-size="12">♓</text>
          <circle cx="280" cy="120" r="8" fill="#FBBF24"></circle>
          <text x="280" y="124" text-anchor="middle" fill="#1F2937" font-size="10" font-weight="bold">☉</text>
          <circle cx="120" cy="260" r="8" fill="#9CA3AF"></circle>
          <text x="120" y="264" text-anchor="middle" fill="#1F2937" font-size="10" font-weight="bold">☽</text>
          <circle cx="300" cy="180" r="8" fill="#F97316"></circle>
          <text x="300" y="184" text-anchor="middle" fill="#1F2937" font-size="10" font-weight="bold">☿</text>
          <circle cx="240" cy="280" r="8" fill="#EC4899"></circle>
          <text x="240" y="284" text-anchor="middle" fill="#1F2937" font-size="10" font-weight="bold">♀</text>
          <circle cx="180" cy="90" r="8" fill="#EF4444"></circle>
          <text x="180" y="94" text-anchor="middle" fill="#1F2937" font-size="10" font-weight="bold">♂</text>
          <circle cx="310" cy="200" r="8" fill="#A855F7"></circle>
          <text x="310" y="204" text-anchor="middle" fill="#1F2937" font-size="10" font-weight="bold">♃</text>
          <circle cx="100" cy="180" r="8" fill="#D97706"></circle>
          <text x="100" y="184" text-anchor="middle" fill="#1F2937" font-size="10" font-weight="bold">♄</text>
          <line x1="280" y1="120" x2="120" y2="260" stroke="#EF4444" stroke-width="1" stroke-dasharray="4,2" opacity="0.6"></line>
          <line x1="280" y1="120" x2="240" y2="280" stroke="#22C55E" stroke-width="1" opacity="0.6"></line>
          <line x1="180" y1="90" x2="310" y2="200" stroke="#3B82F6" stroke-width="1" opacity="0.6"></line>
        </svg>
      </div>
    </main>
  `;
  return template.content.cloneNode(true);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createMainTemplate };
} else {
  window.MainTemplate = { createMainTemplate };
}
