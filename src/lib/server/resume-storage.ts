import type { UploadApiResponse } from "cloudinary";
import "server-only";

import { cloudinary } from "@/lib/cloudinary";

export async function uploadResumeAsset(file: File, userId: string) {
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: `careerly/job-seeker/resumes/${userId}`,
        public_id: crypto.randomUUID(),
        resource_type: "raw",
        type: "authenticated",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary did not return an upload result."));
          return;
        }

        resolve(result);
      },
    );

    upload.end(buffer);
  });
}

export async function deleteResumeAsset(publicId: string) {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: "raw",
    type: "authenticated",
    invalidate: true,
  });
}

export async function deleteResumeFolder(userId: string) {
  await cloudinary.api.delete_folder(
    `careerly/job-seeker/resumes/${userId}`,
    { skip_backup: true },
  );
}

export function getResumeDownloadUrl(publicId: string, fileName: string) {
  const format = fileName.split(".").pop()?.toLowerCase();

  if (!format) {
    throw new Error("Resume file format is missing.");
  }

  return cloudinary.utils.private_download_url(publicId, format, {
    resource_type: "raw",
    type: "authenticated",
    attachment: true,
    expires_at: Math.floor(Date.now() / 1000) + 60,
  });
}
