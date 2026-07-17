"use client";

import React, { useState } from "react";
import {
  Form,
  Fieldset,
  TextField,
  Label,
  Input,
  TextArea,
  FieldError,
  Select,
  ListBox,
  Button,
} from "@heroui/react";
import { useSession } from "@/lib/auth-client";
import { createProduct } from "@/lib/actions/product";

export default  function AddProductPage() {
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState(null);
  const {data,error} = useSession();
//   console.log("Session data:", data);
  const sellerInfo = data?.user?.email || "seller";
//   console.log("Seller Info:", sellerInfo);
const uploadImageToImgbb = async (imageFile) => {
  const formData = new FormData();

  formData.append("image", imageFile);

  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
    {
      method: "POST",
      body: formData,
    }
  );

  const result = await res.json();

  if (!result.success) {
    throw new Error("Image upload failed");
  }

  return result.data.display_url;
};


 const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData(e.currentTarget);
  const data = Object.fromEntries(formData.entries());

  const newErrors = {};

  if (!image) {
    newErrors.image = "Product image is required";
  }

  if (!data.title) {
    newErrors.title = "Product title is required";
  }

  if (!data.description) {
    newErrors.description = "Description is required";
  }

  if (!data.category) {
    newErrors.category = "Category is required";
  }

  if (!data.condition) {
    newErrors.condition = "Condition is required";
  }

  if (!data.price) {
    newErrors.price = "Price is required";
  }

  if (!data.stock) {
    newErrors.stock = "Stock quantity is required";
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setErrors({});
  setIsLoading(true);
  console.log("Form Data:", data);
console.log("Selected Image:", image);

  try {
    // Upload image to imgbb
    const imageUrl = await uploadImageToImgbb(image);
    console.log("Image URL:", imageUrl);

    // Create product object
    const productData = {
      title: data.title,
      description: data.description,
      category: data.category,
      condition: data.condition,
      price: Number(data.price),
      stock: Number(data.stock),
      image: imageUrl,
      sellerInfo,
      status: "available",
      isPubliclyVisible: true,
      createdAt: new Date(),
    };

    const res = await createProduct(productData);

    if (res.insertedId) {
      console.log("Product created:", res.insertedId);

      e.target.reset();
      setImage(null);

      alert("Product added successfully!");
    } else {
      console.error("Failed to create product:", res);
      alert("Failed to create product");
    }
  } catch (error) {
    console.error(error);
    alert("Something went wrong");
  } finally {
    setIsLoading(false);
  }
};

  const inputClass =
    "w-full bg-white border border-gray-300 hover:border-gray-400 focus:border-black rounded-lg h-12 px-3 text-sm text-gray-900 outline-none transition-all";

  const textAreaClass =
    "w-full bg-white border border-gray-300 hover:border-gray-400 focus:border-black rounded-lg p-3 text-sm text-gray-900 outline-none transition-all";

  const triggerClasses =
    "w-full flex items-center justify-between bg-white border border-gray-300 hover:border-gray-400 h-12 rounded-lg px-3 text-gray-900 transition-all";

  const popoverClasses =
    "bg-white border border-gray-200 rounded-lg shadow-lg p-1";

  const listItemClasses =
    "p-2 rounded-md hover:bg-gray-100 cursor-pointer text-gray-800";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Add Product
          </h1>

          <p className="text-gray-500 text-sm mt-2">
            Create a new product listing for your marketplace.
          </p>
        </div>

        <Form
          onSubmit={handleSubmit}
          validationErrors={errors}
          validationBehavior="aria"
          className="space-y-8"
        >
          <Fieldset className="space-y-6 w-full">
            <legend className="text-lg font-semibold text-gray-800 border-b border-gray-200 w-full pb-2">
              Product Information
            </legend>

            {/* Product Image */}
            <TextField
              name="image"
              className="flex flex-col gap-2 w-full"
            >
              <Label className="text-gray-700 text-sm font-medium">
                Product Image
              </Label>

              <Input
                type="file"
                accept="image/*"
                className={inputClass}
                onChange={(e) => setImage(e.target.files[0])}
              />
            </TextField>

            {/* Product Title */}
            <TextField
              name="title"
              isInvalid={!!errors.title}
              className="flex flex-col gap-2 w-full"
            >
              <Label className="text-gray-700 text-sm font-medium">
                Product Title
              </Label>

              <Input
                placeholder="e.g. iPhone 14 Pro Max"
                className={inputClass}
              />

              {errors.title && (
                <FieldError className="text-xs text-danger">
                  {errors.title}
                </FieldError>
              )}
            </TextField>

            {/* Description */}
            <TextField
              name="description"
              isInvalid={!!errors.description}
              className="flex flex-col gap-2 w-full"
            >
              <Label className="text-gray-700 text-sm font-medium">
                Description
              </Label>

              <TextArea
                rows={5}
                placeholder="Describe your product, features, condition, etc."
                className={textAreaClass}
              />

              {errors.description && (
                <FieldError className="text-xs text-danger">
                  {errors.description}
                </FieldError>
              )}
            </TextField>

            {/* Category */}
            <Select
              name="category"
              isInvalid={!!errors.category}
              className="w-full"
            >
              <Label className="text-gray-700 text-sm font-medium mb-2 block">
                Category
              </Label>

              <Select.Trigger className={triggerClasses}>
                <Select.Value placeholder="Select Category" />
                <Select.Indicator />
              </Select.Trigger>

              <Select.Popover className={popoverClasses}>
                <ListBox>
                  <ListBox.Item
                    id="electronics"
                    textValue="Electronics"
                    className={listItemClasses}
                  >
                    Electronics
                  </ListBox.Item>

                  <ListBox.Item
                    id="fashion"
                    textValue="Fashion"
                    className={listItemClasses}
                  >
                    Fashion
                  </ListBox.Item>

                  <ListBox.Item
                    id="home"
                    textValue="Home & Living"
                    className={listItemClasses}
                  >
                    Home & Living
                  </ListBox.Item>

                  <ListBox.Item
                    id="books"
                    textValue="Books"
                    className={listItemClasses}
                  >
                    Books
                  </ListBox.Item>

                  <ListBox.Item
                    id="sports"
                    textValue="Sports"
                    className={listItemClasses}
                  >
                    Sports
                  </ListBox.Item>

                  <ListBox.Item
                    id="others"
                    textValue="Others"
                    className={listItemClasses}
                  >
                    Others
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>

            {/* Condition */}
            <Select
              name="condition"
              isInvalid={!!errors.condition}
              className="w-full"
            >
              <Label className="text-gray-700 text-sm font-medium mb-2 block">
                Product Condition
              </Label>

              <Select.Trigger className={triggerClasses}>
                <Select.Value placeholder="Select Condition" />
                <Select.Indicator />
              </Select.Trigger>

              <Select.Popover className={popoverClasses}>
                <ListBox>
                  <ListBox.Item
                    id="used"
                    textValue="Used"
                    className={listItemClasses}
                  >
                    Used
                  </ListBox.Item>

                  <ListBox.Item
                    id="like-new"
                    textValue="Like New"
                    className={listItemClasses}
                  >
                    Like New
                  </ListBox.Item>

                  <ListBox.Item
                    id="refurbished"
                    textValue="Refurbished"
                    className={listItemClasses}
                  >
                    Refurbished
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>

            {/* Price & Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField
                name="price"
                isInvalid={!!errors.price}
                className="flex flex-col gap-2"
              >
                <Label className="text-gray-700 text-sm font-medium">
                  Price
                </Label>

                <Input
                  type="number"
                  placeholder="Enter price"
                  className={inputClass}
                />

                {errors.price && (
                  <FieldError className="text-xs text-danger">
                    {errors.price}
                  </FieldError>
                )}
              </TextField>

              <TextField
                name="stock"
                isInvalid={!!errors.stock}
                className="flex flex-col gap-2"
              >
                <Label className="text-gray-700 text-sm font-medium">
                  Stock Quantity
                </Label>

                <Input
                  type="number"
                  placeholder="Available stock"
                  className={inputClass}
                />

                {errors.stock && (
                  <FieldError className="text-xs text-danger">
                    {errors.stock}
                  </FieldError>
                )}
              </TextField>
            </div>
          </Fieldset>

          {/* Footer */}
          <div className="flex justify-end pt-6 border-t border-gray-200 w-full">
            <Button
              type="submit"
              color="primary"
              className="px-8 h-11 rounded-lg font-medium"
            >
              Add Product
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}