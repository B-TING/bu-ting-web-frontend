import { StoriesFeed } from '@/app/[locale]/stories/components/StoriesFeed';
import { getStoryFeedItems } from '@/app/[locale]/stories/story-data';

export default function StoriesPage() {
  const stories = getStoryFeedItems();

  return <StoriesFeed stories={stories} />;
}
