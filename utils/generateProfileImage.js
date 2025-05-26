import { createCanvas } from "canvas";

const generateProfileImage = (firstName, lastName) => {
  const initials = `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext("2d");

  // Background color
  ctx.fillStyle = "#3498db";
  ctx.fillRect(0, 0, 200, 200);

  // Text styling
  ctx.fillStyle = "#fff";
  ctx.font = "bold 80px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Draw initials in the center
  ctx.fillText(initials, 100, 100);

  return canvas.toDataURL(); // Returns base64 image URL
};

export {generateProfileImage};