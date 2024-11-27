const twilio = require("twilio");

// Twilio API nøgler
const accountSid = "AC789d4a67dd55c1d86d4a4141cd240361";
const authToken = "e3638f3c7f71d76b4a811011e0b45214";
const client = twilio(accountSid, authToken);

async function createText(modtager) {

  const digits = [];
  for (let i = 0; i < 5; i++) {
    const randomDigit = Math.floor(Math.random() * 10) + 1; // Genererer 6 tilfældige tal
    digits.push(randomDigit);
  }
  const finalDigits = digits.join(""); // Samler de 6 tal til en string
  const message = await client.messages.create({
    from: "+18504006662",
    to: modtager,
    body: `Hej! Din bekræftelseskode er ${finalDigits}`,
  });

  console.log(message);
}
const tlfNumber = document.getElementById("signupCreate").value;
console.log(tlfNumber)


createText(tlfNumber);
