# Optional on-device FFmpeg (Android)

The npm package `ffmpeg-kit-react-native` depends on `com.arthenica:ffmpeg-kit-*:6.0-2`, which was **removed from Maven** when FFmpegKit was retired.

The app builds without it; local multi-clip export is disabled until you vendor binaries.

## To re-enable (summary)

1. Download `ffmpeg-kit-min-6.0-2.aar` (or audio/https variant) from a saved release or [community mirror](https://github.com/NooruddinLakhani/ffmpeg-kit-full-gpl/releases).
2. Add an Android library module under `android/ffmpeg-kit-binaries/` that exposes the AAR.
3. Patch `ffmpeg-kit-react-native` to depend on that module instead of Maven.
4. Reinstall `ffmpeg-kit-react-native` and restore imports in `src/features/editor/native/ffmpegKit.ts`.

See [ffmpeg-kit issue #1099](https://github.com/arthenica/ffmpeg-kit/issues/1099) for community migration guides.
