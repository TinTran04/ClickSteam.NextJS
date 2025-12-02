"use client";

import NoAccess from "@/components/NoAccess";
import WishListProducts from "@/components/WishListProducts";
import { useAuth } from "@/contexts/AuthContext";
import React from "react";

const WishListPage = () => {
  const { isSignedIn } = useAuth();

  return (
    <>
      {isSignedIn ? (
        <WishListProducts />
      ) : (
        <NoAccess details="Log in to view your wishlist items. Don’t miss out on your cart products to make the payment!" />
      )}
    </>
  );
};

export default WishListPage;
