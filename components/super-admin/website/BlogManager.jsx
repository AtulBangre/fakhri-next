"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
    Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, FileText, Image as ImageIcon
} from "lucide-react";
import { blogPosts, blogCategories } from "@/data/blog";
import { seoData } from "@/data/company";

export default function BlogManager() {
    // Using real data structure from @/data/blog
    const [blogs, setBlogs] = useState(blogPosts);
    const [seo, setSeo] = useState(seoData.blog || { title: "", description: "", keywords: "" });
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Toggle for SEO editing in main view
    const [isEditingSeo, setIsEditingSeo] = useState(false);

    // New Blog State matching data properties
    const [newBlog, setNewBlog] = useState({
        title: "",
        excerpt: "",
        category: "",
        author: "Admin",
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        publishDate: new Date().toISOString().split('T')[0],
        readTime: "5 min read",
        slug: "",
        thumbnail: ""
    });

    const filteredBlogs = blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this blog post?")) {
            setBlogs(blogs.filter(blog => blog.id !== id));
        }
    };

    const handleCreate = () => {
        const id = blogs.length + 1;
        setBlogs([...blogs, { ...newBlog, id }]);
        setIsCreating(false);
        setNewBlog({
            title: "",
            excerpt: "",
            category: "",
            author: "Admin",
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            publishDate: new Date().toISOString().split('T')[0],
            readTime: "5 min read",
            slug: "",
            thumbnail: ""
        });
    };

    if (isCreating) {
        return (
            <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Create New Blog Post</h3>
                    <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-4">
                        <div className="space-y-2">
                            <Label>Blog Title</Label>
                            <Input
                                placeholder="Enter catchy title..."
                                value={newBlog.title}
                                onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input
                                placeholder="url-friendly-slug"
                                value={newBlog.slug}
                                onChange={(e) => setNewBlog({ ...newBlog, slug: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Excerpt</Label>
                            <Textarea
                                className="min-h-[100px]"
                                placeholder="Short description..."
                                value={newBlog.excerpt}
                                onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Full Content (Markdown supported)</Label>
                            <Textarea
                                className="min-h-[300px]"
                                placeholder="# Write your blog content here..."
                            // Assuming content would be added to the data structure if it was there, but currently data/blog only has excerpts/metadata
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Publish Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <select
                                        className="w-full p-2 border rounded-md"
                                        value={newBlog.category}
                                        onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })}
                                    >
                                        <option value="">Select Category</option>
                                        {blogCategories.filter(c => c.name !== 'All').map(cat => (
                                            <option key={cat.slug} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Author</Label>
                                    <Input
                                        value={newBlog.author}
                                        onChange={(e) => setNewBlog({ ...newBlog, author: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Read Time</Label>
                                    <Input
                                        value={newBlog.readTime}
                                        onChange={(e) => setNewBlog({ ...newBlog, readTime: e.target.value })}
                                    />
                                </div>
                                <div className="pt-4">
                                    <Button className="w-full" onClick={handleCreate}>
                                        Save Post
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Featured Image</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label>Image URL</Label>
                                    <Input
                                        value={newBlog.thumbnail}
                                        onChange={(e) => setNewBlog({ ...newBlog, thumbnail: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="mt-4 border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                                    {newBlog.thumbnail ? (
                                        <img src={newBlog.thumbnail} alt="Thumbnail preview" className="max-h-32 object-cover rounded" />
                                    ) : (
                                        <>
                                            <ImageIcon className="w-8 h-8 mb-2" />
                                            <span className="text-sm">Preview</span>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold">Blog Management</h3>
                    <p className="text-sm text-muted-foreground">Manage your blog posts, articles, and news.</p>
                </div>
                <Button onClick={() => setIsCreating(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Post
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search posts..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredBlogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No blog posts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredBlogs.map((blog) => (
                                <TableRow key={blog.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <div className="flex flex-col">
                                                <span className="truncate max-w-[200px]" title={blog.title}>{blog.title}</span>
                                                <span className="text-xs text-muted-foreground truncate max-w-[200px]">{blog.slug}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{blog.category}</Badge>
                                    </TableCell>
                                    <TableCell>{blog.author}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {blog.date}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>
                                                    <Eye className="mr-2 h-4 w-4" /> View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => handleDelete(blog.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* SEO Section */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>SEO Settings (Blog Page)</CardTitle>
                        {isEditingSeo ? (
                            <div className="space-x-2">
                                <Button variant="outline" size="sm" onClick={() => setIsEditingSeo(false)}>Cancel</Button>
                                <Button size="sm" onClick={() => { console.log("Saving Blog SEO:", seo); setIsEditingSeo(false); }}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save SEO
                                </Button>
                            </div>
                        ) : (
                            <Button size="sm" variant="outline" onClick={() => setIsEditingSeo(true)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit SEO
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Meta Title</Label>
                        <Input
                            disabled={!isEditingSeo}
                            value={seo.title}
                            onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Meta Description</Label>
                        <Textarea
                            disabled={!isEditingSeo}
                            value={seo.description}
                            onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Keywords</Label>
                        <Input
                            disabled={!isEditingSeo}
                            value={seo.keywords}
                            onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
