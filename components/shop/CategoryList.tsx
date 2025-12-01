import { Category } from "@/sanity.types";
import React from "react";
import Title from "../Title";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

interface Props {
  categories: Category[];
  selectedCategory?: string | null;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string | null>>;
}

const CategoryList = ({
  categories,
  selectedCategory,
  setSelectedCategory,
}: Props) => {
  return (
    <div className="w-full bg-white p-5">
      <Title className="text-base font-black">Product Categories</Title>
      <RadioGroup
        value={selectedCategory || ""}
        className="mt-2 space-y-1"
        onValueChange={(val) => setSelectedCategory(val || null)}
      >
        {categories?.map((category) => {
          const slug = category?.slug?.current as string;
          return (
            <div
              key={category?._id}
              className="flex items-center space-x-2 hover:cursor-pointer"
            >
              <RadioGroupItem value={slug} id={slug} className="rounded-sm" />
              <Label
                htmlFor={slug}
                className={
                  selectedCategory === slug
                    ? "font-semibold text-shop_dark_green"
                    : "font-normal"
                }
              >
                {category?.title}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
      {selectedCategory && (
        <button
          onClick={() => setSelectedCategory(null)}
          className="text-sm font-medium mt-2 underline underline-offset-2 decoration-[1px] hover:text-shop_dark_green hoverEffect text-left"
        >
          Xóa lọc giá
        </button>
      )}
    </div>
  );
};

export default CategoryList;
