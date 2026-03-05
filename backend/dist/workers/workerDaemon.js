"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const recurringProcessor_1 = __importDefault(require("./recurringProcessor"));
const intervalMin = parseInt(process.env.RECURRING_INTERVAL_MINUTES || "5", 10);
let running = false;
async function runOnce() {
    if (running)
        return;
    running = true;
    try {
        console.log("[worker] run start", new Date().toISOString());
        await (0, recurringProcessor_1.default)();
        console.log("[worker] run end", new Date().toISOString());
    }
    catch (err) {
        console.error("[worker] run error", err);
    }
    finally {
        running = false;
    }
}
runOnce();
const timer = setInterval(runOnce, intervalMin * 60 * 1000);
function shutdown() {
    console.log("[worker] shutting down...");
    clearInterval(timer);
    setTimeout(() => process.exit(0), 2000);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
