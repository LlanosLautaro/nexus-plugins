import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

try:
    from PIL import Image, ImageSequence
except Exception:
    Image = None
    ImageSequence = None

if Image is not None:
    try:
        RESAMPLING_LANCZOS = Image.Resampling.LANCZOS
    except AttributeError:
        RESAMPLING_LANCZOS = Image.LANCZOS
else:
    RESAMPLING_LANCZOS = None


def run_command(command):
    return subprocess.run(
        command,
        capture_output=True,
        text=True,
        check=False,
    )


def run_ffprobe(ffprobe_path, source_path):
    result = run_command(
        [
            ffprobe_path,
            "-v",
            "error",
            "-print_format",
            "json",
            "-show_streams",
            "-show_format",
            source_path,
        ],
    )

    if result.returncode != 0:
        raise RuntimeError((result.stderr or result.stdout or "ffprobe fallo").strip())

    try:
        return json.loads(result.stdout or "{}")
    except json.JSONDecodeError as error:
        raise RuntimeError(f"ffprobe devolvio JSON invalido: {error}") from error


def pick_primary_stream(metadata):
    streams = metadata.get("streams") or []
    preferred_types = {"video", "image"}

    for stream in streams:
        if str(stream.get("codec_type") or "").lower() in preferred_types:
            return stream

    return streams[0] if streams else {}


def to_int(value):
    try:
        if value is None or value == "":
            return None
        return int(round(float(value)))
    except (TypeError, ValueError):
        return None


def extract_media_info(metadata):
    stream = pick_primary_stream(metadata)
    format_data = metadata.get("format") or {}
    width = to_int(stream.get("width"))
    height = to_int(stream.get("height"))
    duration_seconds = (
        stream.get("duration")
        if stream.get("duration") not in (None, "")
        else format_data.get("duration")
    )
    duration_ms = to_int(float(duration_seconds) * 1000) if duration_seconds not in (None, "") else None

    return {
        "width": width,
        "height": height,
        "durationMs": duration_ms,
    }


def extract_image_media_info(source_path):
    if Image is None:
        raise RuntimeError("Pillow no esta disponible para extraer metadata de imagen.")

    with Image.open(source_path) as image:
        width, height = image.size
        total_duration_ms = 0
        has_duration = False

        if getattr(image, "is_animated", False) and ImageSequence is not None:
            for frame in ImageSequence.Iterator(image):
                frame_duration = to_int(frame.info.get("duration"))
                if frame_duration is not None:
                    total_duration_ms += frame_duration
                    has_duration = True

        return {
            "width": width,
            "height": height,
            "durationMs": total_duration_ms if has_duration else None,
        }


def pick_frame_timestamp_ms(media_kind, duration_ms):
    if media_kind not in ("video", "gif"):
        return None

    if not duration_ms or duration_ms <= 0:
        return 0

    candidate = int(round(duration_ms * 0.14))
    return max(120, min(candidate, 4000))


def build_scale_filter(max_side):
    return (
        f"scale="
        f"w='if(gte(iw,ih),min(iw,{max_side}),-2)':"
        f"h='if(gte(ih,iw),min(ih,{max_side}),-2)'"
    )


def remove_if_exists(file_path):
    try:
        Path(file_path).unlink()
    except FileNotFoundError:
        return


def render_thumbnail(
    ffmpeg_path,
    source_path,
    output_path,
    media_kind,
    frame_timestamp_ms,
    max_side,
    prefer_webp,
):
    remove_if_exists(output_path)
    command = [ffmpeg_path, "-hide_banner", "-loglevel", "error", "-y"]

    if media_kind in ("video", "gif") and frame_timestamp_ms is not None and frame_timestamp_ms > 0:
        command.extend(["-ss", f"{frame_timestamp_ms / 1000:.3f}"])

    command.extend(["-i", source_path, "-an", "-sn", "-frames:v", "1", "-vf", build_scale_filter(max_side)])

    if prefer_webp:
        command.extend(["-compression_level", "6", "-q:v", "72", output_path])
    else:
        command.extend(["-q:v", "4", output_path])

    result = run_command(command)

    if result.returncode != 0 or not os.path.exists(output_path):
        message = (result.stderr or result.stdout or "ffmpeg fallo generando thumbnail").strip()
        raise RuntimeError(message)


def probe_generated_thumbnail(ffprobe_path, file_path):
    metadata = run_ffprobe(ffprobe_path, file_path)
    stream = pick_primary_stream(metadata)
    return {
        "width": to_int(stream.get("width")),
        "height": to_int(stream.get("height")),
        "byteSize": os.path.getsize(file_path),
    }


def resolve_mime_type(file_path):
    extension = Path(file_path).suffix.lower()
    if extension == ".webp":
        return "image/webp"
    if extension in (".jpg", ".jpeg"):
        return "image/jpeg"
    return "application/octet-stream"


