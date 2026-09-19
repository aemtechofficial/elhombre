import { ensureSeeded } from "../src/lib/seed";

ensureSeeded()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
