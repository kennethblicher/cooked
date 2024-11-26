const twilio = require("twilio");

// Twilio API nøgler
const accountSid = "AC789d4a67dd55c1d86d4a4141cd240361";
const authToken = "e3638f3c7f71d76b4a811011e0b45214";
const client = twilio(accountSid, authToken);

async function createText(modtager, besked) {
  const message = await client.messages.create({
    from: "+18504006662",
    to: modtager,
    body: besked,
  });

  console.log(message);
}
const test = document.getElementById("signupCreate").value;
console.log(test)

createText(test, "Hej! Det er fra Joe, velkommen til");
