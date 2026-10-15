"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowBigDown,
  ArrowBigUp,
  Flame,
  Hash,
  MessageSquarePlus,
  Pin,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/ui";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { demoForumPosts } from "@/lib/mock-data";
import type { ForumPost } from "@/lib/types";
import { encodeForumHash, relativeTime, shortAddress } from "@/lib/utils";
import { FORUM_TOLL } from "@/lib/config";

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>(demoForumPosts);
  const [content, setContent] = useState("");
  const [sort, setSort] = useState("recientes");
  const [voted, setVoted] = useState<Record<string, 1 | -1>>({});

  const publish = () => {
    if (content.trim().length < 8) {
      toast.error("Escribe un mensaje un poco más largo");
      return;
    }
    const createdAt = new Date().toISOString();
    const hash = encodeForumHash({
      author: "tú",
      content,
      createdAt,
    });
    const post: ForumPost = {
      id: `p-${Date.now()}`,
      authorId: "me",
      authorName: "Tú",
      authorTier: "Plata",
      content: content.trim(),
      createdAt,
      upvotes: 0,
      downvotes: 0,
      comments: 0,
      hash,
      anchorTx: `0x${Date.now().toString(16)}…`,
      refundable: false,
    };
    setPosts((prev) => [post, ...prev]);
    setContent("");
    toast.success(`Publicado · peaje ${FORUM_TOLL} ZAM retenido`, {
      description: `Se devuelve cuando alcances 5 upvotes. Hash anclado on-chain.`,
    });
  };

  const vote = (id: string, dir: 1 | -1) => {
    if (voted[id] === dir) return;
    setVoted((prev) => ({ ...prev, [id]: dir }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              upvotes: p.upvotes + (dir === 1 ? 1 : 0),
              downvotes: p.downvotes + (dir === -1 ? 1 : 0),
            }
          : p,
      ),
    );
  };

  const tip = (post: ForumPost) => {
    toast.success(`Enviaste 5 ZAM a ${post.authorName}`, {
      description: "Transferencia social entre estudiantes.",
    });
  };

  const boost = (post: ForumPost) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, pinned: true } : p)),
    );
    toast.success("Publicación destacada", {
      description: "Se quemaron 15 ZAMORA por el boost.",
    });
  };

  const sorted = [...posts].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (b.pinned && !a.pinned) return 1;
    if (sort === "populares") return b.upvotes - a.upvotes;
    return +new Date(b.createdAt) - +new Date(a.createdAt);
  });

  return (
    <div>
      <PageHeader
        title="Foro del campus"
        description="Comparte, pregunta y ayuda. Todo post queda anclado on-chain con prueba de autoría."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="mb-5">
            <CardContent className="p-4">
              <Textarea
                placeholder="¿Qué quieres compartir con el campus?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-brand" />
                  Peaje {FORUM_TOLL} ZAM · se devuelve con 5 upvotes
                </span>
                <Button variant="gradient" size="sm" onClick={publish}>
                  <Send className="h-4 w-4" />
                  Publicar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs value={sort} onValueChange={setSort} className="mb-4">
            <TabsList>
              <TabsTrigger value="recientes">Recientes</TabsTrigger>
              <TabsTrigger value="populares">Populares</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            {sorted.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card
                  className={post.pinned ? "border-brand/40 bg-brand/[0.03]" : ""}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>
                            {post.authorName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">
                            {post.authorName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {post.authorTier} · {relativeTime(post.createdAt)}
                            {post.subject ? ` · ${post.subject}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {post.pinned && (
                          <Badge variant="default">
                            <Pin className="mr-1 h-3 w-3" /> Destacado
                          </Badge>
                        )}
                        {post.refundable && (
                          <Badge variant="success">Peaje devuelto</Badge>
                        )}
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed">{post.content}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1 font-mono">
                        <Hash className="h-3 w-3" />
                        {shortAddress(post.hash, 4)}
                      </span>
                      <span>tx {shortAddress(post.anchorTx, 3)}</span>
                    </div>

                    <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                      <button
                        onClick={() => vote(post.id, 1)}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          voted[post.id] === 1
                            ? "bg-brand/15 text-brand"
                            : "text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        <ArrowBigUp className="h-4 w-4" />
                        {post.upvotes}
                      </button>
                      <button
                        onClick={() => vote(post.id, -1)}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          voted[post.id] === -1
                            ? "bg-red-500/15 text-red-500"
                            : "text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        <ArrowBigDown className="h-4 w-4" />
                        {post.downvotes}
                      </button>
                      <span className="ml-1 text-xs text-muted-foreground">
                        {post.comments} comentarios
                      </span>
                      <div className="ml-auto flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => tip(post)}
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Dar propina
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => boost(post)}
                        >
                          <Flame className="h-3.5 w-3.5" />
                          Boost
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h3 className="flex items-center gap-2 font-display font-bold">
                <MessageSquarePlus className="h-4 w-4 text-brand" />
                Reglas del foro
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Peaje de {FORUM_TOLL} ZAM para publicar.</li>
                <li>• Se devuelve si tu post logra 5 upvotes.</li>
                <li>• Se quema si un moderador lo retira.</li>
                <li>• Dar propina transfiere ZAMORA directo.</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h3 className="font-display font-bold">Top semanal</h3>
              <ol className="mt-3 space-y-2 text-sm">
                {demoForumPosts
                  .slice()
                  .sort((a, b) => b.upvotes - a.upvotes)
                  .slice(0, 3)
                  .map((p, i) => (
                    <li key={p.id} className="flex items-center gap-3">
                      <span className="grid h-6 w-6 place-items-center rounded-lg bg-brand/10 text-xs font-bold text-brand">
                        {i + 1}
                      </span>
                      <span className="line-clamp-1 flex-1 text-muted-foreground">
                        {p.content}
                      </span>
                      <span className="text-xs font-bold">{p.upvotes}▲</span>
                    </li>
                  ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
