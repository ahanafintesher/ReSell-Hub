"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  TextField,
  Label,
  Input,
  TextArea,
  Description,
  FieldError,
  Button,
} from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import { postReviews } from "@/lib/actions/postReviews";

// Dynamic import must live at module scope, not inside the component,
// otherwise a brand-new component gets created on every render (state loss,
// re-mount flicker, lost animations, etc).
const Rating = dynamic(
  () => import("react-simple-star-rating").then((mod) => mod.Rating),
  { ssr: false }
);

const MIN_COMMENT_LENGTH = 10;

// Props:
// - data: product object (uses data._id as productId)
// - onSubmit: async (reviewData) => void  (called with { productId, rating, title, comment, date })
export default function ReviewSection({ data, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState({ rating: "", comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const productId = data?._id;
  const { data: session, isPending } = authClient.useSession();
  const userName = session?.user?.name;
  const isLoggedIn = Boolean(session?.user);

  const handleRating = (rate) => {
    setRating(rate);
    if (rate > 0) setErrors((prev) => ({ ...prev, rating: "" }));
  };

  const resetForm = () => {
    setRating(0);
    setTitle("");
    setComment("");
  };

  const validate = () => {
    const nextErrors = { rating: "", comment: "" };
    let isValid = true;

    if (rating === 0) {
      nextErrors.rating = "Please select a star rating.";
      isValid = false;
    }

    if (comment.trim().length < MIN_COMMENT_LENGTH) {
      nextErrors.comment = `Review must be at least ${MIN_COMMENT_LENGTH} characters.`;
      isValid = false;
    }

    setErrors(nextErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productId) {
      console.error("ReviewSection: missing productId (data._id).");
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit?.({
        productId,
        userName,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        
      });
      setSubmitted(true);
      resetForm();
    } catch (err) {
      console.error("Failed to submit review:", err);
      setErrors((prev) => ({
        ...prev,
        comment: "Something went wrong submitting your review. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }

    const review = {
      productId,
      userName,
      rating,
      title,
      comment,
      date: new Date().toISOString(),
    }

   await postReviews(review);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col mt-5 gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Write a review</h3>
        <p className="text-sm text-gray-500">
          Share your experience with this product to help other buyers.
        </p>
      </div>

      {!isPending && !isLoggedIn && (
        <p className="text-sm font-medium text-amber-600">
          Please log in to submit a review.
        </p>
      )}

      {/* Star rating */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Your rating</span>
        <Rating
          onClick={handleRating}
          initialValue={rating}
          size={28}
          transition
          allowFraction
          SVGstyle={{ display: "inline-block" }}
        />
        {errors.rating && (
          <span className="text-sm text-red-600">{errors.rating}</span>
        )}
      </div>

      {/* Review title */}
      <TextField
        value={title}
        onChange={setTitle}
        isRequired
        className="flex flex-col gap-1"
      >
        <Label className="text-sm font-medium text-gray-700">Title</Label>
        <Input
          placeholder="Sum up your review in a few words"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
        />
        <FieldError className="text-sm text-red-600" />
      </TextField>

      {/* Review comment */}
      <TextField
        value={comment}
        onChange={setComment}
        isRequired
        isInvalid={Boolean(errors.comment)}
        className="flex flex-col gap-1"
      >
        <Label className="text-sm font-medium text-gray-700">Review</Label>
        <TextArea
          rows={4}
          placeholder="What did you like or dislike? How was the seller?"
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
        />
        <Description className="text-xs text-gray-400">
          Minimum {MIN_COMMENT_LENGTH} characters.
        </Description>
        {errors.comment ? (
          <span className="text-sm text-red-600">{errors.comment}</span>
        ) : (
          <FieldError className="text-sm text-red-600" />
        )}
      </TextField>

      {submitted && (
        <p className="text-sm font-medium text-green-600">
          Thanks — your review was submitted!
        </p>
      )}

      <Button
        type="submit"
        isDisabled={isSubmitting || isPending || !isLoggedIn}
        className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  );
}