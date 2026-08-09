import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendMail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const { to, subject, html } = params;
  const transporter = getTransporter();

  if (!transporter) {
    console.warn(
      "[mail] 尚未設定 GMAIL_USER / GMAIL_APP_PASSWORD，略過寄信：",
      subject
    );
    await prisma.emailLog.create({
      data: { to, subject, status: "SKIPPED_NO_CONFIG" },
    });
    return { skipped: true };
  }

  try {
    await transporter.sendMail({
      from: `"BNI 助理" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    await prisma.emailLog.create({
      data: { to, subject, status: "SENT" },
    });
    return { skipped: false };
  } catch (err) {
    console.error("[mail] 寄送失敗", err);
    await prisma.emailLog.create({
      data: { to, subject, status: "FAILED" },
    });
    throw err;
  }
}

export function baseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}
