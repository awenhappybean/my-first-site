"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { generateMeetingSummary } from "@/lib/ai";
import { savePhoto } from "@/lib/uploads";
import { PhotoType } from "@prisma/client";

function str(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

export async function createMeeting(formData: FormData) {
  const contactId = str(formData, "contactId");
  if (!contactId) throw new Error("請選擇聯絡人");

  const transcript = str(formData, "transcript");

  const meeting = await prisma.meeting.create({
    data: { contactId, transcript },
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

  revalidatePath("/meetings");
  redirect(`/meetings/${meeting.id}`);
}

export async function updateTranscript(id: string, formData: FormData) {
  const transcript = str(formData, "transcript");
  await prisma.meeting.update({ where: { id }, data: { transcript } });
  revalidatePath(`/meetings/${id}`);
}

export async function regenerateSummary(id: string) {
  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: { contact: true },
  });
  if (!meeting || !meeting.transcript) {
    throw new Error("尚無逐字稿內容，無法產生摘要");
  }

  await prisma.meeting.update({
    where: { id },
    data: { summaryStatus: "PENDING" },
  });

  try {
    const summary = await generateMeetingSummary({
      contactName: meeting.contact.name,
      company: meeting.contact.company,
      industry: meeting.contact.industry,
      transcript: meeting.transcript,
    });
    await prisma.meeting.update({
      where: { id },
      data: { summary, summaryStatus: "READY" },
    });
  } catch (err) {
    console.error("[regenerateSummary] 失敗", err);
    await prisma.meeting.update({
      where: { id },
      data: { summaryStatus: "FAILED" },
    });
  }

  revalidatePath(`/meetings/${id}`);
  revalidatePath("/meetings");
}