def normalize_image_mode_for_save(image, prefer_webp):
    if prefer_webp:
        if image.mode in ("RGBA", "LA", "P"):
            return image.convert("RGBA")
        if image.mode != "RGB":
            return image.convert("RGB")
        return image

    if image.mode in ("RGBA", "LA"):
        background = Image.new("RGB", image.size, (18, 18, 18))
        alpha = image.getchannel("A")
        background.paste(image.convert("RGBA"), mask=alpha)
        return background

    if image.mode == "P":
        converted = image.convert("RGBA")
        background = Image.new("RGB", converted.size, (18, 18, 18))
        alpha = converted.getchannel("A")
        background.paste(converted, mask=alpha)
        return background

    if image.mode != "RGB":
        return image.convert("RGB")

    return image


def render_image_thumbnail_with_pillow(source_path, output_path, max_side, prefer_webp):
    if Image is None:
        raise RuntimeError("Pillow no esta disponible para generar thumbnails de imagen.")

    remove_if_exists(output_path)

    with Image.open(source_path) as image:
        if getattr(image, "is_animated", False):
            image.seek(0)

        frame = image.copy()
        frame.thumbnail((max_side, max_side), RESAMPLING_LANCZOS)
        frame = normalize_image_mode_for_save(frame, prefer_webp)

        save_kwargs = {"optimize": True}

        if prefer_webp:
            save_kwargs.update({
                "format": "WEBP",
                "quality": 72,
                "method": 6,
            })
        else:
            save_kwargs.update({
                "format": "JPEG",
                "quality": 88,
            })

        frame.save(output_path, **save_kwargs)

    if not os.path.exists(output_path):
        raise RuntimeError("Pillow no pudo generar la thumbnail de imagen.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-path", required=True)
    parser.add_argument("--media-kind", required=True)
    parser.add_argument("--ffmpeg-path", required=True)
    parser.add_argument("--ffprobe-path", required=True)
    parser.add_argument("--thumbnail-webp-path", required=True)
    parser.add_argument("--thumbnail-jpeg-path", required=True)
    parser.add_argument("--max-side", type=int, default=384)
    args = parser.parse_args()

    source_path = os.path.abspath(args.source_path)
    ffmpeg_path = os.path.abspath(args.ffmpeg_path)
    ffprobe_path = os.path.abspath(args.ffprobe_path)
    output_webp = os.path.abspath(args.thumbnail_webp_path)
    output_jpeg = os.path.abspath(args.thumbnail_jpeg_path)

    if not os.path.exists(source_path):
        raise FileNotFoundError(f"No existe la media original: {source_path}")

    Path(output_webp).parent.mkdir(parents=True, exist_ok=True)
    Path(output_jpeg).parent.mkdir(parents=True, exist_ok=True)

    metadata = run_ffprobe(ffprobe_path, source_path)
    use_pillow_image_pipeline = args.media_kind == "image" and Image is not None
    media_info = extract_image_media_info(source_path) if use_pillow_image_pipeline else extract_media_info(metadata)
    frame_timestamp_ms = pick_frame_timestamp_ms(args.media_kind, media_info["durationMs"])

    selected_output = output_webp
    selected_mime_type = "image/webp"

    try:
        if use_pillow_image_pipeline:
            render_image_thumbnail_with_pillow(
                source_path=source_path,
                output_path=output_webp,
                max_side=args.max_side,
                prefer_webp=True,
            )
        else:
            render_thumbnail(
                ffmpeg_path=ffmpeg_path,
                source_path=source_path,
                output_path=output_webp,
                media_kind=args.media_kind,
                frame_timestamp_ms=frame_timestamp_ms,
                max_side=args.max_side,
                prefer_webp=True,
            )
        remove_if_exists(output_jpeg)
    except RuntimeError:
        if use_pillow_image_pipeline:
            render_image_thumbnail_with_pillow(
                source_path=source_path,
                output_path=output_jpeg,
                max_side=args.max_side,
                prefer_webp=False,
            )
        else:
            render_thumbnail(
                ffmpeg_path=ffmpeg_path,
                source_path=source_path,
                output_path=output_jpeg,
                media_kind=args.media_kind,
                frame_timestamp_ms=frame_timestamp_ms,
                max_side=args.max_side,
                prefer_webp=False,
            )
        remove_if_exists(output_webp)
        selected_output = output_jpeg
        selected_mime_type = "image/jpeg"

    thumb_info = probe_generated_thumbnail(ffprobe_path, selected_output)
    payload = {
        "width": media_info["width"],
        "height": media_info["height"],
        "durationMs": media_info["durationMs"],
        "thumbnailPath": selected_output,
        "thumbnailMimeType": selected_mime_type or resolve_mime_type(selected_output),
        "thumbnailWidth": thumb_info["width"],
        "thumbnailHeight": thumb_info["height"],
        "thumbnailByteSize": thumb_info["byteSize"],
        "frameTimestampMs": frame_timestamp_ms,
    }

    sys.stdout.write(json.dumps(payload))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        sys.stderr.write(str(error))
        sys.exit(1)
