import { getAccessToken } from "@/app/actions/auth";

export const downloadImages = async (imageIds: string[]): Promise<Blob> => {
  const accessToken = getAccessToken();

  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/image/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}` // 토큰이 필요한 경우
    },
    body: JSON.stringify({
      image_list: imageIds
    })
  });

  if (!response.ok) {
    throw new Error('Download failed');
  }

  return response.blob();
};

export const startDownload = (blob: Blob) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  
  a.href = url;
  a.download = `${date}.zip`;
  document.body.appendChild(a);
  a.click();
  
  window.URL.revokeObjectURL(url);
  a.remove();
};