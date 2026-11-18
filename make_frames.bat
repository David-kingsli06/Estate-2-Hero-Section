@echo off
if not exist public\frames mkdir public\frames

ffmpeg -loglevel error -y -i "Blueprint_lines_over_sandy_beach_e58ca7d5.mp4" -vf "fps=6,scale=1920:1080,tpad=stop_mode=clone:stop_duration=3" -frames:v 48 -c:v libwebp -quality 85 -start_number 0 "public\frames\frame_%%03d.webp"
ffmpeg -loglevel error -y -i "Untitled_Scene_11-18_12_12_47_02b8424d_t2-8.mp4" -vf "fps=6,scale=1920:1080,tpad=stop_mode=clone:stop_duration=3" -frames:v 48 -c:v libwebp -quality 85 -start_number 48 "public\frames\frame_%%03d.webp"
ffmpeg -loglevel error -y -i "Building_assembly_on_empty_beach_71affa69.mp4" -vf "fps=6,scale=1920:1080,tpad=stop_mode=clone:stop_duration=3" -frames:v 48 -c:v libwebp -quality 85 -start_number 96 "public\frames\frame_%%03d.webp"
ffmpeg -loglevel error -y -i "Camera_approaches_sand-beige_home_5babb702.mp4" -vf "fps=6,scale=1920:1080,tpad=stop_mode=clone:stop_duration=3" -frames:v 48 -c:v libwebp -quality 85 -start_number 144 "public\frames\frame_%%03d.webp"

echo.
dir /b public\frames\*.webp | find /c ".webp"
pause