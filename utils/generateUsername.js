import Client from "../models/auth_model.js";

// Function to generate a unique username
const generateUsername = async (phone) => {
  const lastFourDigits = phone.slice(-4);
  const letters = Array.from({ length: 4 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join("");
  const specialChars = "@$&_";
  const specialChar = specialChars[Math.floor(Math.random() * specialChars.length)];

  let username = `${letters}${specialChar}${lastFourDigits}`;

  // Ensure the username is unique
  let isUnique = false;
  while (!isUnique) {
    const existingUser = await Client.findOne({ username });
    if (!existingUser) {
      isUnique = true; // Found a unique username
    } else {
      // Regenerate if username exists
      username = `${letters}${specialChar}${lastFourDigits}`;
    }
  }

  return username;
};

export default generateUsername;
