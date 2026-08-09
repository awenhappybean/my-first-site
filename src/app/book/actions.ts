"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sendMail, baseUrl } from "@/lib/mail";
import { generateMeetingSummary } from "@/lib/ai";
import { savePhoto } from "@/lib/uploads";
import { PhotoType } from "@prisma/client";

function str(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

export async function createBooking(formData: FormData) {
  const name = str(formData, "name");
  const scheduledAtRaw = str(formData, "scheduledAt");
  if (!name || !scheduledAtRaw) {
    throw new Error("姓名與預約時間為必填");
  }

  const contact = await prisma.contact.create({
    data: {
      name,
      company: str(formData, "company"),
      industry: str(formData, "industry"),
      bniChapter: str(formData, "bniChapter"),
      phone: str(formData, "phone"),
      email: str(formData, "email"),
    },
  });

  const booking = await prisma.booking.create({
    data: {
      contactId: contact.id,
      scheduledAt: new Date(scheduledAtRaw),
      location: str(formData, "location"),
      notes: str(formData, "notes"),
    },
  });

  const link = `${baseUrl()}/book/${booking.token}`;
  const scheduledLabel = booking.scheduledAt.toLocaleString("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    await sendMail({
      to: adminEmail,
      subject: `【新預約】${name} 已預約一對一 - ${scheduledLabel}`,
      html: `<p>${name}（${contact.company ?? "未填公司"}）已預約一對一時間：${scheduledLabel}</p>
             <p>備註：${str(formData, "notes") ?? "無"}</p>
             <p>後續資料連結：<a href="${link}">${link}</a></p>`,
    });
  }

  if (contact.email) {
    await sendMail({
      to: contact.email,
      subject: `一對一預約確認 - ${scheduledLabel}`,
      html: `<p>您好 ${name}，您的一對一時間已確認：<b>${scheduledLabel}</b></p>
             <p>會談結束後，請透過以下連結上傳名片照片與逐字稿，系統將自動為您整理摘要：</p>
             <p><a href="${link}">${link}</a></p>`,
    });
  }

  revalidatePath("/calendar");
  redirect(`/book/${booking.token}`);
}

export async function submitMeetingMaterials(token: string, formData: FormData) {
  const booking = await prisma.booking.findUnique({
    where: { token },
    include: { contact: true, meeting: true },
  });
  if (!booking) throw new Error("找不到此預約");

  const transcript = str(formData, "transcript");

  const meeting = booking.meeting
    ? await prisma.meeting.update({
        where: { id: booking.meeting.id },
        data: {
          transcript: transcript ?? booking.meeting.transcript,
        },
      })
    : await prisma.meeting.create({
        data: {
          contactId: booking.contactId,
          bookingId: booking.id,
          transcript,
        },
      });

  const businessCard = formData.get("businessCard");
  const slide = formData.get("slide");

  if (businessCard instanceof File && businessCard.size > 0) {
    const filename = await savePhoto(businessCard);
    await prisma.photo.create({
      data: { meetingId: meeting.id, type: PhotoType.BUSINESS_CARD, filename },
    });
  }
  if (slide instanceof File && slide.size > 0) {
    const filename = await savePhoto(slide);
    await prisma.photo.create({
      data: { meetingId: meeting.id, type: PhotoType.SLIDE, filename },
    });
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "COMPLETED" },
  });

  if (transcript && transcript.length > 20) {
    await prisma.meeting.update({
      where: { id: meeting.id },
      data: { summaryStatus: "PENDING" },
    });
    try {
      const summary = await generateMeetingSummary({
        contactName: booking.contact.name,
        company: booking.contact.company,
        industry: booking.contact.industry,
        transcript,
      });
      await prisma.meeting.update({
        where: { id: meeting.id },
        data: { summary, summaryStatus: "READY" },
      });

      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        await sendMail({
          to: adminEmail,
          subject: `【新摘要】${booking.contact.name} 的一對一摘要已完成`,
          html: `<div>${summary.replace(/\n/g, "<br/>")}</div>
                 <p><a href="${baseUrl()}/meetings/${meeting.id}">查看完整紀錄</a></p>`,
        });
      }
    } catch (err) {
      console.error("[submitMeetingMaterials] AI 摘要失敗", err);
      await prisma.meeting.update({
        where: { id: meeting.id },
        data: { summaryStatus: "FAILED" },
      });
    }
  }

  revalidatePath(`/book/${token}`);
  revalidatePath(`/meetings/${meeting.id}`);
  revalidatePath("/meetings");
}
