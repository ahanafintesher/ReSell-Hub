import { getSingleProduct } from "@/lib/actions/getSingleProduct";
import Image from "next/image";
import { Card,  Button, Chip,  } from "@heroui/react";
import WishlistButton from "@/components/wishlist/WishlistButon";

const Page = async ({ params }) => {
  const { id } = await params;

  const data = await getSingleProduct(id);

  

  return (
    <div className="max-w-7xl mx-auto px-5 py-10">
      <Card className="shadow-xl">
        <Card.Header className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6">

          {/* Product Image */}
          <div className="flex items-center justify-center bg-gray-100 rounded-2xl p-8">
            <Image
              src={data.image}
              alt={data.title}
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

              <h1 className="text-4xl font-bold mt-4">
                {data.title}
              </h1>

              <p className="text-default-500 mt-4 leading-7">
                {data.description}
              </p>
            </div>

            

            <div className="space-y-4">

              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">
                  Price:
                </span>

                <span className="text-4xl font-bold text-success">
                  ${data.price}
                </span>
              </div>

              
            </div>

            

            <div className="flex gap-4 flex-wrap">
             <form action={'/api/payments'} method="POST">
              <input type="hidden" name="price" value={data.price}/>
              <input type="hidden" name="title" value={data.title}/>
              <input type="hidden" name="productId" value={data._id}/>
              <Button
                type="submit"
                className={'bg-green-400 text-white'}
                color="secondary"
                variant="bordered"
                size="lg"
              >
                Buy Now
              </Button>
             </form>

              <WishlistButton></WishlistButton>
            </div>

          </div>
        </Card.Header>
      </Card>
    </div>
  );

  
};

export default Page;