"use client";

import { useState, useMemo } from "react";
import { SidebarProvider } from "@/hooks";
import { AuthGuard } from "@/components/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import {
  useManualPaymentRequests,
  useApproveManualPayment,
  useRejectManualPayment,
  useBulkUserLookup,
  useCreateManualPaymentRequest,
  MANUAL_PASS_TYPES,
  PAYMENT_METHODS,
  REQUEST_STATUS_COLORS,
  type RequestStatus,
  type ManualPaymentRequest,
} from "@/lib/api/hooks";
import { useAdminSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/loader/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  RefreshCw,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  IndianRupee,
  FileText,
  Eye,
  Upload,
  X,
  AlertCircle,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// ═══════════════════════════════════════════════════════════════════
// STATUS BADGE
// ═══════════════════════════════════════════════════════════════════

function StatusBadge({ status }: { status: RequestStatus }) {
  const icons = {
    PENDING: Clock,
    APPROVED: CheckCircle,
    REJECTED: XCircle,
  };
  const Icon = icons[status];

  return (
    <Badge className={`${REQUEST_STATUS_COLORS[status]} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}

// ═══════════════════════════════════════════════════════════════════
// REQUEST DETAILS MODAL
// ═══════════════════════════════════════════════════════════════════

interface RequestDetailsModalProps {
  request: ManualPaymentRequest | null;
  open: boolean;
  onClose: () => void;
}

function RequestDetailsModal({ request, open, onClose }: RequestDetailsModalProps) {
  if (!request) return null;

  const passConfig = MANUAL_PASS_TYPES[request.passType];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle>Request Details - {request.requestId}</DialogTitle>
          <DialogDescription>
            Created on {formatDate(request.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status & Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="mt-1">
                <StatusBadge status={request.status} />
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Pass Type</Label>
              <p className="mt-1 font-medium">{passConfig.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Payment Method</Label>
              <p className="mt-1 font-medium">{PAYMENT_METHODS[request.paymentMethod]}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Total Amount</Label>
              <p className="mt-1 font-medium text-lg">{formatINR(request.amount)}</p>
            </div>
            {request.collegeSlug && (
              <div>
                <Label className="text-muted-foreground">College (Zonal)</Label>
                <p className="mt-1 font-medium">{request.collegeSlug}</p>
              </div>
            )}
            <div>
              <Label className="text-muted-foreground">Amount per User</Label>
              <p className="mt-1 font-medium">
                {formatINR(request.amount / request.numberOfPasses)}
              </p>
            </div>
          </div>

          {/* Users */}
          <div>
            <Label className="text-muted-foreground">Users ({request.users.length})</Label>
            <div className="mt-2 max-h-48 overflow-y-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>KY ID</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {request.users.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell className="font-mono text-sm">{user.kyId}</TableCell>
                      <TableCell>{user.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Bonafides */}
          {request.bonafides.length > 0 && (
            <div>
              <Label className="text-muted-foreground">
                Bonafides ({request.bonafides.length})
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {request.bonafides.map((key, i) => (
                  <Badge key={i} variant="outline" className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Document {i + 1}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Processing Info */}
          {request.status !== "PENDING" && (
            <div className="border-t pt-4">
              <Label className="text-muted-foreground">Processing Info</Label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Processed By</p>
                  <p className="font-medium">{request.processedBy || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Processed At</p>
                  <p className="font-medium">
                    {request.processedAt ? formatDate(request.processedAt) : "-"}
                  </p>
                </div>
                {request.processNote && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Note</p>
                    <p className="font-medium">{request.processNote}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════
// APPROVE MODAL
// ═══════════════════════════════════════════════════════════════════

interface ApproveModalProps {
  request: ManualPaymentRequest | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (note?: string) => void;
  isPending: boolean;
}

function ApproveModal({ request, open, onClose, onConfirm, isPending }: ApproveModalProps) {
  const [note, setNote] = useState("");

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle>Approve Payment Request</DialogTitle>
          <DialogDescription>
            This will create passes for {request.numberOfPasses} user(s) and mark their
            payments as verified.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Request ID:</span>{" "}
                <span className="font-mono">{request.requestId}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Amount:</span>{" "}
                <span className="font-medium">{formatINR(request.amount)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Pass Type:</span>{" "}
                <span className="font-medium">
                  {MANUAL_PASS_TYPES[request.passType].name}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Users:</span>{" "}
                <span className="font-medium">{request.numberOfPasses}</span>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="approval-note">Note (optional)</Label>
            <Textarea
              id="approval-note"
              placeholder="Add a note for this approval..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(note || undefined)}
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {isPending ? "Approving..." : "Approve Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════
// REJECT MODAL
// ═══════════════════════════════════════════════════════════════════

interface RejectModalProps {
  request: ManualPaymentRequest | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}

function RejectModal({ request, open, onClose, onConfirm, isPending }: RejectModalProps) {
  const [reason, setReason] = useState("");

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle>Reject Payment Request</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Request ID:</span>{" "}
                <span className="font-mono">{request.requestId}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Users:</span>{" "}
                <span className="font-medium">{request.numberOfPasses}</span>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="rejection-reason">Reason *</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Enter rejection reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1"
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(reason)}
            disabled={isPending || !reason.trim()}
          >
            {isPending ? "Rejecting..." : "Reject Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CREATE REQUEST MODAL
// ═══════════════════════════════════════════════════════════════════

interface CreateRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateRequestModal({ open, onClose, onSuccess }: CreateRequestModalProps) {
  // Form state
  const [kyIdInput, setKyIdInput] = useState("");
  const [lookupKyIds, setLookupKyIds] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Array<{
    userId: string;
    kyId: string;
    email: string;
    name: string | null;
    isPaidUser: boolean;
  }>>([]);
  const [passType, setPassType] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [collegeSlug, setCollegeSlug] = useState<string>("");
  const [bonafideFiles, setBonafideFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Lookup hook
  const { users: lookedUpUsers, notFound, isLoading: isLookingUp } = useBulkUserLookup(lookupKyIds);

  // Create mutation
  const { createRequest, isPending: isCreating } = useCreateManualPaymentRequest();

  // Reset form when modal closes
  const handleClose = () => {
    setKyIdInput("");
    setLookupKyIds([]);
    setSelectedUsers([]);
    setPassType("");
    setPaymentMethod("");
    setAmount("");
    setCollegeSlug("");
    setBonafideFiles([]);
    setUploadError(null);
    onClose();
  };

  // Handle KY ID lookup
  const handleLookup = () => {
    const ids = kyIdInput
      .split(/[,\n]/)
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
    
    if (ids.length > 0) {
      setLookupKyIds(ids);
    }
  };

  // Add looked up users to selection
  const handleAddUsers = () => {
    const newUsers = lookedUpUsers.filter(
      (u) => !selectedUsers.some((s) => s.userId === u.userId)
    ).map((u) => ({
      userId: u.userId,
      kyId: u.kyId,
      email: u.email,
      name: u.name,
      isPaidUser: u.isPaidUser,
    }));
    
    setSelectedUsers([...selectedUsers, ...newUsers]);
    setKyIdInput("");
    setLookupKyIds([]);
  };

  // Remove user from selection
  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.userId !== userId));
  };

  // Handle bonafide file selection
  const handleBonafideFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadError(null);
    
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    const validFiles: File[] = [];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setUploadError(`Invalid file type: ${file.name}. Only JPG, PNG, PDF allowed.`);
        return;
      }
      if (file.size > maxSize) {
        setUploadError(`File too large: ${file.name}. Max 2MB allowed.`);
        return;
      }
      validFiles.push(file);
    }
    
    setBonafideFiles(prev => [...prev, ...validFiles]);
  };

  // Remove bonafide file
  const handleRemoveBonafide = (index: number) => {
    setBonafideFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Check if pass type is zonal
  const isZonalPass = passType === "ZONAL_SINGLE" || passType === "ZONAL_MULTI";

  // Form validation
  const isValid = 
    selectedUsers.length > 0 &&
    passType &&
    paymentMethod &&
    amount !== "" && parseFloat(amount) >= 0 &&
    (!isZonalPass || collegeSlug) &&
    bonafideFiles.length > 0;

  // Handle submit
  const handleSubmit = () => {
    if (!isValid) return;

    // Log bonafide files for now (TODO: Upload to R2 and get URLs)
    if (bonafideFiles.length > 0) {
      console.log("📎 Bonafide files to upload:", bonafideFiles.length);
      bonafideFiles.forEach((file, i) => {
        console.log(`  [${i + 1}] ${file.name} (${(file.size / 1024).toFixed(1)} KB, ${file.type})`);
      });
    } else {
      console.log("📎 No bonafide files attached");
    }

    createRequest(
      {
        users: selectedUsers.map((u) => ({
          userId: u.userId,
          kyId: u.kyId,
          email: u.email,
        })),
        passType: passType as any,
        paymentMethod: paymentMethod as any,
        amount: parseFloat(amount),
        collegeSlug: isZonalPass ? collegeSlug : undefined,
        bonafides: bonafideFiles.map((f) => f.name),
      },
      {
        onSuccess: () => {
          console.log("✅ Manual payment request created successfully");
          handleClose();
          onSuccess();
        },
      }
    );
  };

  // Step completion status
  const step1Complete = selectedUsers.length > 0;
  const step2Complete = !!passType && (!isZonalPass || !!collegeSlug);
  const step3Complete = !!paymentMethod && amount !== "" && parseFloat(amount) >= 0;
  const step4Complete = bonafideFiles.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Create Manual Payment Request
            </DialogTitle>
            <DialogDescription>
              Submit a bulk payment verification for users who paid offline.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Step 1: User Lookup */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step1Complete 
                  ? "bg-green-500 text-white" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {step1Complete ? <CheckCircle className="h-4 w-4" /> : "1"}
              </div>
              <div>
                <h3 className="font-medium">Add Users</h3>
                <p className="text-sm text-muted-foreground">Enter KY IDs to lookup users</p>
              </div>
            </div>
            
            <div className="ml-11 space-y-3">
              <Textarea
                placeholder="Enter KY IDs (comma or newline separated)&#10;e.g. KY-2027-ABC123, KY-2027-XYZ789"
                value={kyIdInput}
                onChange={(e) => setKyIdInput(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleLookup}
                disabled={!kyIdInput.trim() || isLookingUp}
              >
                {isLookingUp ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Looking up...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Lookup Users
                  </>
                )}
              </Button>

              {/* Lookup Results */}
              {lookupKyIds.length > 0 && !isLookingUp && (
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <p className="text-sm font-medium">
                    Found {lookedUpUsers.length} of {lookupKyIds.length} users
                  </p>
                  
                  {lookedUpUsers.length > 0 && (
                    <div className="max-h-32 overflow-y-auto rounded border bg-background">
                      <Table>
                        <TableBody>
                          {lookedUpUsers.map((user) => (
                            <TableRow key={user.userId} className={user.isPaidUser ? "bg-amber-50 dark:bg-amber-950/30" : ""}>
                              <TableCell className="font-mono text-xs py-2">{user.kyId}</TableCell>
                              <TableCell className="text-sm py-2">{user.email}</TableCell>
                              <TableCell className="py-2">
                                {user.isPaidUser && (
                                  <Badge variant="outline" className="text-amber-600 dark:text-amber-400 text-xs">
                                    Already Paid
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {notFound.length > 0 && (
                    <p className="text-sm text-red-500">
                      Not found: {notFound.join(", ")}
                    </p>
                  )}

                  {lookedUpUsers.length > 0 && (
                    <Button size="sm" onClick={handleAddUsers}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add {lookedUpUsers.length} User(s)
                    </Button>
                  )}
                </div>
              )}

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      Selected Users ({selectedUsers.length})
                    </p>
                    <Badge variant="secondary">{selectedUsers.length} selected</Badge>
                  </div>
                  <div className="max-h-32 overflow-y-auto rounded border bg-background">
                    <Table>
                      <TableBody>
                        {selectedUsers.map((user) => (
                          <TableRow key={user.userId}>
                            <TableCell className="font-mono text-xs py-2">{user.kyId}</TableCell>
                            <TableCell className="text-sm py-2">{user.email}</TableCell>
                            <TableCell className="py-2 w-8">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleRemoveUser(user.userId)}
                              >
                                <X className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t" />

          {/* Step 2: Select Pass Type */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step2Complete 
                  ? "bg-green-500 text-white" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {step2Complete ? <CheckCircle className="h-4 w-4" /> : "2"}
              </div>
              <div>
                <h3 className="font-medium">Select Pass Type</h3>
                <p className="text-sm text-muted-foreground">Choose the pass to assign</p>
              </div>
            </div>
            
            <div className="ml-11 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(MANUAL_PASS_TYPES).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPassType(key)}
                    className={`group relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      passType === key
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className={`font-semibold ${passType === key ? "text-primary" : "text-foreground"}`}>
                          {config.name}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {config.benefits}
                        </p>
                      </div>
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                        passType === key 
                          ? "border-primary bg-primary" 
                          : "border-muted-foreground/30"
                      }`}>
                        {passType === key && (
                          <CheckCircle className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Zonal College Slug */}
              {isZonalPass && (
                <div className="space-y-2 p-4 rounded-lg bg-muted/50 border">
                  <Label className="text-sm font-medium">College Slug (Required for Zonal)</Label>
                  <input
                    type="text"
                    value={collegeSlug}
                    onChange={(e) => setCollegeSlug(e.target.value)}
                    placeholder="e.g. rgipt, bhu, iitk"
                    className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="border-t" />

          {/* Step 3: Payment Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step3Complete 
                  ? "bg-green-500 text-white" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {step3Complete ? <CheckCircle className="h-4 w-4" /> : "3"}
              </div>
              <div>
                <h3 className="font-medium">Payment Details</h3>
                <p className="text-sm text-muted-foreground">Enter payment information</p>
              </div>
            </div>
            
            <div className="ml-11 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Total Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        setAmount(val);
                      }
                    }}
                    placeholder="0"
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                {selectedUsers.length > 1 && amount && parseFloat(amount) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    ₹{(parseFloat(amount) / selectedUsers.length).toFixed(2)} per user
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t" />

          {/* Step 4: Bonafides */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step4Complete 
                  ? "bg-green-500 text-white" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {step4Complete ? <CheckCircle className="h-4 w-4" /> : "4"}
              </div>
              <div>
                <h3 className="font-medium">Payment Proof</h3>
                <p className="text-sm text-muted-foreground">Upload screenshots or receipts (max 2MB each)</p>
              </div>
            </div>
            
            <div className="ml-11 space-y-3">
              {/* Upload Area */}
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleBonafideFiles}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 hover:bg-muted/30 transition-colors">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, PDF up to 2MB</p>
                </div>
              </div>
              
              {/* Upload Error */}
              {uploadError && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 p-3 rounded-lg border border-red-200 dark:border-red-900">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {uploadError}
                </div>
              )}
              
              {/* Uploaded Files List */}
              {bonafideFiles.length > 0 && (
                <div className="space-y-2">
                  {bonafideFiles.map((file, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between bg-muted/50 border rounded-lg px-4 py-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-background border flex items-center justify-center flex-shrink-0">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBonafide(index)}
                        className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t px-6 py-4">
          {/* Validation Summary */}
          {!isValid && (
            <div className="mb-4 p-3 rounded-lg bg-muted/50 border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Complete all steps to submit:</p>
              <div className="flex flex-wrap gap-2">
                {!step1Complete && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Add users
                  </Badge>
                )}
                {!step2Complete && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Select pass
                  </Badge>
                )}
                {!step3Complete && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Enter payment details
                  </Badge>
                )}
                {!step4Complete && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Upload proof
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Summary when valid */}
          {isValid && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm font-medium text-green-700 dark:text-green-400">Ready to submit</p>
              </div>
              <div className="grid grid-cols-4 gap-4 text-xs text-green-700 dark:text-green-400">
                <div>
                  <span className="text-green-600/70">Users:</span>{" "}
                  <span className="font-medium">{selectedUsers.length}</span>
                </div>
                <div>
                  <span className="text-green-600/70">Pass:</span>{" "}
                  <span className="font-medium">{MANUAL_PASS_TYPES[passType as keyof typeof MANUAL_PASS_TYPES]?.name}</span>
                </div>
                <div>
                  <span className="text-green-600/70">Amount:</span>{" "}
                  <span className="font-medium">₹{parseFloat(amount).toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="text-green-600/70">Files:</span>{" "}
                  <span className="font-medium">{bonafideFiles.length}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!isValid || isCreating}>
              {isCreating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE CONTENT
// ═══════════════════════════════════════════════════════════════════

function ManualPaymentsPageInner() {
  const { session } = useAdminSession();
  const canProcess = hasPermission(session?.role, "process_manual_payments");
  const canCreate = hasPermission(session?.role, "create_manual_payments");

  // Filters
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  // Fetch requests
  const { requests, pagination, isLoading, isError, refetch } = useManualPaymentRequests({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    page,
    limit: 20,
  });

  // Modals
  const [selectedRequest, setSelectedRequest] = useState<ManualPaymentRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // Mutations
  const { approveRequest, isPending: isApproving } = useApproveManualPayment();
  const { rejectRequest, isPending: isRejecting } = useRejectManualPayment();

  // Stats
  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.status === "PENDING").length;
    const approved = requests.filter((r) => r.status === "APPROVED").length;
    const rejected = requests.filter((r) => r.status === "REJECTED").length;
    const totalAmount = requests.reduce((sum, r) => sum + r.amount, 0);
    return { pending, approved, rejected, totalAmount };
  }, [requests]);

  const handleViewDetails = (request: ManualPaymentRequest) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const handleApprove = (request: ManualPaymentRequest) => {
    setSelectedRequest(request);
    setApproveOpen(true);
  };

  const handleReject = (request: ManualPaymentRequest) => {
    setSelectedRequest(request);
    setRejectOpen(true);
  };

  const confirmApprove = (note?: string) => {
    if (!selectedRequest) return;
    approveRequest(selectedRequest.requestId, note, {
      onSuccess: () => {
        setApproveOpen(false);
        setSelectedRequest(null);
        refetch(); // Refresh the list
      },
    });
  };

  const confirmReject = (reason: string) => {
    if (!selectedRequest) return;
    rejectRequest(selectedRequest.requestId, reason, {
      onSuccess: () => {
        setRejectOpen(false);
        setSelectedRequest(null);
        refetch(); // Refresh the list
      },
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="ml-0 flex min-w-0 flex-1 flex-col md:ml-16 lg:ml-60">
        <Topbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Manual Payments</h1>
              <p className="text-muted-foreground">
                Manage offline payment verification requests
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {canCreate && (
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats.approved}</p>
                    <p className="text-sm text-muted-foreground">Approved</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats.rejected}</p>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{formatINR(stats.totalAmount)}</p>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                  </div>
                  <IndianRupee className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg">Payment Requests</CardTitle>
                <div className="flex items-center gap-2">
                  <Select
                    value={statusFilter}
                    onValueChange={(v) => {
                      setStatusFilter(v as RequestStatus | "ALL");
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : isError ? (
                <div className="text-center py-8 text-muted-foreground">
                  Failed to load requests. Please try again.
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No payment requests found.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Request ID</TableHead>
                          <TableHead>Pass Type</TableHead>
                          <TableHead>Users</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {requests.map((request) => (
                          <TableRow key={request.requestId}>
                            <TableCell className="font-mono text-sm">
                              {request.requestId}
                            </TableCell>
                            <TableCell>
                              {MANUAL_PASS_TYPES[request.passType].name}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                {request.numberOfPasses}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatINR(request.amount)}
                            </TableCell>
                            <TableCell>
                              {PAYMENT_METHODS[request.paymentMethod]}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={request.status} />
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(request.createdAt)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(request)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {canProcess && request.status === "PENDING" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() => handleApprove(request)}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleReject(request)}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {(page - 1) * pagination.limit + 1} to{" "}
                        {Math.min(page * pagination.limit, pagination.totalCount)} of{" "}
                        {pagination.totalCount} requests
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page === 1}
                          onClick={() => setPage((p) => p - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!pagination.hasMore}
                          onClick={() => setPage((p) => p + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Permission Info for non-MASTER_ADMIN */}
          {!canProcess && (
            <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
              <CardContent className="p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> Only MASTER_ADMIN can approve or reject payment
                  requests. You can view and create requests, but processing requires
                  elevated permissions.
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Modals */}
      <RequestDetailsModal
        request={selectedRequest}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
      <ApproveModal
        request={selectedRequest}
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        onConfirm={confirmApprove}
        isPending={isApproving}
      />
      <RejectModal
        request={selectedRequest}
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={confirmReject}
        isPending={isRejecting}
      />
      <CreateRequestModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setCreateOpen(false);
          refetch();
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE EXPORT WITH AUTH GUARD
// ═══════════════════════════════════════════════════════════════════

export default function ManualPaymentsPage() {
  return (
    <SidebarProvider>
      <AuthGuard>
        <ManualPaymentsPageInner />
      </AuthGuard>
    </SidebarProvider>
  );
}
