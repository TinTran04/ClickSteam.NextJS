import { Metadata } from "@/actions/createCheckoutSession";
import stripe from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "No Signature found for stripe" },
      { status: 400 },
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.log("Stripe webhook secret is not set");
    return NextResponse.json(
      { error: "Stripe webhook secret is not set" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: `Webhook Error: ${error}` },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const invoice = session.invoice
      ? await stripe.invoices.retrieve(session.invoice as string)
      : null;

    try {
      await createOrderInDb(session, invoice);
    } catch (error) {
      console.error("Error creating order in DB:", error);
      return NextResponse.json(
        { error: `Error creating order: ${error}` },
        { status: 400 },
      );
    }
  }

  return NextResponse.json({ received: true });
}

/**
 * Tạo Order + OrderItems trong Prisma, đồng thời trừ stock sản phẩm.
 */
async function createOrderInDb(
  session: Stripe.Checkout.Session,
  invoice: Stripe.Invoice | null,
) {
  const { id, amount_total, metadata, payment_status } = session;

  const {
    orderNumber,
    customerName,
    customerEmail,
    userId,
    address,
  } = metadata as unknown as Metadata & { address?: string };

  if (!userId) {
    throw new Error("userId is missing in Stripe session metadata");
  }

  const parsedAddress = address ? JSON.parse(address) : null;

  // Lấy line items + product (có metadata.id = id product trong Prisma)
  const lineItemsWithProduct = await stripe.checkout.sessions.listLineItems(
    id,
    { expand: ["data.price.product"] },
  );

  const itemsData = lineItemsWithProduct.data
    .map((item) => {
      const stripeProduct = item.price?.product as Stripe.Product | null;
      const productId = stripeProduct?.metadata?.id as string | undefined;

      if (!productId) return null;

      const quantity = item.quantity ?? 0;
      const unitAmount = item.price?.unit_amount ?? 0; // đơn giá (cents)

      return {
        productId,
        quantity,
        price: unitAmount / 100, // chuyển về đơn vị tiền (VD: USD, VND…)
      };
    })
    .filter(
      (i): i is { productId: string; quantity: number; price: number } =>
        i !== null,
    );

  if (!itemsData.length) {
    throw new Error("No valid line items found for this session");
  }

  // Transaction: lưu Address (nếu có) + tạo Order + OrderItems + trừ stock
  return prisma.$transaction(async (tx) => {
    // 1. Lưu Address (nếu metadata có gửi)
    if (parsedAddress) {
      await tx.address.create({
        data: {
          userId,                               // dùng Cognito userId
          name: parsedAddress.name,
          addressLine1: parsedAddress.address,  // map sang line1
          addressLine2: null,                   // không có thì để null
          city: parsedAddress.city,
          state: parsedAddress.state,
          zipCode: parsedAddress.zip,
          country: parsedAddress.country || "Vietnam",
        },
      });
    }

    // 2. Tạo Order + OrderItems
    const order = await tx.order.create({
      data: {
        userId,
        orderNumber,
        status: "paid", // tuỳ bạn: "paid" / "completed"
        totalPrice: Math.round((amount_total ?? 0) / 100),
        paymentStatus: payment_status ?? "paid",

        items: {
          create: itemsData.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            // nếu OrderItem.price là Int: dùng Math.round
            price: Math.round(item.price),
          })),
        },
      },
    });

    // 3. Trừ stock từng product
    for (const item of itemsData) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return order;
  });
}
