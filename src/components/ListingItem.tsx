import React from 'react';

interface ListingItemProps {
  listing: {
    name: string;
    // Add other properties of `listing` here if needed
  };
  id: string;
}

const ListingItem: React.FC<ListingItemProps> = ({ listing, id }) => {
  return <div>{listing.name}</div>;
};

export default ListingItem;
