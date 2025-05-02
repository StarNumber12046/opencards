import bcrypt from "bcrypt";
const saltRounds = 10;

async function main() {
  const salt = await bcrypt.genSalt(saltRounds);

  // Base 64 encoded hash
  const b64encodedHash = Buffer.from(salt).toString("base64");
  console.log(b64encodedHash);
}

main();
