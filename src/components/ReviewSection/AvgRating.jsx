import { getAvgRating } from '@/lib/actions/getAvgRating';
import React from 'react';
import Stars from './Stars';


const AvgRating = async({data}) => {

    const productId = data._id
    const rating = await getAvgRating(productId)
   
    return (
        <div>
          <Stars rating={rating}></Stars>
        </div>
    );
};

export default AvgRating;