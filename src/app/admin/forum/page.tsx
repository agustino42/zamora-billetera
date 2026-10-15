"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pin, ShieldAlert, Trash2 } from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/ui";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { demoForumPosts } from "@/lib/mock-data";
import type { ForumPost } from "@/lib/types";
import { relativeTime } from "@/lib/utils";

export default function AdminForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>(demoForumPosts);

  const remove = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Publicación removida · peaje quemado");
  };

  const togglePin = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p)),
    );
    toast.success("Fijado actualizado");
  };

  const columns: Column<ForumPost>[] = [
    {
      key: "content",
      header: "Publicación",
      primary: true,
      render: (p) => (
        <div className="max-w-md">
          <p className="line-clamp-2 text-sm">{p.content}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {p.authorName} · {p.subject ?? "General"} · {relativeTime(p.createdAt)}
          </p>
        </div>
      ),
    },
    {
      key: "votes",
      header: "Votos",
      sortValue: (p) => p.upvotes - p.downvotes,
      render: (p) => (
        <span className="text-sm">
          <span className="font-bold text-emerald-500">{p.upvotes}</span>
          {" / "}
          <span className="font-bold text-red-500">{p.downvotes}</span>
        </span>
      ),
    },
    {
      key: "reports",
      header: "Reportes",
      render: () => <Badge variant="muted">{Math.floor(Math.random() * 3)}</Badge>,
    },
    {
      key: "hash",
      header: "Hash",
      render: (p) => (
        <span className="font-mono text-xs text-muted-foreground">{p.hash}</span>
      ),
    },
    {
      key: "actions",
      header: "Moderar",
      render: (p) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => togglePin(p.id)}>
            <Pin className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => remove(p.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Moderación del foro"
        description="Revisa publicaciones reportadas. Al remover una publicación, su peaje se quema."
      />

      <div className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard
          label="Publicaciones"
          value={posts.length}
          icon={<ShieldAlert className="h-4 w-4" />}
          accent
        />
        <StatCard label="Fijadas" value={posts.filter((p) => p.pinned).length} />
        <StatCard
          label="Devolvibles"
          value={posts.filter((p) => p.refundable).length}
        />
        <StatCard
          label="Peaje"
          value="5 ZAM"
          hint="Reembolsable con 5 upvotes"
        />
      </div>

      <DataTable
        columns={columns}
        data={posts}
        searchable
        searchKeys={["content", "authorName"]}
      />
    </div>
  );
}
