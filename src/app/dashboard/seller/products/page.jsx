"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Spinner,
  Chip,
} from "@heroui/react";

import { Pencil, Plus, TrashBin } from "@gravity-ui/icons";
import { getMyProducts } from "@/lib/actions/myProducts";
import { useSession } from "@/lib/auth-client";

const categoryColorMap = {
  electronics: "primary",
  fashion: "secondary",
  "home & living": "success",
  books: "warning",
  sports: "danger",
  others: "default",
};

export default function ManageMyProducts() {
  const { data: session } = useSession();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const sellerInfo = session?.user?.email;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyProducts(sellerInfo);
      setProducts(data);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sellerInfo) fetchProducts();
  }, [sellerInfo]);

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;

    try {
      setDeletingId(id);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/my-products?id=${id}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error();

      await fetchProducts();
    } catch (err) {
      alert("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  } 

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage My Products</h1>

          <Button color="primary">
            <Plus width={16} height={16} />
            Add New
          </Button>
        </div>

        {/* Table */}
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="My Products Table">

              {/* HEADER */}
              <Table.Header>
                <Table.Column>Product</Table.Column>
                <Table.Column>Category</Table.Column>
                <Table.Column>Price</Table.Column>
                <Table.Column>Stock</Table.Column>
                <Table.Column>Status</Table.Column>
                <Table.Column>Actions</Table.Column>
              </Table.Header>

              {/* BODY */}
              <Table.Body>
                {products.map((p) => (
                  <Table.Row key={p._id} id={p._id}>

                    <Table.Cell>
                      <div>
                        <p className="font-medium">{p.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {p.description}
                        </p>
                      </div>
                    </Table.Cell>

                    <Table.Cell>
                      <Chip size="sm" color={categoryColorMap[p.category] || "default"}>
                        {p.category}
                      </Chip>
                    </Table.Cell>

                    <Table.Cell>৳ {p.price}</Table.Cell>
                    <Table.Cell>{p.stock}</Table.Cell>

                    <Table.Cell>
                      <Chip size="sm" color={p.status === "active" ? "success" : "danger"}>
                        {p.status}
                      </Chip>
                    </Table.Cell>

                    <Table.Cell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="flat">
                          <Pencil width={16} height={16} />
                        </Button>

                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          isLoading={deletingId === p._id}
                          onPress={() => handleDelete(p._id)}
                        >
                          <TrashBin width={16} height={16} />
                        </Button>
                      </div>
                    </Table.Cell>

                  </Table.Row>
                ))}
              </Table.Body>

            </Table.Content>
          </Table.ScrollContainer>
        </Table>

      </div>
    </div>
  );
}