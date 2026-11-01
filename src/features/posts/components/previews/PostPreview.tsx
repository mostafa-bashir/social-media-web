import FeedPreview from "./FeedPreview";
import type { PreviewProps } from "./preview-props";
import VerticalPreview from "./VerticalPreview";
import YouTubePreview from "./YouTubePreview";

/** Roughly how the post will look on the platform, for the chosen format. */
export default function PostPreview(props: PreviewProps) {
  // TikTok has one format, `video`, but it is a vertical feed, unlike YouTube's.
  if (props.platform === "tiktok") return <VerticalPreview {...props} />;
  switch (props.format) {
    case "feed":
      return <FeedPreview {...props} />;
    case "video":
      return <YouTubePreview {...props} />;
    default:
      return <VerticalPreview {...props} />;
  }
}
