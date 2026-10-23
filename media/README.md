# /media — self-hosted video for hand-id.org

Drop these two files here (exact names), commit, push:

  hand-ibc2024-720p.mp4    ← 1:33 sizzle, 720p H.264, ~35 MB
  hand-ibc2024-poster.jpg  ← 1280×720 poster frame (also the LinkedIn preview image)

Until they exist, the player on / and /ibc-2024 automatically falls back to
an ad-free youtube-nocookie embed, and the poster falls back to YouTube's
thumbnail. Nothing breaks either way.

Make them from the master (run locally):

  ffmpeg -i master.mov -vf "scale=-2:720" -c:v libx264 -preset slow -crf 23 \
    -maxrate 3M -bufsize 6M -c:a aac -b:a 128k -movflags +faststart \
    hand-ibc2024-720p.mp4

  ffmpeg -ss 00:00:05 -i master.mov -vframes 1 -vf "scale=1280:720" -q:v 3 \
    hand-ibc2024-poster.jpg

(change -ss to the moment you want as the poster)
