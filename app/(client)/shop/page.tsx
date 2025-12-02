// app/(client)/shop/page.tsx
import React, { Suspense } from "react";
import Shop from "@/components/Shop";
import prisma from "@/lib/prisma";

// Map category từ Prisma sang dạng giống Category của Sanity
type UiCategory = {
  _id: string;
  title: string;
  slug: { current: string };
  image?: any;
};

// Map brand từ Prisma sang dạng giống BRANDS_QUERYResult
type UiBrand = {
  _id: string;
  name: string;
  slug: { current: string };
  brandName: string;
  image?: string | null;
};

const ShopPage = async () => {
  // Lấy categories + brands từ Postgres (Prisma)
  const [categoriesFromDb, brandsFromDb] = await Promise.all([
    prisma.category.findMany({
      orderBy: { title: "asc" },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  // Convert sang dạng UI
  const categories: UiCategory[] = categoriesFromDb.map((c) => ({
    _id: c.id,
    title: c.title,
    slug: { current: c.slug },
  }));

  const brands: UiBrand[] = brandsFromDb.map((b) => ({
    _id: b.id,
    name: b.name,
    slug: { current: b.slug },
    brandName: b.name,
    image: b.imageUrl,
  }));

  return (
    <div className="bg-white">
      {/* Bọc Shop trong Suspense để thỏa yêu cầu useSearchParams */}
      <Suspense fallback={<div className="p-4">Loading products...</div>}>
        {/* ép kiểu any để tái sử dụng component Shop cũ */}
        <Shop categories={categories as any} brands={brands as any} />
      </Suspense>
    </div>
  );
};

export default ShopPage;
