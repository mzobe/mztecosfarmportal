"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  picture?: string;
  category: string;
  stock: number;
}

import { useParams } from "next/navigation";

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        const data = (await res.json()) as Product;
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <Card>
        <CardHeader>
          <Avatar>
            <AvatarImage src={product.picture} />
            <AvatarFallback>{product.name[0]}</AvatarFallback>
          </Avatar>
          <CardTitle>{product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{product.description}</p>
          <p>Price: ${product.price.toFixed(2)}</p>
          <p>Stock: {product.stock}</p>
        </CardContent>
      </Card>
    </div>
  );
}
