
export default function TrafficCone () {
  return (

  <>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-label="Traffic cone">
  <defs>
    <linearGradient id="coneOrange" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffb347"/>
      <stop offset="0.45" stop-color="#ff7a00"/>
      <stop offset="1" stop-color="#e65a00"/>
    </linearGradient>
    <linearGradient id="shadow" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.25"/>
    </filter>
  </defs>

  {/* <!-- Ground shadow --> */}
  <ellipse cx="128" cy="228" rx="88" ry="16" fill="#000" opacity="0.12"/>

  {/* <!-- Base --> */}
  <g filter="url(#softShadow)">
    <rect x="44" y="196" width="168" height="30" rx="10" fill="#2b2b2b"/>
    <rect x="54" y="202" width="148" height="8" rx="4" fill="#3a3a3a" opacity="0.9"/>
  </g>

  {/* <!-- Cone body --> */}
  <path
    d="M104 40
       C110 30, 146 30, 152 40
       L188 196
       H68
       Z"
    fill="url(#coneOrange)"
    stroke="#c84d00"
    stroke-width="4"
    stroke-linejoin="round"
  />

  {/* <!-- Highlight --> */}
  <path
    d="M118 52
       C121 46, 135 46, 138 52
       L162 188
       H142
       Z"
    fill="url(#shadow)"
    opacity="0.9"
  />

  {/* <!-- White stripes --> */}
  <path
    d="M90 120
       H166
       L172 150
       H84
       Z"
    fill="#ffffff"
    opacity="0.95"
  />
  <path
    d="M78 168
       H178
       L184 196
       H72
       Z"
    fill="#ffffff"
    opacity="0.95"
  />

  {/* <!-- Rim --> */}
  <path
    d="M96 86
       H160
       L163 98
       H93
       Z"
    fill="#d95500"
    opacity="0.95"
  />


  <path
    d="M104 40
       C110 30, 146 30, 152 40
       L188 196
       H68
       Z"
    fill="none"
    stroke="#8f3700"
    stroke-width="2"
    stroke-linejoin="round"
    opacity="0.35"
  />
    </svg>
    </>
  );
}
