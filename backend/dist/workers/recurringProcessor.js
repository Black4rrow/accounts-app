"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const luxon_1 = require("luxon");
const db_1 = __importDefault(require("../config/db"));
async function processRecurring() {
    const nowUtc = luxon_1.DateTime.utc();
    const due = await db_1.default.recurringTransaction.findMany({
        where: {
            active: true,
            nextRunAt: { lte: nowUtc.toJSDate() }
        }
    });
    for (const r of due) {
        try {
            await db_1.default.$transaction(async (tx) => {
                const occurrenceUtcDate = computeOccurrenceUtc(r, r.timezone);
                const occLocal = luxon_1.DateTime.fromJSDate(occurrenceUtcDate).setZone(r.timezone);
                const startOfMonthUtc = occLocal.startOf("month").toUTC().toJSDate();
                const endOfMonthUtc = occLocal.endOf("month").toUTC().toJSDate();
                const existing = await tx.transaction.findFirst({
                    where: {
                        recurringId: r.id,
                        date: { gte: startOfMonthUtc, lte: endOfMonthUtc }
                    }
                });
                if (existing) {
                    const next = computeNextRunAt(r, r.timezone);
                    await tx.recurringTransaction.update({
                        where: { id: r.id },
                        data: { lastRunAt: nowUtc.toJSDate(), nextRunAt: next }
                    });
                    return;
                }
                await tx.transaction.create({
                    data: {
                        userId: r.userId,
                        categoryId: r.categoryId,
                        amount: r.amount,
                        description: r.description ?? "",
                        date: occurrenceUtcDate,
                        recurringId: r.id
                    }
                });
                const next = computeNextRunAt(r, r.timezone);
                await tx.recurringTransaction.update({
                    where: { id: r.id },
                    data: { lastRunAt: nowUtc.toJSDate(), nextRunAt: next }
                });
            });
        }
        catch (err) {
            console.error("Error processing recurring id", r.id, err);
        }
    }
}
function computeOccurrenceUtc(r, tz) {
    const nowLocal = luxon_1.DateTime.now().setZone(tz);
    let day = r.dayOfMonth === 0 ? nowLocal.endOf("month").day : r.dayOfMonth;
    const dayInMonth = Math.min(day, nowLocal.endOf("month").day);
    const [hour = 0, minute = 0] = (r.timeOfDay ?? "00:00").split(":").map(Number);
    const localDT = luxon_1.DateTime.fromObject({
        year: nowLocal.year,
        month: nowLocal.month,
        day: dayInMonth,
        hour,
        minute
    }, { zone: tz });
    return localDT.toUTC().toJSDate();
}
function computeNextRunAt(r, tz) {
    const baseLocal = luxon_1.DateTime.now().setZone(tz).plus({ months: 1 }); // next month
    const day = r.dayOfMonth === 0 ? baseLocal.endOf("month").day : Math.min(r.dayOfMonth, baseLocal.endOf("month").day);
    const [hour = 0, minute = 0] = (r.timeOfDay ?? "00:00").split(":").map(Number);
    const nextLocal = luxon_1.DateTime.fromObject({
        year: baseLocal.year,
        month: baseLocal.month,
        day,
        hour,
        minute
    }, { zone: tz });
    return nextLocal.toUTC().toJSDate();
}
exports.default = processRecurring;
