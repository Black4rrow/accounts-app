import { DateTime } from "luxon";
import prisma from "../config/db";

async function processRecurring() {
  const nowUtc = DateTime.utc();

  const due = await prisma.recurringTransaction.findMany({
    where: {
      active: true,
      nextRunAt: { lte: nowUtc.toJSDate() }
    }
  });

  for (const r of due) {
    try {
      await prisma.$transaction(async (tx) => {
        const occurrenceUtcDate = computeOccurrenceUtc(r, r.timezone);

        const occLocal = DateTime.fromJSDate(occurrenceUtcDate).setZone(r.timezone);
        const startOfMonthUtc = occLocal.startOf("month").toUTC().toJSDate();
        const endOfMonthUtc = occLocal.endOf("month").toUTC().toJSDate();

        const existing = await tx.transaction.findFirst({
          where: {
            recurringId: r.id,
            date: { gte: startOfMonthUtc, lte: endOfMonthUtc }
          }
        });

        if (existing) {
          console.log(`Skipping recurring id ${r.id} for this month since a transaction already exists`);
          const next = computeNextRunAt(r, r.timezone);
          await tx.recurringTransaction.update({
            where: { id: r.id },
            data: { lastRunAt: nowUtc.toJSDate(), nextRunAt: next }
          });
          return;
        }

        const tr = await tx.transaction.create({
          data: {
            userId: r.userId,
            categoryId: r.categoryId,
            amount: r.amount,
            description: r.description ?? "",
            date: occurrenceUtcDate,
            recurringId: r.id
          }
        });
        console.log(`Created transaction ${tr} for recurring id ${r.id}`);

        const next = computeNextRunAt(r, r.timezone);
        await tx.recurringTransaction.update({
          where: { id: r.id },
          data: { lastRunAt: nowUtc.toJSDate(), nextRunAt: next }
        });
      });
    } catch (err) {
      console.error("Error processing recurring id", r.id, err);
    }
  }
}

function computeOccurrenceUtc(r: any, tz: string): Date {
  const nowLocal = DateTime.now().setZone(tz);

  let day = r.dayOfMonth === 0 ? nowLocal.endOf("month").day : r.dayOfMonth;
  const dayInMonth = Math.min(day, nowLocal.endOf("month").day);

  const [hour = 0, minute = 0] = (r.timeOfDay ?? "00:00").split(":").map(Number);
  const localDT = DateTime.fromObject({
    year: nowLocal.year,
    month: nowLocal.month,
    day: dayInMonth,
    hour,
    minute
  }, { zone: tz });

  return localDT.toUTC().toJSDate();
}

export function computeNextRunAt(r: any, tz: string): Date {
  const baseLocal = DateTime.now().setZone(tz).plus({ months: 1 }); // next month
  const day = r.dayOfMonth === 0 ? baseLocal.endOf("month").day : Math.min(r.dayOfMonth, baseLocal.endOf("month").day);
  const [hour = 0, minute = 0] = (r.timeOfDay ?? "00:00").split(":").map(Number);

  const nextLocal = DateTime.fromObject({
    year: baseLocal.year,
    month: baseLocal.month,
    day,
    hour,
    minute
  }, { zone: tz });

  return nextLocal.toUTC().toJSDate();
}

export default processRecurring;
