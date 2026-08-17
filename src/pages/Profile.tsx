import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getCurrentUser, setCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, User, Lock, FileSignature, Upload, Save, CheckCircle2, Edit, X, Shield, KeyRound, Sparkles, FileImage } from "lucide-react";
import api from "@/lib/api";
import { ensurePngSignatureBase64 } from "@/lib/documentStamper";

import { getErrorMessage } from "@/lib/utils";

export default function Profile() {
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState<string>(tabParam);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t) {
      setActiveTab(t);
    }
  }, [searchParams]);

  const displayName = currentUser
    ? `${currentUser.first_name} ${currentUser.last_name}`
    : "Guest";

  const userInitials = (displayName.split(" ").map((n) => n[0]).join("") || "?").toUpperCase();

  // Profile Form state
  const [isEditMode, setIsEditMode] = useState(false);
  const [firstName, setFirstName] = useState(currentUser?.first_name || "");
  const [lastName, setLastName] = useState(currentUser?.last_name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [branch, setBranch] = useState(currentUser?.branch || "");
  const [signature, setSignature] = useState(currentUser?.signature || "");

  // Signature file upload preview state
  const [selectedSigFileName, setSelectedSigFileName] = useState<string | null>(null);
  const [sigPreviewUrl, setSigPreviewUrl] = useState<string | null>(null);

  // Signature visibility state
  const [showSignature, setShowSignature] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Show/Hide password toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Approver status — only approvers may manage their own signature
  const [isApprover, setIsApprover] = useState<boolean | null>(null);

  useEffect(() => {
    if (!currentUser?.user_id) return;
    api
      .get(`/user/is-approver/${currentUser.user_id}`)
      .then((res) => setIsApprover(res.data?.isApprover === true))
      .catch(() => setIsApprover(false)); // default to false on error
  }, [currentUser?.user_id]);

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (PNG, JPG, SVG).",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "The signature image size exceeds 2MB. Please upload a smaller image file.",
        variant: "destructive",
      });
      return;
    }

    setSelectedSigFileName(file.name);

    const reader = new FileReader();
    reader.onload = async () => {
      const rawBase64 = reader.result as string;
      const pngBase64 = await ensurePngSignatureBase64(rawBase64);
      setSigPreviewUrl(pngBase64);
      setSignature(pngBase64);
      setShowSignature(true);
      toast({
        title: "Signature Loaded",
        description: `Selected "${file.name}". Click 'Save Signature' to record changes.`,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.user_id) return;

    setIsUpdatingProfile(true);
    try {
      const payload = {
        userId: currentUser.user_id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        branch,
        signature,
      };

      const res = await api.put("/user/update-self-profile", payload);
      if (res.data.code === "200") {
        const updatedUser = {
          ...currentUser,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          branch,
          signature,
        };
        setCurrentUser(updatedUser);
        setIsEditMode(false);

        toast({
          title: "Profile Updated",
          description: "Your profile details have been saved successfully.",
        });
      } else {
        toast({
          title: "Update Failed",
          description: res.data.result || "Could not update profile.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: getErrorMessage(err, "Failed to update profile."),
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setFirstName(currentUser?.first_name || "");
    setLastName(currentUser?.last_name || "");
    setEmail(currentUser?.email || "");
    setPhone(currentUser?.phone || "");
    setBranch(currentUser?.branch || "");
    setIsEditMode(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.user_id) return;

    if (newPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "New password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const payload = {
        userId: currentUser.user_id,
        currentPassword,
        newPassword,
      };

      const res = await api.put("/user/change-password", payload);
      if (res.data.code === "200") {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully.",
        });
      } else {
        toast({
          title: "Failed",
          description: res.data.result || "Could not change password.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.result || "Failed to change password.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 pt-14 lg:pt-6 max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="User Profile & Account Settings"
        description="View and update your personal details, signature, and security credentials"
      />

      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val);
          setSearchParams({ tab: val });
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 max-w-md h-10 bg-muted/70 mb-6">
          <TabsTrigger value="overview" className="text-xs flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          {/* Signature tab is ONLY visible to assigned approvers — hidden for non-approvers and admins not in doc_approvers */}
          {isApprover === true && (
            <TabsTrigger value="signature" className="text-xs flex items-center gap-1.5">
              <FileSignature className="h-3.5 w-3.5" />
              Signature
            </TabsTrigger>
          )}
          {/* When user is not an approver, fill the grid evenly */}
          {isApprover !== true && (
            <div aria-hidden="true" />
          )}
          <TabsTrigger value="security" className="text-xs flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview">
          <Card className="rounded-2xl shadow-card border border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Initials profile badge like sidebar footer */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0">
                  {userInitials}
                </div>
                <div>
                  <CardTitle className="text-base">Personal & Account Information</CardTitle>
                  <CardDescription className="text-xs">
                    {isEditMode
                      ? "Edit your account details below and save when finished."
                      : "Click Edit Profile to make changes to your details."}
                  </CardDescription>
                </div>
              </div>

              {!isEditMode ? (
                <Button
                  type="button"
                  onClick={() => setIsEditMode(true)}
                  className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit Profile
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="gap-1.5 text-xs text-muted-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
              )}
            </CardHeader>

            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Staff ID / Employee ID</Label>
                    <Input
                      value={currentUser?.employee_id || "—"}
                      disabled
                      className="bg-muted/50 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Assigned Role</Label>
                    <Input
                      value={currentUser?.role_name || "—"}
                      disabled
                      className="bg-muted/50 text-xs capitalize font-semibold text-blue-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">First Name</Label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={!isEditMode}
                      required
                      className="text-xs disabled:opacity-80"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Last Name</Label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={!isEditMode}
                      required
                      className="text-xs disabled:opacity-80"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Email Address</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isEditMode}
                      required
                      className="text-xs disabled:opacity-80"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Phone Number</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!isEditMode}
                      className="text-xs disabled:opacity-80"
                      placeholder="e.g. +232 76 000 000"
                    />
                  </div>
                </div>

                {isEditMode && (
                  <div className="pt-4 flex justify-end gap-2 animate-fade-in">
                    <Button type="button" variant="outline" onClick={handleCancelEdit} className="text-xs">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUpdatingProfile} className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Save className="h-4 w-4" />
                      {isUpdatingProfile ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SIGNATURE TAB */}
        <TabsContent value="signature">
          <Card className="rounded-2xl shadow-card border border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileSignature className="h-5 w-5 text-indigo-500" />
                Digital Signature Management
              </CardTitle>
              <CardDescription className="text-xs">
                Your signature is hidden by default for security. Use the toggle icon below to reveal it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Access guard: only approvers may manage their signature */}
              {isApprover !== true ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-muted-foreground">
                  <Shield className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm font-semibold">Signature Management Restricted</p>
                  <p className="text-xs max-w-sm">
                    Only users assigned as approvers in the system are permitted to upload and manage a digital signature.
                    Please contact your system administrator if you believe this is an error.
                  </p>
                </div>
              ) : (
                <>

              {/* Signature Display Box */}
              <div className="rounded-xl border border-border bg-slate-50 dark:bg-slate-900/50 p-6 flex flex-col items-center justify-center min-h-[160px] relative">
                <div className="absolute top-3 right-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => setShowSignature(!showSignature)}
                  >
                    {showSignature ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5 text-rose-500" />
                        Hide Signature
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5 text-emerald-500" />
                        View Signature
                      </>
                    )}
                  </Button>
                </div>

                {showSignature ? (
                  signature ? (
                    <div className="flex flex-col items-center gap-2 animate-fade-in">
                      <img
                        src={signature}
                        alt="Digital Signature"
                        className="max-h-28 max-w-full object-contain border p-2 bg-white rounded shadow-sm"
                      />
                      <span className="text-3xs text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Signature active and verified
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No signature recorded on file.</p>
                  )
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center p-4">
                    <Lock className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground font-medium">
                      Signature preview is protected and hidden.
                    </p>
                    <p className="text-3xs text-muted-foreground/70">
                      Click "View Signature" above to inspect your stored digital signature.
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Signature Form & Selected File Thumbnail */}
              <div className="space-y-3 pt-2">
                <Label className="text-xs font-semibold">Upload New Signature Image</Label>

                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="text-xs cursor-pointer flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile || !signature}
                    className="gap-1.5 text-xs flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Upload className="h-4 w-4" />
                    Save Signature
                  </Button>
                </div>

                {/* Selected File Image & Filename Display */}
                {selectedSigFileName && (
                  <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 flex items-center gap-4 animate-fade-in">
                    {sigPreviewUrl && (
                      <div className="bg-white p-1 rounded border shadow-sm flex-shrink-0">
                        <img
                          src={sigPreviewUrl}
                          alt="Selected preview"
                          className="h-12 w-24 object-contain"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 truncate">
                        <FileImage className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        {selectedSigFileName}
                      </p>
                      <p className="text-3xs text-muted-foreground mt-0.5">
                        Image ready. Click "Save Signature" above to complete upload.
                      </p>
                    </div>
                  </div>
                )}

                <p className="text-3xs text-muted-foreground">
                  Accepted formats: PNG, JPG, SVG. Signatures are automatically formatted for clean PDF authorization stamping.
                </p>
              </div>
              </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY / PASSWORD TAB WITH ANIMATED SECURITY ILLUSTRATION */}
        <TabsContent value="security">
          <Card className="rounded-2xl shadow-card border border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-500" />
                Change Password
              </CardTitle>
              <CardDescription className="text-xs">
                Ensure your account stays secure by updating your credentials periodically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left Column: Form */}
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Current Password</Label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        placeholder="Enter current password"
                        className="text-xs pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">New Password</Label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="At least 6 characters"
                        className="text-xs pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Re-enter new password"
                        className="text-xs pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" disabled={isUpdatingPassword} className="gap-2 text-xs w-full bg-amber-600 hover:bg-amber-700 text-white">
                      <Lock className="h-4 w-4" />
                      {isUpdatingPassword ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </form>

                {/* Right Column: Key transforming into lock MP4 Video Animation */}
                <div className="hidden md:flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-amber-500/30 relative overflow-hidden text-center shadow-xl group">
                  <div className="w-full h-60 rounded-xl overflow-hidden relative border border-white/10 shadow-inner">
                    <video
                      src="/videos/key_lock_animation.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-black/0 to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3 right-3 z-10 text-left">
                      <h4 className="text-xs font-bold text-black flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        256-Bit Password Protection
                      </h4>
                      <p className="text-[10px] text-slate-800 leading-snug mt-0.5">
                        Passwords are securely hashed using bcrypt salts and encrypted in database.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
