import AuthCheck from './AuthCheck';
import AdminButtons from './AdminButtons';
import DibsButton from './DibsButton';
import { Card, Text } from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';

export default function Item({ 
  item, 
  openEditItem, 
  handleOpenEditItem, 
  editItemCallback, 
  deleteItemCallback,
  addDibsCallback,
  removeDibsCallback
}) {

  return (
    <Card>
      <Link href={`/${item.username}`}>
        <Text h2>@{item.username}</Text>
      </Link>
      <Text h3>{item.title}</Text>
      <Image 
        src={item.image}
        alt={`${item.title}`}
        width={300}
        height={300}
        />
        <Text>{item.caption}</Text>
        <AuthCheck>
          <AdminButtons 
            openEditItem={openEditItem}
            handleOpenEditItem={handleOpenEditItem}
            editItemCallback={editItemCallback}
            itemTitle={item.title}
            deleteItemCallback={deleteItemCallback}
            />
            {/* <DibsButton
              user={item.username}
              itemTitle={item.title}
              addDibsCallback={addDibsCallback}
              removeDibsCallback={removeDibsCallback}
            /> */}
        </AuthCheck>
    </Card>
  );
}