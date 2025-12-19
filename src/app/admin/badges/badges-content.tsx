"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Loader2, Pencil, Plus, Save, Trash2, Award, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { renderError } from "@/components/ui/error-message";
import {
  badgeSchema,
  rewardRuleSchema,
  ruleFieldSchema,
  ruleOperatorSchema,
  getRuleFieldLabel,
  getRuleOperatorLabel,
  type RewardRuleFormData,
  type RuleField,
  type RuleOperator,
} from "@/lib/validators/badge";

type Badge = {
  id: number;
  name: string;
  icon: string | null;
  rewardRule: {
    id: number;
    name: string;
    criteria: string;
  } | null;
  _count: {
    awards: number;
  };
};

type BadgesContentProps = {
  badges: Badge[];
};

function mapRGBToTailwindColor(
  r: number,
  g: number,
  b: number,
): { bg: string; text: string; hover: string; borderColor: string } {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  if (delta === 0) {
    return {
      bg: "bg-gray-50",
      text: "text-gray-700",
      hover: "hover:bg-gray-100",
      borderColor: "rgb(229, 231, 235)",
    };
  }

  let hue = 0;
  if (max === r) {
    hue = ((g - b) / delta) % 6;
  } else if (max === g) {
    hue = (b - r) / delta + 2;
  } else {
    hue = (r - g) / delta + 4;
  }
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;

  if (hue >= 0 && hue < 15)
    return {
      bg: "bg-red-50",
      text: "text-red-700",
      hover: "hover:bg-red-100",
      borderColor: "rgb(254, 202, 202)",
    };
  if (hue >= 15 && hue < 45)
    return {
      bg: "bg-orange-50",
      text: "text-orange-700",
      hover: "hover:bg-orange-100",
      borderColor: "rgb(254, 215, 170)",
    };
  if (hue >= 45 && hue < 75)
    return {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      hover: "hover:bg-yellow-100",
      borderColor: "rgb(254, 240, 138)",
    };
  if (hue >= 75 && hue < 150)
    return {
      bg: "bg-green-50",
      text: "text-green-700",
      hover: "hover:bg-green-100",
      borderColor: "rgb(187, 247, 208)",
    };
  if (hue >= 150 && hue < 200)
    return {
      bg: "bg-teal-50",
      text: "text-teal-700",
      hover: "hover:bg-teal-100",
      borderColor: "rgb(153, 246, 228)",
    };
  if (hue >= 200 && hue < 260)
    return {
      bg: "bg-blue-50",
      text: "text-blue-700",
      hover: "hover:bg-blue-100",
      borderColor: "rgb(191, 219, 254)",
    };
  if (hue >= 260 && hue < 290)
    return {
      bg: "bg-purple-50",
      text: "text-purple-700",
      hover: "hover:bg-purple-100",
      borderColor: "rgb(221, 214, 254)",
    };
  if (hue >= 290 && hue < 330)
    return {
      bg: "bg-pink-50",
      text: "text-pink-700",
      hover: "hover:bg-pink-100",
      borderColor: "rgb(251, 207, 232)",
    };
  return {
    bg: "bg-red-50",
    text: "text-red-700",
    hover: "hover:bg-red-100",
    borderColor: "rgb(254, 202, 202)",
  };
}

