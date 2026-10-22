"use client";

import { useRef, useState } from "react";
import { Avatar, Button, Card } from "@heroui/react";
import {
  Camera,
  Mail,
  MapPin,
  ShieldCheck,
  User,
  Edit3,
  Check,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

const ProfilePage = () => {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const fileInputRef = useRef(null);

  // Photo upload state
  const [isUploading, setIsUploading] = useState(false);

  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState("");

  const startEditing = () => {
    setNameInput(user?.name || "");
    setLocationInput(user?.location || "");
    setValidationError("");
    setIsEditing(true);
  };

  const uploadImageToImgbb = async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
      throw new Error("ImgBB API key is not configured.");
    }

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    if (!result.success) {
      throw new Error(result.error?.message || "Image upload failed");
    }

    return result.data.display_url;
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);

      // Upload image to ImgBB
      const imageUrl = await uploadImageToImgbb(file);

      // Persist update via Better Auth
      const { error } = await authClient.updateUser({
        image: imageUrl,
      });

      if (error) {
        throw new Error(error.message || "Failed to update profile image");
      }

      toast.success("Profile image updated successfully");
    } catch (error) {
      console.error("Profile image upload error:", error);
      toast.error(error.message || "Failed to update profile image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setValidationError("");

    const trimmedName = nameInput.trim();
    const trimmedLocation = locationInput.trim();

    // Validation
    if (!trimmedName) {
      setValidationError("Full name cannot be blank.");
      toast.error("Name is required.");
      return;
    }

    if (trimmedName.length < 2) {
      setValidationError("Name must be at least 2 characters long.");
      toast.error("Name must be at least 2 characters long.");
      return;
    }

    if (trimmedName.length > 50) {
      setValidationError("Name cannot exceed 50 characters.");
      toast.error("Name cannot exceed 50 characters.");
      return;
    }

    if (trimmedLocation.length > 100) {
      setValidationError("Location cannot exceed 100 characters.");
      toast.error("Location cannot exceed 100 characters.");
      return;
    }

    try {
      setIsSaving(true);

      // Persistently update user profile in MongoDB through Better Auth
      const updatePayload = {
        name: trimmedName,
      };

      if (trimmedLocation) {
        updatePayload.location = trimmedLocation;
      }

      const { error } = await authClient.updateUser(updatePayload);

      if (error) {
        throw new Error(error.message || "Failed to save profile changes");
      }

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Profile save error:", error);
      toast.error(error.message || "Failed to update profile");
      setValidationError(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setNameInput(user?.name || "");
    setLocationInput(user?.location || "");
    setValidationError("");
    setIsEditing(false);
  };

  if (isPending) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-default-500">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-danger">Unable to load profile. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your personal account credentials and profile display information.
          </p>
        </div>

        {!isEditing && (
          <Button
            color="primary"
            variant="flat"
            startContent={<Edit3 size={16} />}
            onPress={startEditing}
            className="self-start sm:self-auto font-medium"
          >
            Edit Profile
          </Button>
        )}
      </div>

      <Card className="overflow-hidden border border-slate-200 shadow-sm">
        {/* Profile Header Banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 md:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            {/* Avatar */}
            <div className="relative">
              <Avatar
                className="size-24 border-4 border-white text-2xl shadow-md"
                src={user.image || undefined}
              >
                <Avatar.Fallback className="bg-white text-green-700 font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </Avatar.Fallback>
              </Avatar>

              {/* Camera Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border-2 border-white bg-white text-green-700 shadow-md transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                aria-label="Change profile image"
                title="Change profile photo"
              >
                <Camera size={16} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* User Info Header */}
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white">
                {user.name || "ReSell Hub User"}
              </h2>

              <p className="mt-1 text-sm text-white/90">
                {user.email}
              </p>

              <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold capitalize text-white">
                  {user.role || "buyer"}
                </span>

                {user.location && (
                  <span className="inline-flex items-center gap-1 text-xs text-white/80">
                    <MapPin size={12} />
                    {user.location}
                  </span>
                )}
              </div>

              {isUploading && (
                <p className="mt-2 text-xs font-medium text-white animate-pulse">
                  Uploading image to cloud storage...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Account Information Body */}
        <div className="p-6 md:p-8">
          {/* Inline Edit Form */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-lg font-bold text-slate-800">
                  Edit Personal Information
                </h3>
                <p className="text-sm text-slate-500">
                  Update your display name and location. Changes persist immediately to your account.
                </p>
              </div>

              {validationError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                {/* Full Name Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Md. Rakib Hasan"
                    disabled={isSaving}
                    maxLength={50}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 disabled:opacity-60"
                  />
                  <span className="mt-1 block text-xs text-slate-400">
                    Between 2 and 50 characters
                  </span>
                </div>

                {/* Location Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="e.g. Dhaka, Bangladesh"
                    disabled={isSaving}
                    maxLength={100}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 disabled:opacity-60"
                  />
                  <span className="mt-1 block text-xs text-slate-400">
                    City, Country (max 100 characters)
                  </span>
                </div>

                {/* Email (Read Only) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address (Immutable)
                  </label>
                  <input
                    type="text"
                    value={user.email}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                  />
                  <span className="mt-1 block text-xs text-slate-400">
                    Email cannot be modified directly
                  </span>
                </div>

                {/* Account Role (Read Only) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Account Role (Fixed)
                  </label>
                  <input
                    type="text"
                    value={user.role || "buyer"}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm capitalize text-slate-500 cursor-not-allowed"
                  />
                  <span className="mt-1 block text-xs text-slate-400">
                    Assigned upon registration
                  </span>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="tertiary"
                  onPress={handleCancelEdit}
                  isDisabled={isSaving}
                  startContent={<X size={16} />}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  color="primary"
                  className="bg-green-600 text-white font-semibold"
                  isDisabled={isSaving || !nameInput.trim()}
                  startContent={
                    isSaving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )
                  }
                >
                  {isSaving ? "Saving Changes..." : "Save Changes"}
                </Button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Account Information
                  </h3>
                  <p className="text-sm text-slate-500">
                    Your current verified account details.
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="flat"
                  startContent={<Edit3 size={15} />}
                  onPress={startEditing}
                  className="font-medium"
                >
                  Edit Name & Details
                </Button>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {/* Name */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-2 flex items-center gap-2 text-slate-500">
                    <User size={18} />
                    <span className="text-sm font-medium">Full Name</span>
                  </div>
                  <p className="font-semibold text-slate-800">
                    {user.name || "Not specified"}
                  </p>
                </div>

                {/* Email */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-2 flex items-center gap-2 text-slate-500">
                    <Mail size={18} />
                    <span className="text-sm font-medium">Email Address</span>
                  </div>
                  <p className="break-all font-semibold text-slate-800">
                    {user.email || "Not specified"}
                  </p>
                </div>

                {/* Location */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-2 flex items-center gap-2 text-slate-500">
                    <MapPin size={18} />
                    <span className="text-sm font-medium">Location</span>
                  </div>
                  <p className="font-semibold text-slate-800">
                    {user.location || "Not added yet"}
                  </p>
                </div>

                {/* Role */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-2 flex items-center gap-2 text-slate-500">
                    <ShieldCheck size={18} />
                    <span className="text-sm font-medium">Account Role</span>
                  </div>
                  <p className="font-semibold capitalize text-slate-800">
                    {user.role || "buyer"}
                  </p>
                </div>
              </div>

              {/* Photo Upload Trigger */}
              <div className="mt-6 flex justify-end">
                <Button
                  color="default"
                  variant="flat"
                  startContent={<Camera size={17} />}
                  onPress={() => fileInputRef.current?.click()}
                  isDisabled={isUploading}
                >
                  {isUploading ? "Uploading Photo..." : "Change Profile Photo"}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
