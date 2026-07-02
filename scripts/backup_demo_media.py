#!/usr/bin/env python3
"""Package thesis demo media for external backup — T-905, RAC-001.

Usage:
  python scripts/backup_demo_media.py --check-only
  python scripts/backup_demo_media.py
  python scripts/backup_demo_media.py --video path/to/demo.mp4
  python scripts/backup_demo_media.py --output-dir E:\\TFM-Backup
"""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import sys
import zipfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

THESIS_DOCS = (
    "Memoria-TFM.md",
    "Argumentario-Defensa.md",
    "Guion-Video-Defensa.md",
    "Slides-Presentacion-Video.md",
    "Entrega-TFM-Fundae.md",
)

ARCHITECTURE_DIAGRAMS = (
    "System-Architecture.md",
    "ML-Pipeline-Diagram.md",
    "ER-Diagram.md",
    "Deployment-Diagram.md",
)


@dataclass(frozen=True)
class MediaBucket:
    name: str
    source: Path
    patterns: tuple[str, ...]
    required: bool = True


BUCKETS: tuple[MediaBucket, ...] = (
    MediaBucket("screenshots", ROOT / "docs/figures/screenshots", ("*.png", "manifest.json")),
    MediaBucket("eda", ROOT / "docs/figures/eda", ("*.png", "manifest.json")),
    MediaBucket(
        "thesis/slides",
        ROOT / "docs/Thesis/slides",
        ("MedScope-AI-TFM.pptx", "README.md"),
    ),
    MediaBucket(
        "architecture",
        ROOT / "docs/Architecture",
        ARCHITECTURE_DIAGRAMS,
    ),
)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def collect_bucket_files(bucket: MediaBucket) -> list[Path]:
    if not bucket.source.is_dir():
        return []

    files: list[Path] = []
    for pattern in bucket.patterns:
        files.extend(sorted(bucket.source.glob(pattern)))

    unique: dict[str, Path] = {}
    for path in files:
        if path.is_file():
            unique[str(path.resolve())] = path
    return list(unique.values())


def collect_thesis_docs() -> list[Path]:
    thesis_dir = ROOT / "docs/Thesis"
    return [thesis_dir / name for name in THESIS_DOCS if (thesis_dir / name).is_file()]


def resolve_video_path(explicit: Path | None) -> Path | None:
    if explicit is not None:
        return explicit.resolve()

    drop_dir = ROOT / "docs/Thesis/video"
    if drop_dir.is_dir():
        candidates = sorted(drop_dir.glob("*.mp4"))
        if candidates:
            return candidates[0].resolve()
    return None


def check_media(*, require_video: bool, video_path: Path | None) -> list[str]:
    failures: list[str] = []

    for bucket in BUCKETS:
        files = collect_bucket_files(bucket)
        if bucket.required and not files:
            failures.append(f"Missing required bucket: {bucket.name} ({bucket.source})")
            continue
        expected_pngs = [p for p in files if p.suffix.lower() == ".png"]
        if bucket.name == "screenshots" and len(expected_pngs) < 8:
            failures.append(f"Screenshots incomplete: expected 8 PNG, found {len(expected_pngs)}")
        if bucket.name == "eda" and len(expected_pngs) < 8:
            failures.append(f"EDA figures incomplete: expected 8 PNG, found {len(expected_pngs)}")

    thesis_docs = collect_thesis_docs()
    if len(thesis_docs) < len(THESIS_DOCS):
        missing = set(THESIS_DOCS) - {p.name for p in thesis_docs}
        failures.append(f"Missing thesis docs: {', '.join(sorted(missing))}")

    pptx = ROOT / "docs/Thesis/slides/MedScope-AI-TFM.pptx"
    if not pptx.is_file():
        failures.append("Missing slides: docs/Thesis/slides/MedScope-AI-TFM.pptx")

    resolved_video = resolve_video_path(video_path)
    if require_video and resolved_video is None:
        failures.append(
            "Demo video not found. Pass --video path/to/demo.mp4 "
            "or place an .mp4 in docs/Thesis/video/",
        )
    elif resolved_video is not None and not resolved_video.is_file():
        failures.append(f"Video path not found: {resolved_video}")

    return failures


