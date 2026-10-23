import { getSingleProduct } from "@/lib/actions/getSingleProduct";
import Image from "next/image";
import { Card, Button, Chip } from "@heroui/react";
import WishlistButton from "@/components/wishlist/WishlistButon";
import ReviewSection from "@/components/ReviewSection/ReviewSection";
import AvgRating from "@/components/ReviewSection/AvgRating";
import UserReviewSection from "@/components/ReviewSection/UserReviewSection";



import Link from "next/link";

const Page = async ({ params }) => {
  const resolvedParams = await params;
  const rawId = resolvedParams?.id;
  const productId = Array.isArray(rawId) ? rawId[0] : rawId;

  let data = null;
  try {
    if (productId) {
      data = await getSingleProduct(productId);
    }
  } catch (err) {
    console.error("Failed to load product:", err);
  }

  if (!data || !data._id || data.message) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Product Not Found</h1>
        <p className="text-gray-500 mb-6">
          The item you are looking for does not exist or may have been removed.
        </p>
        <Link href="/products">
          <Button color="primary" className="bg-green-600 text-white font-medium px-6 py-2">
            Browse All Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 py-10">
      <Card className="shadow-xl">
        <Card.Header className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6">
          {/* Product Image */}
          <div className="flex items-center justify-center bg-gray-100 rounded-2xl p-8">
            <Image
              src={data.image || "/placeholder.png"}
              alt={data.title || "Product"}
              width={500}
              height={500}
              className="object-contain max-h-[500px]"
              priority
            />
          </div>

          {/* Product Information */}
          <div className="flex flex-col justify-between space-y-5">
            <div>
              <Chip color="primary" variant="flat">
                {data.category}
              </Chip>

              <h1 className="text-4xl font-bold mt-4">{data.title}</h1>

              <p className="text-default-500 mt-4 leading-7">
                {data.description}
              </p>
            </div>

            <div>
              <AvgRating data={data}></AvgRating>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">Price:</span>

                <span className="text-4xl font-bold text-success">
                  ${data.price}
                </span>
              </div>
            </div>

            <div className="flex gap-4 flex-wrap">
              <form action={"/api/payments"} method="POST">
                <input type="hidden" name="price" value={data.price} />
                <input type="hidden" name="title" value={data.title} />
                <input type="hidden" name="productId" value={data._id} />
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 shadow-xs"
                  size="lg"
                >
                  Buy Now
                </Button>
              </form>

              <WishlistButton product={data}></WishlistButton>
            </div>
          </div>
        </Card.Header>
      </Card>

      <ReviewSection data={data}></ReviewSection>
      <UserReviewSection data={data}></UserReviewSection>
    </div>
  );
};

export default Page;
