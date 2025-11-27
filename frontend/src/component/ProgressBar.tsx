import React from "react";
import "./css/ProgressBar.css";

export default function ProgressBar({
  value = 0,
  height = 16,
  radius = 8,
  gradient = "linear-gradient(90deg, #2ecc71, #f1c40f, #e74c3c)",
  track = "#2b2b2b",
  transition = "width 400ms ease"
}) {
  const v = Math.max(0, Math.min(100, value));
  const style = {
    "--progress": `${v}%`,
    "--height": `${height}px`,
    "--radius": `${radius}px`,
    "--track": track,
    "--gradient": gradient,
    "--transition": transition
  } as React.CSSProperties;

  return (
    <div
      className="pe-progress"
      style={style}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      aria-label="Progress"
    >
      <div className="pe-progress__cover" />
    </div>
  );
}
