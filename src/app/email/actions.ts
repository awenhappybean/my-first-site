"use server";

import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { redirect } from "next/navigation";

export async function sendBroadcastEmail(formData: FormData) {
  const subject = formData.get("subject");
  const message = formData.get("message");
  const contactIds = formData.getAll("contactIds").map(String);

  if (typeof subject !== "string" || !subject.trim()) {
    throw new Error("請輸入信件主旨");
  }
  if (typeof message !== "string" || !message.trim()) {
    throw new Error("請輸入信件內容");
  }
  if (contactIds.length === 0) {
    throw new Error("請至少選擇一位收件人");
  }

  const contacts = await prisma.contact.findMany({
    where: { id: { in: contactIds }, email: { not: null } },
  });

  const html = message
    .split("\n")
    .map((line) => `<p>${line}</p>`)
    .join("");

  let sent = 0;
  for (const contact of contacts) {
    if (!contact.email) continue;
    await sendMail({ to: contact.email, subject, html });
    sent += 1;
  }

  redirect(`/email?sent=${sent}`);
}
