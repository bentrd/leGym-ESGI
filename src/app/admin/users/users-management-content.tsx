"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, Search, Mail, Calendar, Building2 } from "lucide-react";

type User = {
  id: number;
  authUserId: string;
  role: string;
  createdAt: Date;
  authUser: {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
  } | null;
  gyms?: Array<{
    id: number;
    name: string;
    slug: string;
    status: string;
  }>;
};

type UsersManagementContentProps = {
  users: User[];
};

export function UsersManagementContent({ users: initialUsers }: UsersManagementContentProps) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "",
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "CLIENT":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "GYM_OWNER":
        return "bg-purple-100 text-purple-800 border border-purple-300";
      case "SUPER_ADMIN":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "CLIENT":
        return "Client";
      case "GYM_OWNER":
        return "Propriétaire";
      case "SUPER_ADMIN":
        return "Super Admin";
      default:
        return role;
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.authUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.authUser?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      name: user.authUser?.name || "",
      email: user.authUser?.email || "",
      role: user.role,
    });
  };

  const handleEditSubmit = async () => {
    if (!editingUser) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la mise à jour");
      }

      const { data: updatedUser } = await response.json();
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                role: updatedUser.role,
                authUser: u.authUser
                  ? {
                      ...u.authUser,
                      name: updatedUser.authUser.name,
                      email: updatedUser.authUser.email,
                    }
                  : null,
              }
            : u,
        ),
      );
      setEditingUser(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erreur lors de la mise à jour");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUserId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${deletingUserId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la suppression");
      }

      setUsers((prev) => prev.filter((u) => u.id !== deletingUserId));
      setDeletingUserId(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erreur lors de la suppression");
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    total: users.length,
    clients: users.filter((u) => u.role === "CLIENT").length,
    owners: users.filter((u) => u.role === "GYM_OWNER").length,
    admins: users.filter((u) => u.role === "SUPER_ADMIN").length,
  };

  return (
    <main className="container mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">Gestion des utilisateurs</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Gérez les comptes clients et propriétaires de salles
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.clients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Propriétaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.owners}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.admins}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les rôles</SelectItem>
                <SelectItem value="CLIENT">Clients</SelectItem>
                <SelectItem value="GYM_OWNER">Propriétaires</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/profil/${user.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        <h3 className="text-base font-semibold sm:text-lg">
                          {user.authUser?.name || "Sans nom"}
                        </h3>
                      </Link>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-2 break-all sm:break-normal">
                        <Mail className="h-4 w-4 shrink-0" />
                        {user.authUser?.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Inscrit le{" "}
                        {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user.role === "GYM_OWNER" && user.gyms && user.gyms.length > 0 && (
                      <Link href={`/salles/${user.gyms[0].slug}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Voir la salle"
                          className="w-full sm:w-auto"
                        >
                          <Building2 className="mr-2 h-4 w-4 sm:mr-0" />
                          <span className="sm:hidden">Voir la salle</span>
                        </Button>
                      </Link>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleEditClick(user)}
                      className="flex-1 sm:flex-none"
                      startIcon={<Edit className="h-4 w-4" />}
                    >
                      <span className="sm:hidden">Modifier</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeletingUserId(user.id)}
                      className="flex-1 sm:flex-none"
                      startIcon={<Trash2 className="h-4 w-4" />}
                    >
                      <span className="sm:hidden">Supprimer</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l&apos;utilisateur</DialogTitle>
            <DialogDescription>Modifiez les informations de l&apos;utilisateur</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nom</label>
              <Input
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Nom de l'utilisateur"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                placeholder="email@exemple.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Rôle</label>
              <Select
                value={editFormData.role}
                onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLIENT">Client</SelectItem>
                  <SelectItem value="GYM_OWNER">Propriétaire</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingUser(null)} disabled={isLoading}>
              Annuler
            </Button>
            <Button onClick={handleEditSubmit} disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingUserId} onOpenChange={() => setDeletingUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible et
              supprimera toutes les données associées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeletingUserId(null)} disabled={isLoading}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
