import UserProfile from '@/components/UserProfile';
import ItemFeed from '@/components/ItemFeed';

import { getUserWithUsername, itemToJSON } from '@/lib/firebase';

export async function getServerSideProps({ query }) {
  const { username } = query;
  const userDoc = await getUserWithUsername(username);

  if (!userDoc) {
    return {
      notFound: true,
    };
  };

  let user = null;
  let userItems = null;

  user = userDoc.data();

  // query items in users/uid/items collection
  const itemsQuery = userDoc.ref
  .collection('items')
  .where('published', '==', true)
  .orderBy('createdAt', 'desc')
  .limit(1);

  userItems = (await itemsQuery.get()).docs.map(itemToJSON);

  return {
    props: { user, userItems }, // pass to page
  };
}

export default function ProfilePage({ user, userItems }) {

  return (
    <main>
      <UserProfile user={user} handlePopup={handlePopup} />
      <ItemFeed items={userItems} />
    </main>
  );
}