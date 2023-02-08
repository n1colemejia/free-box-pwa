import Item from '@/components/Item';
import { Container, Button} from "@nextui-org/react";

export default function ItemFeed({ items, loading, itemsEnd, getMoreItemsCallback, home, openEditItem, handleOpenEditItem, editItemCallback }) {
  
  const itemsFeed = items ? items.map(
    (item) => 
    <Item 
      item={item}
      key={item.title} 
      openEditItem={openEditItem}
      handleOpenEditItem={handleOpenEditItem}
      editItemCallback={editItemCallback}
      />
    ) : null;
  
  return (
    <Container>
      {itemsFeed}
      {home && !loading && !itemsEnd && <Button onPress={getMoreItemsCallback}>Load More Stuff</Button>}
    </Container>
  );
}