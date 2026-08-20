import React from "react";

export interface WispLogoProps {
  size?: number | string;
  className?: string;
  withSparkles?: boolean;
}

export const WispLogo: React.FC<WispLogoProps> = ({
  size = 36,
  className = "",
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title="Wisp - The Spectrum"
    >
      <svg
        viewBox="0 0 580 580"
        className="w-full h-full drop-shadow-sm select-none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <radialGradient id="wispBody-r0" cx="58%" cy="52%" r="62%">
            <stop offset="0%" stopColor="#FDBEFF" />
            <stop offset="34%" stopColor="#F291FE" />
            <stop offset="60%" stopColor="#C455FE" />
            <stop offset="83%" stopColor="#9B2BE8" />
            <stop offset="100%" stopColor="#3B00C8" />
          </radialGradient>
          <linearGradient id="wispRim-r0" x1="0.15" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#3B00C8" />
            <stop offset="55%" stopColor="#33089B" />
            <stop offset="100%" stopColor="#2B0080" />
          </linearGradient>
          <filter id="wispSoft-r0" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="11" />
          </filter>
          <filter id="wispGlow-r0" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g className="wisp-sparkles">
          <path
            d="M212 40Q215.9 51.1 227 55Q215.9 58.9 212 70Q208.1 58.9 197 55Q208.1 51.1 212 40Z"
            fill="#FBA9FF"
            className="wisp-sparkle"
          />
          <path
            d="M455 103Q459.42 115.58 472 120Q459.42 124.42 455 137Q450.58 124.42 438 120Q450.58 115.58 455 103Z"
            fill="#FBA9FF"
            className="wisp-sparkle"
          />
          <path
            d="M505 203Q508.12 211.88 517 215Q508.12 218.12 505 227Q501.88 218.12 493 215Q501.88 218.12 505 203Z"
            fill="#FBA9FF"
            className="wisp-sparkle"
          />
          <path
            d="M528 316Q531.64 326.36 542 330Q531.64 333.64 528 344Q524.36 333.64 514 330Q524.36 326.36 528 316Z"
            fill="#FBA9FF"
            className="wisp-sparkle"
          />
          <path
            d="M168 107Q170.86 115.14 179 118Q170.86 120.86 168 129Q165.14 120.86 157 118Q165.14 115.14 168 107Z"
            fill="#FBA9FF"
            className="wisp-sparkle"
          />
          <path
            d="M70 222Q72.6 229.4 80 232Q72.6 234.6 70 242Q67.4 234.6 60 232Q67.4 229.4 70 222Z"
            fill="#FBA9FF"
            className="wisp-sparkle"
          />
          <path
            d="M46 343Q49.12 351.88 58 355Q49.12 358.12 46 367Q42.88 358.12 34 355Q42.88 351.88 46 343Z"
            fill="#FBA9FF"
            className="wisp-sparkle"
          />
          <path
            d="M130 481Q132.86 489.14 141 492Q132.86 494.86 130 503Q127.14 494.86 119 492Q127.14 489.14 130 481Z"
            fill="#FBA9FF"
            className="wisp-sparkle"
          />
          <path
            d="M470 442Q472.6 449.4 480 452Q472.6 454.6 470 462Q467.4 454.6 460 452Q467.4 449.4 470 442Z"
            fill="#FBA9FF"
            className="wisp-sparkle"
          />
        </g>
        <g className="wisp-flame">
          <path
            d="M326 530.5C308.7 531.3 273.3 531.2 254 529.5C234.7 527.8 223.3 524.7 210 520.5C196.7 516.3 182.5 509.8 174 504.5C165.5 499.2 165.8 493.3 159 488.5C152.2 483.7 139.5 480 133 475.5C126.5 471 126.1 466.8 120 461.5C113.9 456.2 104.1 453.9 96.5 444C88.9 434.1 81.2 416.8 74.5 402C67.8 387.2 58.7 367.5 56.5 355C54.3 342.5 56.8 332.6 61.5 327C66.2 321.4 79.7 330.7 85 321.5C90.3 312.3 89.9 285.4 93.5 272C97.1 258.6 102.2 249.3 106.5 241C110.8 232.7 110.8 231.4 119.5 222C128.2 212.6 142.1 197.8 159 184.5C175.9 171.2 208.6 152.1 221 142.5C233.4 132.9 229.4 135.1 233.5 127C237.6 118.9 244 107.3 245.5 94C247 80.7 241.2 56.8 242.5 47C243.8 37.2 247.4 36.2 253 35.5C258.6 34.8 266 37.2 276 42.5C286 47.8 302.8 59.1 313 67.5C323.2 75.9 328.8 81.7 337.5 93C346.2 104.3 356.9 130.4 365 135.5C373.1 140.6 379.6 124.2 386 123.5C392.4 122.8 395.8 119.4 403.5 131C411.2 142.6 420.2 174.8 432.5 193C444.8 211.2 467.3 228.3 477.5 240C487.7 251.7 488.7 254 493.5 263C498.3 272 503.2 283.5 506.5 294C509.8 304.5 513.3 313.3 513.5 326C513.7 338.7 510.8 356 507.5 370C504.2 384 499.7 397.2 493.5 410C487.3 422.8 478.5 436.7 470.5 447C462.5 457.3 451 464.3 445.5 472C440 479.7 440.6 488.1 437.5 493C434.4 497.9 431.8 498.8 427 501.5C422.2 504.2 420.5 505.7 409 509.5C397.5 513.3 371.8 521 358 524.5C344.2 528 343.3 529.7 326 530.5Z"
            fill="url(#wispBody-r0)"
            stroke="url(#wispRim-r0)"
            strokeWidth="8"
            paintOrder="stroke"
            strokeLinejoin="round"
          />
          <g filter="url(#wispSoft-r0)" className="wisp-highlights">
            <path
              d="M376 415.5C368.6 416.6 364.4 415.2 360.5 411C356.6 406.8 354.9 394.4 352.5 390C350.1 385.6 348.4 385.6 346 384.5C343.6 383.4 344 381.5 338 383.5C332 385.5 320.2 396.8 310 396.5C299.8 396.2 285.4 386.6 277 381.5C268.6 376.4 262 369.5 259.5 366C257 362.5 257.9 362.6 262 360.5C266.1 358.4 277.9 357.8 284 353.5C290.1 349.2 295.8 343.1 298.5 335C301.2 326.9 302.7 314.3 300.5 305C298.3 295.7 286.5 284.7 285.5 279C284.5 273.3 287.1 274.1 294.5 271C301.9 267.9 320.2 262.1 330 260.5C339.8 258.9 343.5 259.2 353 261.5C362.5 263.8 379.2 270.6 387 274.5C394.8 278.4 398.8 280.4 399.5 285C400.2 289.6 393 295.2 391.5 302C390 308.8 389.2 318.5 390.5 326C391.8 333.5 395.5 341.5 399.5 347C403.5 352.5 410.8 352.5 414.5 359C418.2 365.5 423.1 378.4 421.5 386C419.9 393.6 412.6 399.6 405 404.5C397.4 409.4 383.4 414.4 376 415.5Z"
              fill="#FDBEFF"
              opacity="0.5"
            />
            <path
              d="M330 216.5C323.9 217.9 322.1 217.9 322.5 214C322.9 210.1 330.8 199.7 332.5 193C334.2 186.3 333.8 181.5 332.5 174C331.2 166.5 328.2 156.8 324.5 148C320.8 139.2 313 124.5 310 121.5C307 118.5 307.9 128.6 306.5 130C305.1 131.4 303.3 134.2 301.5 130C299.7 125.8 302.3 117.7 295.5 105C288.7 92.3 265.2 63.6 260.5 54C255.8 44.4 261.3 45.3 267 47.5C272.7 49.7 285.8 59.6 294.5 67C303.2 74.4 312.2 82.5 319.5 92C326.8 101.5 334 113.7 338.5 124C343 134.3 345.2 144.7 346.5 154C347.8 163.3 347.5 172 346.5 180C345.5 188 339.4 198.9 340.5 202C341.6 205.1 347.9 201.6 353 198.5C358.1 195.4 367.1 185.6 371 183.5C374.9 181.4 375.6 184.8 376.5 186C377.4 187.2 379.4 187.8 376.5 191C373.6 194.2 366.8 201.2 359 205.5C351.2 209.8 336.1 215.1 330 216.5Z"
              fill="#FBA9FF"
              opacity="0.62"
            />
            <path
              d="M145 376.5C136.5 378.2 133.8 375 125 369.5C116.2 364 98.3 346.5 92 343.5C85.7 340.5 88.5 350.3 87 351.5C85.5 352.7 87.2 356.8 83 350.5C78.8 344.2 64.5 320.8 61.5 314C58.5 307.2 62.8 308.8 65 309.5C67.2 310.2 67 313.3 75 318.5C83 323.7 96.2 333.7 113 340.5C129.8 347.3 170.7 353.5 176 359.5C181.3 365.5 153.5 374.8 145 376.5Z"
              fill="#FBA9FF"
              opacity="0.7"
            />
          </g>
          <g className="wisp-face">
            <g className="wisp-eye" transform="translate(264 315) scale(1 0.58) translate(-264 -315)">
              <ellipse cx="264" cy="315" rx="37" ry="44" fill="#02033A" stroke="#FFEBFF" strokeWidth="5" strokeOpacity="0.45" />
              <ellipse cx="264" cy="315.924" rx="31" ry="38" fill="#3F009F" />
              <circle cx="271" cy="300.64" r="13" fill="#FFF4FF" />
            </g>
            <g className="wisp-eye" transform="translate(420 319) scale(1 0.58) translate(-420 -319)">
              <ellipse cx="420" cy="319" rx="29" ry="38" fill="#02033A" stroke="#FFEBFF" strokeWidth="5" strokeOpacity="0.45" />
              <ellipse cx="420" cy="319.798" rx="23" ry="32" fill="#3F009F" />
              <circle cx="417" cy="304.28" r="9.5" fill="#FFF4FF" />
            </g>
            <g stroke="#02033A" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.82" className="wisp-brows">
              <path d="M231 257 Q263 238 296 256" />
              <path d="M395 265 Q421 248 447 265" />
            </g>
            <g className="wisp-mouth">
              <path
                d="M315.1 347.5C326.6 359.9 339.5 359 351 359C362.5 359 375.4 359.9 386.9 347.5C386.9 381.3 373.3 397.5 351 397.5C328.7 397.5 315.1 381.3 315.1 347.5Z"
                fill="#2B017B"
                stroke="#FFE9FF"
                strokeWidth="4"
                strokeOpacity="0.5"
              />
              <ellipse cx="348" cy="385.3" rx="13.5" ry="7.6" fill="#FC607E" opacity="1" />
            </g>
          </g>
        </g>
        <ellipse cx="292" cy="540" rx="132" ry="16" fill="#9B2BE8" opacity="0.28" filter="url(#wispGlow-r0)" className="wisp-shadow" />
      </svg>
    </div>
  );
};
