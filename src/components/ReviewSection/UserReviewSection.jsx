'use client'

import { getUserReviews } from '@/lib/actions/getReviews';
import { Card, Avatar } from '@heroui/react';
import { Rating } from 'react-simple-star-rating';
import React, { useEffect, useState } from 'react';

const UserReviewSection = ({ data }) => {
    const productId = data?._id;

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!productId) return;

        const fetchReviews = async () => {
            try {
                setLoading(true);
                const res = await getUserReviews(productId);
                setReviews(res || []);
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [productId]);

    if (loading) {
        return (
            <div className="w-full py-8 text-center text-gray-500">
                Loading...
            </div>
        );
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className="w-full py-8 text-center text-gray-500">
                No review found!
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            <h2 className="text-xl font-semibold mb-4">User Reviews</h2>

            {reviews.map((item) => {
                const review = item?.review;

                return (
                    <Card key={item?._id?.$oid || item?._id}>
                        <Card.Header>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <Avatar.Fallback>
                                        {review?.userName?.charAt(0)?.toUpperCase() || 'U'}
                                    </Avatar.Fallback>
                                </Avatar>

                                <div className="flex flex-col">
                                    <Card.Title>{review?.userName || 'Anonymous'}</Card.Title>
                                    <Card.Description>
                                        {review?.date
                                            ? new Date(review.date).toLocaleDateString('en-US', {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric',
                                              })
                                            : ''}
                                    </Card.Description>
                                </div>
                            </div>
                        </Card.Header>

                        <Card.Content>
                            <div className="mb-2">
                                <Rating
                                    initialValue={review?.rating || 0}
                                    readonly
                                    size={20}
                                    SVGstyle={{ display: 'inline-block' }}
                                    allowFraction
                                />
                            </div>

                            {review?.title && (
                                <h3 className="font-medium text-sm mb-1">{review.title}</h3>
                            )}

                            <p className="text-sm text-gray-700">{review?.comment}</p>
                        </Card.Content>
                    </Card>
                );
            })}
        </div>
    );
};

export default UserReviewSection;