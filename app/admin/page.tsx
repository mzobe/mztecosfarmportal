"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  picture?: string;
  category: string;
  stock: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProductName, setNewProductName] = useState("");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [newProductPrice, setNewProductPrice] = useState(0);
  const [newProductStock, setNewProductStock] = useState(0);
  const [newProductPicture, setNewProductPicture] = useState<File | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = (await res.json()) as Product[];
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [router]);

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      alert("You are not authorized to perform this action.");
      return;
    }

    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const res = await fetch("/api/products", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id }),
        });

        if (res.ok) {
          setProducts(products.filter((p) => p.id !== id));
        } else {
          const errorData = (await res.json()) as { error: string };
          alert(`Failed to delete product: ${errorData.error}`);
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("An error occurred while deleting the product.");
      }
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("admin_token");
    if (!token) {
      alert("You are not authorized to perform this action.");
      return;
    }

    let pictureUrl = "";
    if (newProductPicture) {
      const formData = new FormData();
      formData.append("file", newProductPicture);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = (await res.json()) as { url: string };
          pictureUrl = data.url;
        } else {
          alert("Failed to upload picture.");
          return;
        }
      } catch (error) {
        console.error("Error uploading picture:", error);
        alert("An error occurred while uploading the picture.");
        return;
      }
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newProductName,
          description: newProductDescription,
          price: newProductPrice,
          stock: newProductStock,
          picture: pictureUrl,
        }),
      });

      if (res.ok) {
        const newProduct = (await res.json()) as Product;
        setProducts([...products, newProduct]);
        setNewProductName("");
        setNewProductDescription("");
        setNewProductPrice(0);
        setNewProductStock(0);
        setNewProductPicture(null);
      } else {
        const errorData = (await res.json()) as { error: string };
        alert(`Failed to add product: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("An error occurred while adding the product.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Admin Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Add Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                required
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                type="text"
                value={newProductDescription}
                onChange={(e) => setNewProductDescription(e.target.value)}
                required
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(parseFloat(e.target.value))}
                required
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={newProductStock}
                onChange={(e) => setNewProductStock(parseInt(e.target.value))}
                required
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="picture">Picture</Label>
              <Input
                id="picture"
                type="file"
                onChange={(e) =>
                  setNewProductPicture(
                    e.target.files ? e.target.files[0] : null,
                  )
                }
              />
            </div>
            <Button type="submit">Add Product</Button>
          </form>
        </CardContent>
      </Card>
      <h2 className="mt-8">Products</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Picture
            </th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Name</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Price</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Stock</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <Avatar>
                  <AvatarImage src={`/images/${product.picture}`} />
                  <AvatarFallback>{product.name[0]}</AvatarFallback>
                </Avatar>
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <a href={`/products/${product.id}`}>{product.name}</a>
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                ${product.price.toFixed(2)}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {product.stock}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <button
                  onClick={() =>
                    alert("Edit functionality not implemented yet.")
                  }
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  style={{ marginLeft: "8px" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
