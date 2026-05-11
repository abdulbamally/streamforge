// ============================================================
//  Shared — Top Level Barrel Export
//  Allows importing from '@shared' directly
//
//  Usage:
//    import { Button, Colors, Spacing } from '@shared'
// ============================================================

// Components — point directly to each file, not the folder
export { Button } from "./components/Button";
export { Input } from "./components/Input";
export {
  Card,
  Badge,
  Avatar,
  Skeleton,
  Screen,
  Divider,
} from "./components/UI";
export { Header } from "./components/Header";
export { ProgressBar, CircularProgress } from "./components/ProgressBar";
export { EmptyState } from "./components/EmptyState";
export { Modal, ConfirmModal } from "./components/Modal";
export { BottomSheet } from "./components/BottomSheet";
export { toastConfig } from "./components/Toast";
export { ListItem, ListSection, ListSeparator } from "./components/ListItem";

// Theme — point directly to tokens file
export {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadows,
  ZIndex,
  Duration,
  IconSize,
} from "./theme/tokens";

// Constants
export * from "./constants/index";
