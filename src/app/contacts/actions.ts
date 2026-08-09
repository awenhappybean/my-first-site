"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function str(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

export async function createContact(formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("姓名為必填");

  await prisma.contact.create({
    data: {
      name,
      company: str(formData, "company"),
      title: str(formData, "title"),
      industry: str(formData, "industry"),
      bniChapter: str(formData, "bniChapter"),
      phone: str(formData, "phone"),
      email: str(formData, "email"),
      address: str(formData, "address"),
      notes: str(formData, "notes"),
    },
  });

  revalidatePath("/contacts");
}

export async function updateContact(id: string, formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("姓名為必填");

  await prisma.contact.update({
    where: { id },
    data: {
      name,
      company: str(formData, "company") ?? null,
      title: str(formData, "title") ?? null,
      industry: str(formData, "industry") ?? null,
      bniChapter: str(formData, "bniChapter") ?? null,
      phone: str(formData, "phone") ?? null,
      email: str(formData, "email") ?? null,
      address: str(formData, "address") ?? null,
      notes: str(formData, "notes") ?? null,
    },
  });

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${id}`);
}

export async function deleteContact(id: string) {
  await prisma.contact.delete({ where: { id } });
  revalidatePath("/contacts");
  redirect("/contacts");
}
