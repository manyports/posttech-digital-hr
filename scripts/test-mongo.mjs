// Runs the whole test suite against a real, throwaway MongoDB server instead
// of the in-memory database (the binary is downloaded once and cached).
import { spawnSync } from "node:child_process";
import { MongoMemoryServer } from "mongodb-memory-server";

const mongod = await MongoMemoryServer.create();
const run = spawnSync(
  process.execPath,
  // Files share one database, so run them one at a time; force-exit closes the pooled client.
  ["--import", "tsx", "--test", "--test-concurrency=1", "--test-force-exit", "tests/**/*.test.ts"],
  { stdio: "inherit", env: { ...process.env, MONGODB_URI: mongod.getUri(), MONGODB_DB: "digital_hr_test" } },
);
await mongod.stop();
process.exit(run.status ?? 1);