def copy_to_backup(src: Path, dest: Path, manifest_path: str) -> dict[str, object]:
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)
    return {
        "path": manifest_path.replace("\\", "/"),
        "bytes": src.stat().st_size,
        "sha256": sha256_file(dest),
    }


def build_backup(
    *,
    output_root: Path,
    video_path: Path | None,
    create_zip: bool,
) -> tuple[Path, Path | None]:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    backup_dir = output_root / f"medscope-ai-defensa-{stamp}"
    backup_dir.mkdir(parents=True, exist_ok=False)

    manifest: dict[str, object] = {
        "task": "T-905",
        "requirement": "RAC-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "project": "MedScope AI",
        "source_repo": str(ROOT),
        "buckets": {},
        "thesis_docs": [],
        "video": None,
        "totals": {"files": 0, "bytes": 0},
    }

    totals_files = 0
    totals_bytes = 0

    for bucket in BUCKETS:
        entries: list[dict[str, object]] = []
        for src in collect_bucket_files(bucket):
            manifest_path = f"{bucket.name}/{src.name}"
            dest = backup_dir / bucket.name / src.name
            entry = copy_to_backup(src, dest, manifest_path)
            entry["source"] = str(src.relative_to(ROOT)).replace("\\", "/")
            entries.append(entry)
            totals_files += 1
            totals_bytes += int(entry["bytes"])

        manifest["buckets"][bucket.name] = entries

    thesis_entries: list[dict[str, object]] = []
    for src in collect_thesis_docs():
        manifest_path = f"thesis/{src.name}"
        dest = backup_dir / "thesis" / src.name
        entry = copy_to_backup(src, dest, manifest_path)
        entry["source"] = str(src.relative_to(ROOT)).replace("\\", "/")
        thesis_entries.append(entry)
        totals_files += 1
        totals_bytes += int(entry["bytes"])
    manifest["thesis_docs"] = thesis_entries

    resolved_video = resolve_video_path(video_path)
    if resolved_video is not None:
        video_dest = backup_dir / "video" / "medscope-ai-demo-defensa.mp4"
        entry = copy_to_backup(resolved_video, video_dest, "video/medscope-ai-demo-defensa.mp4")
        entry["source"] = str(resolved_video)
        manifest["video"] = entry
        totals_files += 1
        totals_bytes += int(entry["bytes"])

    manifest["totals"] = {"files": totals_files, "bytes": totals_bytes}

    manifest_path = backup_dir / "backup-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    readme = backup_dir / "README.txt"
    readme.write_text(
        "\n".join(
            [
                "MedScope AI — thesis demo media backup (T-905)",
                "",
                f"Created (UTC): {manifest['created_at']}",
                f"Files: {totals_files}",
                "",
                "Copy this folder (or the .zip) to an external drive.",
                "Verify integrity: python scripts/backup_demo_media.py --verify <folder>",
                "",
                "Contents:",
                "  screenshots/   App captures (T-808)",
                "  eda/           ML EDA figures (T-214)",
                "  thesis/        Memoria + guiones + slides",
                "  architecture/  Key architecture markdown",
                "  video/         Demo defense video (when recorded)",
            ],
        ),
        encoding="utf-8",
    )

    zip_path: Path | None = None
    if create_zip:
        zip_path = output_root / f"{backup_dir.name}.zip"
        with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            for path in sorted(backup_dir.rglob("*")):
                if path.is_file():
                    archive.write(path, path.relative_to(backup_dir.parent))
        manifest["zip_file"] = zip_path.name
        manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    return backup_dir, zip_path


