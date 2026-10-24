# /media — self-hosted video for hand-id.org

  hand-ibc2024-720p.mp4   ← 1:33 sizzle (93.5 s), 720p H.264, web-optimized (faststart)

Poster / key art lives in /images:

  KeyArt_IBC_Accelerator_2024.webp  ← poster shown in the player (/ and /ibc-2024)
  KeyArt_IBC_Accelerator_2024.jpg   ← same image as JPG, used for link previews
                                      (og:image) — LinkedIn and others don't
                                      reliably accept WebP

If the MP4 is missing, the player falls back to an ad-free youtube-nocookie
embed. Master (4K, 650 MB) stays offline — never commit it (GitHub's limit is
100 MB per file).

Re-encode from the master (run locally):

  ffmpeg -i "IBC_DigitalReplicas_POC BTS_EvanShafran_Final for WEBSITE.mp4" \
    -vf "scale=-2:720" -c:v libx264 -preset slow -crf 22 -maxrate 3M -bufsize 6M \
    -profile:v high -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart \
    hand-ibc2024-720p.mp4

If you ever replace the video, rename it (e.g. -v2.mp4) and update data-mp4 in
index.html and ibc-2024.html — /media is cached for a week.