export function BadgesContent({ badges: initialBadges }: BadgesContentProps) {
  const router = useRouter();
  const [badges, setBadges] = useState(initialBadges);
  const [isBadgeDialogOpen, setIsBadgeDialogOpen] = useState(false);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [selectedBadgeForRule, setSelectedBadgeForRule] = useState<Badge | null>(null);
  const [editingRule, setEditingRule] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [emojiColors, setEmojiColors] = useState<
    Record<number, { bg: string; text: string; hover: string; borderColor: string }>
  >({});

  const refreshBadges = async () => {
    const listRes = await fetch("/api/admin/badges");
    if (!listRes.ok) return;

    const payload = (await listRes.json().catch(() => null)) as unknown;
    const maybeEnvelope =
      payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)
        ? (payload as { data?: unknown }).data
        : payload;

    if (Array.isArray(maybeEnvelope)) {
      setBadges(maybeEnvelope as Badge[]);
    } else {
      console.error("Unexpected badges payload shape:", payload);
    }
  };

  useEffect(() => {
    const extractColors = () => {
      const colors: Record<
        number,
        { bg: string; text: string; hover: string; borderColor: string }
      > = {};

      badges.forEach((badge) => {
        if (!badge.icon) {
          colors[badge.id] = {
            bg: "bg-gray-50",
            text: "text-gray-700",
            hover: "hover:bg-gray-100",
            borderColor: "rgb(229, 231, 235)",
          };
          return;
        }

        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            colors[badge.id] = {
              bg: "bg-gray-50",
              text: "text-gray-700",
              hover: "hover:bg-gray-100",
              borderColor: "rgb(229, 231, 235)",
            };
            return;
          }

          canvas.width = 64;
          canvas.height = 64;
          ctx.font = "56px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(badge.icon, 32, 32);

          const imageData = ctx.getImageData(0, 0, 64, 64);
          const pixels = imageData.data;

          const colorCounts: { [key: string]: number } = {};
          let totalPixels = 0;

          for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const a = pixels[i + 3];

            if (a < 128 || (r > 250 && g > 250 && b > 250)) continue;

            const colorKey = `${Math.floor(r / 10)},${Math.floor(g / 10)},${Math.floor(b / 10)}`;
            colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
            totalPixels++;
          }

          if (totalPixels === 0) {
            colors[badge.id] = {
              bg: "bg-gray-50",
              text: "text-gray-700",
              hover: "hover:bg-gray-100",
              borderColor: "rgb(229, 231, 235)",
            };
            return;
          }

          let dominantColor = "12,12,12";
          let maxCount = 0;
          for (const [color, count] of Object.entries(colorCounts)) {
            if (count > maxCount) {
              maxCount = count;
              dominantColor = color;
            }
          }

          const [r, g, b] = dominantColor.split(",").map((n) => Number(n) * 10);
          colors[badge.id] = mapRGBToTailwindColor(r, g, b);
        } catch (error) {
          console.error("Error extracting emoji color:", error);
          colors[badge.id] = {
            bg: "bg-gray-50",
            text: "text-gray-700",
            hover: "hover:bg-gray-100",
            borderColor: "rgb(229, 231, 235)",
          };
        }
      });

      setEmojiColors(colors);
    };

    extractColors();
  }, [badges]);

  const badgeForm = useForm({
    defaultValues: {
      name: "",
      icon: "",
      ruleName: "",
      field: "totalSessions" as RuleField,
      operator: ">=" as RuleOperator,
      value: 1,
    },
    onSubmit: async ({ value }) => {
      try {
        const url = editingBadge ? `/api/admin/badges/${editingBadge.id}` : "/api/admin/badges";
        const method = editingBadge ? "PATCH" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: value.name,
            icon: value.icon,
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          alert(error.error || "Une erreur s'est produite");
          return;
        }

        const badgePayload = (await res.json().catch(() => null)) as unknown;
        const badge =
          badgePayload &&
          typeof badgePayload === "object" &&
          "data" in (badgePayload as Record<string, unknown>)
            ? (badgePayload as { data?: Badge }).data
            : (badgePayload as Badge | undefined);

        if (!editingBadge && value.ruleName && badge?.id) {
          const criteria = JSON.stringify({
            field: value.field,
            operator: value.operator,
            value: value.value,
          });

          await fetch(`/api/admin/badges/${badge.id}/rule`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: value.ruleName, criteria }),
          });
        }

        badgeForm.reset();
        setIsBadgeDialogOpen(false);
        setEditingBadge(null);

        await refreshBadges();
        router.refresh();
      } catch (error) {
        console.error("Error saving badge:", error);
        alert("Une erreur s'est produite");
      }
    },
  });

  const ruleForm = useForm({
    defaultValues: {
      name: "",
      field: "totalSessions" as RuleField,
      operator: ">=" as RuleOperator,
      value: 0,
    } as RewardRuleFormData,
    validators: { onSubmit: rewardRuleSchema },
    onSubmit: async ({ value }) => {
      if (!selectedBadgeForRule) return;

      try {
        const criteria = JSON.stringify({
          field: value.field,
          operator: value.operator,
          value: value.value,
        });

        const res = await fetch(`/api/admin/badges/${selectedBadgeForRule.id}/rule`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: value.name, criteria }),
        });

        if (!res.ok) {
          const error = await res.json();
          alert(error.error || "Une erreur s'est produite");
          return;
        }

        ruleForm.reset();
        setIsRuleDialogOpen(false);
        setSelectedBadgeForRule(null);

        await refreshBadges();
        router.refresh();
      } catch (error) {
        console.error("Error saving rule:", error);
        alert("Une erreur s'est produite");
      }
    },
  });

  const handleDeleteBadge = async (badgeId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce badge ?")) return;

    setIsDeleting(badgeId);
    try {
      const res = await fetch(`/api/admin/badges/${badgeId}`, { method: "DELETE" });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Impossible de supprimer ce badge");
        return;
      }

      setBadges((prev) => prev.filter((b) => b.id !== badgeId));
      router.refresh();
    } catch (error) {
      console.error("Error deleting badge:", error);
      alert("Une erreur s'est produite");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditBadge = (badge: Badge) => {
    setEditingBadge(badge);
    badgeForm.setFieldValue("name", badge.name);
    badgeForm.setFieldValue("icon", badge.icon || "");
    setIsBadgeDialogOpen(true);
  };

  const handleBadgeDialogClose = (open: boolean) => {
    setIsBadgeDialogOpen(open);
    if (!open) {
      setEditingBadge(null);
      badgeForm.reset();
    }
  };

  const handleRuleDialogClose = (open: boolean) => {
    setIsRuleDialogOpen(open);
    if (!open) {
      setSelectedBadgeForRule(null);
      setEditingRule(false);
      ruleForm.reset();
    }
  };

  const handleAddRule = (badge: Badge) => {
    setSelectedBadgeForRule(badge);
    setEditingRule(false);
    ruleForm.reset();
    setIsRuleDialogOpen(true);
  };

  const handleEditRule = (badge: Badge) => {
    if (!badge.rewardRule) return;

    setSelectedBadgeForRule(badge);
    setEditingRule(true);

    try {
      const criteria = JSON.parse(badge.rewardRule.criteria);
      ruleForm.setFieldValue("name", badge.rewardRule.name);
      ruleForm.setFieldValue("field", criteria.field);
      ruleForm.setFieldValue("operator", criteria.operator);
      ruleForm.setFieldValue("value", criteria.value);
    } catch (error) {
      console.error("Error parsing criteria:", error);
    }

    setIsRuleDialogOpen(true);
  };

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Gestion des badges</h1>
          <p className="text-muted-foreground mt-2">Créez et gérez les badges de récompense</p>
        </div>
        <Dialog open={isBadgeDialogOpen} onOpenChange={handleBadgeDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau badge
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBadge ? "Modifier le badge" : "Créer un badge"}</DialogTitle>
              <DialogDescription>
                Renseignez les informations du badge et définissez sa règle d&apos;attribution.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                badgeForm.handleSubmit();
              }}
              className="space-y-4"
            >
              <badgeForm.Field
                name="name"
                validators={{
                  onBlur: badgeSchema.shape.name,
                  onSubmit: badgeSchema.shape.name,
                }}
              >
                {(field) => (
                  <div>
                    <label htmlFor="name" className="mb-1 block text-sm font-medium">
                      Nom <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="name"
                      value={field.state.value}
                      onChange={(e) => {
                        field.setErrorMap({});
                        field.handleChange(e.target.value);
                      }}
                      onBlur={field.handleBlur}
                      placeholder="Ex: Champion des séances"
                    />
                    {renderError(field.state.meta)}
                  </div>
                )}
              </badgeForm.Field>

              <badgeForm.Field name="icon">
                {(field) => (
                  <div>
                    <label htmlFor="icon" className="mb-1 block text-sm font-medium">
                      Icône (emoji ou lettre)
                    </label>
                    <Input
                      id="icon"
                      value={field.state.value || ""}
                      onChange={(e) => {
                        field.setErrorMap({});
                        field.handleChange(e.target.value);
                      }}
                      onBlur={field.handleBlur}
                      placeholder="🏅"
                      maxLength={2}
                    />
                    {renderError(field.state.meta)}
                  </div>
                )}
              </badgeForm.Field>

              {!editingBadge && (
                <>
                  <div className="border-t pt-4">
                    <h3 className="mb-3 text-sm font-semibold">Règle d&apos;attribution</h3>
                  </div>

                  <badgeForm.Field name="ruleName">
                    {(field) => (
                      <div>
                        <label htmlFor="rule-name" className="mb-1 block text-sm font-medium">
                          Nom de la règle
                        </label>
                        <Input
                          id="rule-name"
                          value={field.state.value || ""}
                          onChange={(e) => {
                            field.setErrorMap({});
                            field.handleChange(e.target.value);
                          }}
                          onBlur={field.handleBlur}
                          placeholder="Ex: 10 séances complétées"
                        />
                        {renderError(field.state.meta)}
                      </div>
                    )}
                  </badgeForm.Field>

                  <badgeForm.Field name="field">
                    {(field) => (
                      <div>
                        <label htmlFor="badge-field" className="mb-1 block text-sm font-medium">
                          Champ à évaluer
                        </label>
                        <select
                          id="badge-field"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          value={field.state.value}
                          onChange={(e) => {
                            field.setErrorMap({});
                            field.handleChange(e.target.value as RuleField);
                          }}
                          onBlur={field.handleBlur}
                        >
                          {ruleFieldSchema.options.map((fieldType) => (
                            <option key={fieldType} value={fieldType}>
                              {getRuleFieldLabel(fieldType)}
                            </option>
                          ))}
                        </select>
                        {renderError(field.state.meta)}
                      </div>
                    )}
                  </badgeForm.Field>

                  <badgeForm.Field name="operator">
                    {(field) => (
                      <div>
                        <label htmlFor="badge-operator" className="mb-1 block text-sm font-medium">
                          Opérateur
                        </label>
                        <select
                          id="badge-operator"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          value={field.state.value}
                          onChange={(e) => {
                            field.setErrorMap({});
                            field.handleChange(e.target.value as RuleOperator);
                          }}
                          onBlur={field.handleBlur}
                        >
                          {ruleOperatorSchema.options.map((op) => (
                            <option key={op} value={op}>
                              {op} ({getRuleOperatorLabel(op)})
                            </option>
                          ))}
                        </select>
                        {renderError(field.state.meta)}
                      </div>
                    )}
                  </badgeForm.Field>

                  <badgeForm.Field name="value">
                    {(field) => (
                      <div>
                        <label htmlFor="badge-value" className="mb-1 block text-sm font-medium">
                          Valeur
                        </label>
                        <Input
                          id="badge-value"
                          type="number"
                          min="0"
                          value={field.state.value || ""}
                          onChange={(e) => {
                            field.setErrorMap({});
                            field.handleChange(parseInt(e.target.value) || 0);
                          }}
                          onBlur={field.handleBlur}
                          placeholder="Ex: 10"
                        />
                        {renderError(field.state.meta)}
                      </div>
                    )}
                  </badgeForm.Field>
                </>
              )}

              <badgeForm.Subscribe selector={(state) => [state.isSubmitting]}>
                {([isSubmitting]) => (
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      onClick={() => handleBadgeDialogClose(false)}
                      disabled={isSubmitting}
                      startIcon={<X className="h-4 w-4" />}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      color="green"
                      disabled={isSubmitting}
                      startIcon={
                        isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : editingBadge ? (
                          <Save className="h-4 w-4" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )
                      }
                    >
                      {isSubmitting ? "Enregistrement..." : editingBadge ? "Modifier" : "Créer"}
                    </Button>
                  </div>
                )}
              </badgeForm.Subscribe>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {badges.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-muted-foreground">Aucun badge créé pour le moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {badges.map((badge) => {
            const colors = emojiColors[badge.id] || {
              bg: "bg-gray-50",
              text: "text-gray-700",
              hover: "hover:bg-gray-100",
              borderColor: "rgb(229, 231, 235)",
            };
            return (
              <Card key={badge.id} className="border border-gray-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{badge.icon || "🏅"}</div>
                      <div>
                        <CardTitle className="text-lg">{badge.name}</CardTitle>
                        <p className="text-muted-foreground text-xs">
                          {badge._count.awards} attribution{badge._count.awards > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditBadge(badge)}
                        disabled={isDeleting === badge.id}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBadge(badge.id)}
                        disabled={isDeleting === badge.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {badge.rewardRule ? (
                    <div
                      className={`flex items-center justify-between rounded-lg ${colors.bg} p-3`}
                    >
                      <p className={`text-sm ${colors.text}`}>{badge.rewardRule.name}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRule(badge)}
                        className={`h-6 w-6 p-0 ${colors.text} ${colors.hover}`}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full"
                      color="blue"
                      onClick={() => handleAddRule(badge)}
                      startIcon={<Plus className="h-4 w-4" />}
                    >
                      Ajouter une règle
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isRuleDialogOpen} onOpenChange={handleRuleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRule ? "Modifier la règle" : "Ajouter une règle d'attribution"}
            </DialogTitle>
            <DialogDescription>
              Définissez les critères pour obtenir le badge &quot;{selectedBadgeForRule?.name}&quot;
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              ruleForm.handleSubmit();
            }}
            className="space-y-4"
          >
            <ruleForm.Field
              name="name"
              validators={{
                onBlur: rewardRuleSchema.shape.name,
                onSubmit: rewardRuleSchema.shape.name,
              }}
            >
              {(field) => (
                <div>
                  <label htmlFor="rule-name" className="mb-1 block text-sm font-medium">
                    Nom de la règle <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="rule-name"
                    value={field.state.value}
                    onChange={(e) => {
                      field.setErrorMap({});
                      field.handleChange(e.target.value);
                    }}
                    onBlur={field.handleBlur}
                    placeholder="Ex: 10 séances complétées"
                  />
                  {renderError(field.state.meta)}
                </div>
              )}
            </ruleForm.Field>

            <ruleForm.Field
              name="field"
              validators={{
                onBlur: rewardRuleSchema.shape.field,
                onSubmit: rewardRuleSchema.shape.field,
              }}
            >
              {(field) => (
                <div>
                  <label htmlFor="rule-field" className="mb-1 block text-sm font-medium">
                    Champ à évaluer <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="rule-field"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={field.state.value}
                    onChange={(e) => {
                      field.setErrorMap({});
                      field.handleChange(e.target.value as RuleField);
                    }}
                    onBlur={field.handleBlur}
                  >
                    {ruleFieldSchema.options.map((fieldType) => (
                      <option key={fieldType} value={fieldType}>
                        {getRuleFieldLabel(fieldType)}
                      </option>
                    ))}
                  </select>
                  {renderError(field.state.meta)}
                </div>
              )}
            </ruleForm.Field>

            <ruleForm.Field
              name="operator"
              validators={{
                onBlur: rewardRuleSchema.shape.operator,
                onSubmit: rewardRuleSchema.shape.operator,
              }}
            >
              {(field) => (
                <div>
                  <label htmlFor="rule-operator" className="mb-1 block text-sm font-medium">
                    Opérateur <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="rule-operator"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={field.state.value}
                    onChange={(e) => {
                      field.setErrorMap({});
                      field.handleChange(e.target.value as RuleOperator);
                    }}
                    onBlur={field.handleBlur}
                  >
                    {ruleOperatorSchema.options.map((op) => (
                      <option key={op} value={op}>
                        {op} ({getRuleOperatorLabel(op)})
                      </option>
                    ))}
                  </select>
                  {renderError(field.state.meta)}
                </div>
              )}
            </ruleForm.Field>

            <ruleForm.Field
              name="value"
              validators={{
                onBlur: rewardRuleSchema.shape.value,
                onSubmit: rewardRuleSchema.shape.value,
              }}
            >
              {(field) => (
                <div>
                  <label htmlFor="value" className="mb-1 block text-sm font-medium">
                    Valeur <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="value"
                    type="number"
                    min="0"
                    value={field.state.value || ""}
                    onChange={(e) => {
                      field.setErrorMap({});
                      field.handleChange(parseInt(e.target.value) || 0);
                    }}
                    onBlur={field.handleBlur}
                    placeholder="Ex: 10"
                  />
                  {renderError(field.state.meta)}
                </div>
              )}
            </ruleForm.Field>

            <ruleForm.Subscribe selector={(state) => [state.isSubmitting]}>
              {([isSubmitting]) => (
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleRuleDialogClose(false)}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    startIcon={
                      isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined
                    }
                  >
                    {isSubmitting ? "Enregistrement..." : "Créer la règle"}
                  </Button>
                </div>
              )}
            </ruleForm.Subscribe>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