def verify_backup(backup_dir: Path) -> list[str]:
    failures: list[str] = []
    manifest_path = backup_dir / "backup-manifest.json"
    if not manifest_path.is_file():
        return [f"Missing manifest: {manifest_path}"]

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    for bucket_name, entries in manifest.get("buckets", {}).items():
        for entry in entries:
            rel = str(entry["path"]).replace("\\", "/")
            file_path = backup_dir / rel
            if not file_path.is_file():
                failures.append(f"Missing file: {rel}")
                continue
            if sha256_file(file_path) != entry.get("sha256"):
                failures.append(f"Checksum mismatch: {rel}")

    for entry in manifest.get("thesis_docs", []):
        rel = str(entry["path"]).replace("\\", "/")
        file_path = backup_dir / rel
        if not file_path.is_file():
            failures.append(f"Missing thesis doc: {rel}")
        elif sha256_file(file_path) != entry.get("sha256"):
            failures.append(f"Checksum mismatch: {rel}")

    video = manifest.get("video")
    if video:
        video_path = backup_dir / "video" / "medscope-ai-demo-defensa.mp4"
        if not video_path.is_file():
            failures.append("Missing video/medscope-ai-demo-defensa.mp4")
        elif sha256_file(video_path) != video.get("sha256"):
            failures.append("Checksum mismatch: demo video")

    return failures


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Backup thesis demo media (T-905)")
    parser.add_argument(
        "--check-only",
        action="store_true",
        help="Validate required media exists without creating a backup",
    )
    parser.add_argument(
        "--verify",
        metavar="DIR",
        type=Path,
        help="Verify checksums of an existing backup folder",
    )
    parser.add_argument(
        "--video",
        type=Path,
        help="Path to demo defense video (.mp4)",
    )
    parser.add_argument(
        "--require-video",
        action="store_true",
        help="Fail if no demo video is provided or found",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=ROOT / "backups",
        help="Destination root (default: backups/ in repo)",
    )
    parser.add_argument(
        "--no-zip",
        action="store_true",
        help="Skip creating a .zip archive",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    if args.verify is not None:
        failures = verify_backup(args.verify.resolve())
        if failures:
            print("Backup verification failed:")
            for item in failures:
                print(f"  - {item}")
            return 1
        print(f"Backup verification passed: {args.verify}")
        return 0

    failures = check_media(require_video=args.require_video, video_path=args.video)
    if failures:
        print("Media check failed:")
        for item in failures:
            print(f"  - {item}")
        if not args.check_only:
            print("\nFix missing files, then re-run without --check-only.")
        return 1

    video = resolve_video_path(args.video)
    print("T-905 — Thesis demo media check")
    print(f"  Screenshots: docs/figures/screenshots/ (8 PNG)")
    print(f"  EDA figures: docs/figures/eda/ (8 PNG)")
    print(f"  Slides:      docs/Thesis/slides/MedScope-AI-TFM.pptx")
    print(f"  Thesis docs: {len(collect_thesis_docs())} markdown files")
    if video:
        print(f"  Video:       {video}")
    else:
        print("  Video:       (pending — optional until recorded)")

    if args.check_only:
        print("\nMedia check passed (no backup created).")
        return 0

    output_root = args.output_dir.resolve()
    output_root.mkdir(parents=True, exist_ok=True)
    backup_dir, zip_path = build_backup(
        output_root=output_root,
        video_path=args.video,
        create_zip=not args.no_zip,
    )

    print(f"\nBackup folder: {backup_dir}")
    if zip_path is not None:
        size_mb = zip_path.stat().st_size / (1024 * 1024)
        print(f"Zip archive:   {zip_path} ({size_mb:.1f} MB)")
    print("\nCopy the folder or .zip to an external drive (USB / cloud).")
    print(f"Verify later:  python scripts/backup_demo_media.py --verify \"{backup_dir}\"")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
