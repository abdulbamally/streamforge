# Project: OmniStream Studio - Execution Plan & Research Roadmap

## 1. Vision Overview

**Goal:** A "Pro-Studio in your pocket" that enables multi-platform broadcasting, real-time AI-driven data extraction, and professional-grade live/offline video editing—offered for free to the creator.

---

## 2. Phase 1: Deep Research & Feasibility (Months 1–2)

_Goal: Solve the "How" for the most technically demanding features before writing the core logic._

### 2.1 Technical Research (Video & Streaming)

- **The Engine:** Research `FFmpeg` integration for mobile (e.g., `ffmpeg-kit`). Can it handle simultaneous camera input, music overlay, and watermark rendering without exceeding 60% CPU usage?
- **Streaming Protocols:** Compare **RTMP** (standard for Twitch/YouTube) vs. **SRT** (Secure Reliable Transport) for better stability on mobile networks.
- **Relay Architecture:** Since broadcasting to 3+ platforms from a phone is bandwidth-heavy, research "Cloud Reflector" setups. The app sends **one** high-quality stream to your server, and the server splits it to YouTube/Twitch/TikTok.

### 2.2 AI & Computer Vision Research

- **On-Device vs. Cloud:** Research **TensorFlow Lite** and **MediaPipe**.
  - _On-Device:_ Fast, private, but battery-intensive. Best for face effects/filters.
  - _Cloud-Side:_ Best for OCR (License plates, street names). Research latency for sending "frames of interest" to an API.
- **Privacy Constraints:** Investigate "Auto-Blur" logic for bystanders to ensure compliance with international privacy laws.

### 2.3 Legal & Compliance (Data Privacy)

- **NDPR/GDPR Audit:** Research the legality of automated data collection (license plates, street signs) in public spaces.
- **Platform TOS:** Check if TikTok/YouTube allow streams containing real-time extracted data overlays.

---

## 3. Phase 2: Technical Architecture (Month 3)

_Goal: Design a scalable, "Lightweight" system using a modern full-stack approach._

- **Mobile Frontend:** **React Native** (utilizing TypeScript).
  - _Why:_ Leverages your existing skills while allowing for "Native Modules" in C++/Swift for high-performance video processing.
- **Backend:** **Node.js (Express)** with **Prisma ORM**.
  - _Database:_ PostgreSQL for user data and gifting history.
- **Media Server:** **Node-Media-Server** or a Go-based solution like **LiveKit** to handle the RTMP relay logic.
- **Containerization:** **Docker** for local development and cloud deployment to ensure environment parity.

---

## 4. Phase 3: The MVP Build - "Core Studio" (Months 4–6)

_Goal: Build the "Pipe" and the "Studio" interface._

### Milestone 1: The Pipeline

- Implement basic camera capture and local storage.
- Establish a stable RTMP stream to a single destination.
- Build the "Offline Mode" logic: Saving a raw file while simultaneously applying edits.

### Milestone 2: The UI/UX

- Develop the "Overlay Engine": Drag-and-drop text, images, and music while live.
- Create the "Switching" logic: Seamlessly transition between front camera, back camera, and screen recording.

---

## 5. Phase 4: AI Integration & Social (Months 7–9)

_Goal: Implement the "Premium" features and monetization loops._

### Milestone 3: Computer Vision

- Integrate **OCR (Optical Character Recognition)** for license plates and street signs.
- Implement **Object Recognition**: Tagging products or landmarks in real-time.
- Add AI-driven face effects and "Green Screen" background removal.

### Milestone 4: The Gifting Economy

- Integrate a virtual currency/gifting system.
- Build the "Guest" slot feature: Allowing a streamer to invite a viewer into the broadcast via WebRTC.

---

## 6. Phase 5: Optimization & Launch (Months 10–12)

_Goal: Performance tuning and market entry._

- **The "Lightweight" Polish:** Refactor FFmpeg commands to use hardware acceleration (VideoToolbox on iOS, MediaCodec on Android).
- **Network Resilience:** Implement adaptive bitrate streaming (auto-lowering quality when the 4G/5G signal is weak).
- **Beta Launch:** Release to a cohort of "IRL Streamers" and "Reaction Creators" for feedback.
- **Public Release:** Launch on App Store and Play Store.

---

## 7. Risk Management Matrix

| Risk              | Impact | Mitigation Strategy                                                                   |
| :---------------- | :----- | :------------------------------------------------------------------------------------ |
| **Battery Drain** | High   | Move heavy AI processing to the cloud or background threads.                          |
| **High Latency**  | Medium | Use a global CDN for the relay server to ensure low-ping rebroadcasting.              |
| **Legal/Privacy** | High   | Implement strict "opt-in" for data collection features and auto-blur sensitive info.  |
| **Server Costs**  | High   | Implement a tiered "Gifting" model where the platform takes a fee to cover bandwidth. |

---

## 8. Immediate Next Steps

1. **Technical Spike:** Build a small React Native prototype that can overlay a `.png` and an `.mp3` onto a live camera feed and save it.
2. **API Research:** Identify 3 APIs for license plate recognition (e.g., OpenALPR) and compare their "Free Tier" limits.
3. **Draft the "User Persona":** Define the exact "first user"—is it a travel vlogger, a citizen journalist, or a gamer?
