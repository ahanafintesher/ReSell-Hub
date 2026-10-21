
"use client";

import { useRef, useState } from "react";
import { Avatar, Button, Card } from "@heroui/react";
import { Camera, Mail, MapPin, ShieldCheck, User } from "lucide-react";
import toast from "react-hot-toast";

import { authClient } from "@/lib/auth-client";

const ProfilePage = () => {
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;
  const fileInputRef = useRef(null);

  const [isUploading, setIsUploading] = useState(false);

  const uploadImageToImgbb = async (imageFile) => {
    const formData = new FormData();

    formData.append("image", imageFile);

    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await res.json();

    if (!result.success) {
      throw new Error("Image upload failed");
    }

    return result.data.display_url;
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
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

      // Update Better Auth user image
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

      // Allow selecting the same image again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
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
        <p className="text-danger">Unable to load profile.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your account information.
        </p>
      </div>

      <Card className="overflow-hidden border border-slate-200 shadow-sm">
        {/* Profile Header */}
        <div className="bg-green-300 px-6 py-8 md:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            {/* Avatar */}
            <div className="relative">
              <Avatar
                className="size-24 border-4 border-white text-2xl"
                src={user.image || undefined}
              >
                <Avatar.Fallback className="bg-white text-green-600">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </Avatar.Fallback>
              </Avatar>

              {/* Camera Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border-2 border-white bg-white text-green-600 shadow-md transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Change profile image"
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

            {/* User Info */}
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white">
                {user.name}
              </h2>

              <p className="mt-1 text-sm text-white/90">
                {user.email}
              </p>

              <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold capitalize text-white">
                {user.role || "buyer"}
              </span>

              {isUploading && (
                <p className="mt-2 text-xs font-medium text-white">
                  Uploading image...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="p-6 md:p-8">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-800">
              Account Information
            </h3>

            <p className="text-sm text-slate-500">
              Your current account details.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Name */}
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500">
                <User size={18} />
                <span className="text-sm font-medium">Name</span>
              </div>

              <p className="font-semibold text-slate-800">
                {user.name || "Not available"}
              </p>
            </div>

            {/* Email */}
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500">
                <Mail size={18} />
                <span className="text-sm font-medium">Email</span>
              </div>

              <p className="break-all font-semibold text-slate-800">
                {user.email || "Not available"}
              </p>
            </div>

            {/* Location */}
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500">
                <MapPin size={18} />
                <span className="text-sm font-medium">Location</span>
              </div>

              <p className="font-semibold text-slate-800">
                {user.location || "Not added"}
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

          {/* Change Photo */}
          <div className="mt-6 flex justify-end">
            <Button
              color="primary"
              variant="flat"
              startContent={<Camera size={17} />}
              onPress={() => fileInputRef.current?.click()}
              isLoading={isUploading}
            >
              {isUploading ? "Uploading..." : "Change Profile Photo"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;

