"use client";

import Container from "@/components/Container";
import EmptyCart from "@/components/EmptyCart";
import NoAccess from "@/components/NoAccess";
import PriceFormatter from "@/components/PriceFormatter";
import ProductSideMenu from "@/components/ProductSideMenu";
import QuantityButtons from "@/components/QuantityButtons";
import Title from "@/components/Title";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useStore from "@/store";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, ShoppingBag, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

const CartPage = () => {
  const {
    deleteCartProduct,
    getTotalPrice,
    getItemCount,
    getSubTotalPrice,
    resetCart,
  } = useStore();

  const groupedItems = useStore((state) => state.getGroupedItems());
  const { isSignedIn } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleResetCart = () => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?");
    if (confirmed) {
      resetCart();
      toast.success("Đã xóa giỏ hàng!");
    }
  };

  // 🔹 Thanh toán giả: không Stripe, không địa chỉ
  const handleCheckout = () => {
    if (!groupedItems.length) {
      toast.error("Giỏ hàng đang trống!");
      return;
    }

    if (!isSignedIn) {
      toast.error("Bạn cần đăng nhập trước khi thanh toán.");
      return;
    }

    setLoading(true);

    // Giả lập xử lý thanh toán 1.5s
    setTimeout(() => {
      resetCart();
      setLoading(false);
      setShowSuccess(true);
      toast.success("Thanh toán thành công! Đơn hàng của bạn đã được ghi nhận.");
    }, 1500);
  };

  return (
    <div className="bg-gray-50 pb-52 md:pb-10">
      {isSignedIn ? (
        <Container>
          {groupedItems?.length ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-2 py-5">
                <ShoppingBag className="text-darkColor" />
                <Title>Giỏ hàng</Title>
              </div>

              <div className="grid lg:grid-cols-3 md:gap-8">
                {/* LEFT: Cart items */}
                <div className="lg:col-span-2 rounded-lg">
                  <div className="border bg-white rounded-md">
                    {groupedItems.map(({ product }) => {
                      const itemCount = getItemCount(product?._id);
                      const images = (product as any).images as
                        | string[]
                        | undefined;
                      const slugObj = (product as any).slug;
                      const slug =
                        typeof slugObj === "string"
                          ? slugObj
                          : slugObj?.current;

                      return (
                        <div
                          key={product?._id}
                          className="border-b p-2.5 last:border-b-0 flex items-center justify-between gap-5"
                        >
                          <div className="flex flex-1 items-start gap-2 h-36 md:h-44">
                            {images && images.length > 0 && (
                              <Link
                                href={`/product/${slug}`}
                                className="border p-0.5 md:p-1 mr-2 rounded-md overflow-hidden group bg-white"
                              >
                                <Image
                                  src={images[0]}
                                  alt="productImage"
                                  width={500}
                                  height={500}
                                  loading="lazy"
                                  className="w-32 md:w-40 h-32 md:h-40 object-cover group-hover:scale-105 hoverEffect"
                                />
                              </Link>
                            )}

                            <div className="h-full flex flex-1 flex-col justify-between py-1">
                              <div className="flex flex-col gap-0.5 md:gap-1.5">
                                <h2 className="text-base font-semibold line-clamp-1">
                                  {product?.name}
                                </h2>
                                <p className="text-sm capitalize">
                                  Loại:{" "}
                                  <span className="font-semibold">
                                    {product?.variant}
                                  </span>
                                </p>
                                <p className="text-sm capitalize">
                                  Trạng thái:{" "}
                                  <span className="font-semibold">
                                    {product?.status}
                                  </span>
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <ProductSideMenu
                                        product={product}
                                        className="relative top-0 right-0"
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent className="font-bold">
                                      Thêm vào yêu thích
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Trash
                                        onClick={() => {
                                          deleteCartProduct(product?._id);
                                          toast.success(
                                            "Đã xóa sản phẩm khỏi giỏ hàng!",
                                          );
                                        }}
                                        className="w-4 h-4 md:w-5 md:h-5 mr-1 text-gray-500 hover:text-red-600 hoverEffect"
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent className="font-bold bg-red-600 text-white">
                                      Xóa sản phẩm
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </div>

                          {/* Price + quantity */}
                          <div className="flex flex-col items-end justify-between h-36 md:h-44 p-0.5 md:p-1">
                            <PriceFormatter
                              amount={(product?.price as number) * itemCount}
                              className="font-bold text-lg"
                            />
                            <QuantityButtons product={product} />
                          </div>
                        </div>
                      );
                    })}

                    <Button
                      onClick={handleResetCart}
                      className="m-5 font-semibold"
                      variant="destructive"
                    >
                      Xóa toàn bộ giỏ hàng
                    </Button>
                  </div>
                </div>

                {/* RIGHT: Order summary */}
                <div>
                  <div className="lg:col-span-1 space-y-5">
                    {/* Order summary desktop */}
                    <div className="hidden md:block w-full bg-white p-6 rounded-lg border shadow-sm">
                      <h2 className="text-xl font-semibold mb-4">
                        Tóm tắt đơn hàng
                      </h2>
                      <div className="space-y-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span>Tạm tính</span>
                          <PriceFormatter amount={getSubTotalPrice()} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Giảm giá</span>
                          <PriceFormatter
                            amount={getSubTotalPrice() - getTotalPrice()}
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between font-semibold text-lg">
                          <span>Tổng tiền</span>
                          <PriceFormatter
                            amount={getTotalPrice()}
                            className="text-lg font-bold text-black"
                          />
                        </div>
                        <Button
                          className="w-full rounded-full font-semibold tracking-wide hoverEffect mt-2"
                          size="lg"
                          disabled={loading}
                          onClick={handleCheckout}
                        >
                          {loading ? "Đang thanh toán..." : "Thanh toán"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order summary mobile */}
                <div className="md:hidden fixed bottom-0 left-0 w-full bg-white pt-2 border-t shadow-2xl">
                  <div className="bg-white p-4 rounded-t-2xl mx-0">
                    <h2 className="text-base font-semibold mb-2">
                      Tóm tắt đơn hàng
                    </h2>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Tạm tính</span>
                        <PriceFormatter amount={getSubTotalPrice()} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Giảm giá</span>
                        <PriceFormatter
                          amount={getSubTotalPrice() - getTotalPrice()}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between font-semibold text-lg">
                        <span>Tổng tiền</span>
                        <PriceFormatter
                          amount={getTotalPrice()}
                          className="text-lg font-bold text-black"
                        />
                      </div>
                      <Button
                        className="w-full rounded-full font-semibold tracking-wide hoverEffect mt-1"
                        size="lg"
                        disabled={loading}
                        onClick={handleCheckout}
                      >
                        {loading ? "Đang thanh toán..." : "Thanh toán"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyCart />
          )}

          {/* POPUP thanh toán thành công */}
          {showSuccess && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div
                className="absolute inset-0"
                onClick={() => setShowSuccess(false)}
              />
              <div className="relative z-10 w-[90%] max-w-md rounded-3xl bg-white px-8 py-7 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-center text-xl font-bold text-gray-900">
                  Thanh toán thành công!
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  Đơn hàng của bạn đã được ghi nhận. Cảm ơn bạn đã mua sắm tại
                  Shopcart.
                </p>
                <Button
                  className="mt-6 w-full rounded-full font-semibold"
                  onClick={() => setShowSuccess(false)}
                >
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </Container>
      ) : (
        <NoAccess />
      )}
    </div>
  );
};

export default CartPage;
