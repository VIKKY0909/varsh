import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare, CheckCircle, AlertCircle, Trash2, X, Camera, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  images: string[];
  is_verified_purchase: boolean;
  created_at: string;
  user_profiles?: {
    full_name: string;
  };
  admin_reply?: string;
  admin_replied_at?: string;
  admin_liked?: boolean;
}

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [reviewImages, setReviewImages] = useState<string[]>([]);

  useEffect(() => {
    fetchReviews();
    if (user) {
      checkPurchaseStatus();
      checkUserReview();
    }
  }, [productId, user]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          user_profiles:user_id(full_name)
        `)
        .eq('product_id', productId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkPurchaseStatus = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.rpc('has_purchased_product', {
        p_user_id: user.id,
        p_product_id: productId
      });
      if (error) throw error;
      setIsVerified(!!data);
    } catch (err) {
      console.error('Error checking purchase status:', err);
    }
  };

  const checkUserReview = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setUserReview(data);
    } catch (err) {
      console.error('Error checking user review:', err);
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;
    
    setUploadingImages(true);
    setError(null);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${i}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('review-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('review-images')
          .getPublicUrl(fileName);
        
        newImages.push(publicUrl);
      }
      setReviewImages(prev => [...prev, ...newImages]);
    } catch (err) {
      setError('Failed to upload one or more images');
      console.error(err);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeReviewImage = (index: number) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('product_reviews')
        .upsert({
          product_id: productId,
          user_id: user.id,
          rating,
          comment,
          images: reviewImages,
          is_verified_purchase: isVerified,
          status: 'approved'
        });

      if (error) throw error;

      setSuccess(true);
      setShowForm(false);
      setComment('');
      setReviewImages([]);
      fetchReviews();
      checkUserReview();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete your review?')) return;

    try {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      fetchReviews();
      setUserReview(null);
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) return <div className="animate-pulse bg-gray-100 h-40 rounded-xl mt-8"></div>;

  return (
    <div className="mt-12 bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-mahogany flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-rose-gold" />
              Customer Reviews
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="ml-1 text-lg font-bold text-mahogany">{averageRating}</span>
                <span className="ml-1 text-sm text-gray-500">({reviews.length})</span>
              </div>
            </div>
          </div>

          {!userReview && user && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-rose-gold text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Review Form */}
        {showForm && (
          <div className="mb-10 bg-rose-50 rounded-xl p-6 border border-rose-100 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-mahogany">Share Your Experience</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-mahogany">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className={`p-1 transition-transform hover:scale-125 ${s <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      <Star className={`w-8 h-8 ${s <= rating ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <textarea
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like or dislike? How was the fit?"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-gold focus:border-transparent transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photos (Optional)</label>
                <div className="flex flex-wrap gap-4">
                  <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-rose-gold hover:bg-rose-50 transition-all">
                    <Camera className="w-6 h-6 text-gray-400" />
                    <span className="text-[10px] text-gray-500 mt-1">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      disabled={uploadingImages}
                    />
                  </label>
                  
                  {reviewImages.map((url, idx) => (
                    <div key={idx} className="relative w-20 h-20 group">
                      <img src={url} alt="Review" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => removeReviewImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {uploadingImages && (
                    <div className="w-20 h-20 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                      <RefreshCw className="w-5 h-5 text-rose-gold animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {isVerified && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  Verified Purchase Badge will be added
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-rose-gold text-white px-8 py-2 rounded-lg font-bold hover:bg-opacity-90 disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Posting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* User's Own Review */}
        {userReview && (
          <div className="mb-10 pb-8 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Your Review</h3>
              <button
                onClick={() => handleDelete(userReview.id)}
                className="text-red-400 hover:text-red-600 flex items-center gap-1 text-sm font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < userReview.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <p className="text-gray-700 italic">"{userReview.comment}"</p>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-8">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="pb-8 border-b border-gray-50 last:border-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-gold font-bold">
                      {(review.user_profiles?.full_name || 'U').charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-mahogany flex items-center gap-2 text-sm sm:text-base">
                        {review.user_profiles?.full_name || 'Anonymous'}
                        {review.is_verified_purchase && (
                          <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      {review.admin_liked && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-rose-gold font-bold bg-rose-50 px-2 py-0.5 rounded-full w-fit">
                          <ThumbsUp className="w-2.5 h-2.5 fill-current" />
                          Varsh Liked this
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base pl-12">
                  {review.comment}
                </p>

                {review.images && review.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 pl-12">
                    {review.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="User review"
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-gray-100 cursor-zoom-in hover:opacity-90 transition-opacity"
                        onClick={() => window.open(img, '_blank')}
                      />
                    ))}
                  </div>
                )}

                {/* Admin Reply */}
                {review.admin_reply && (
                  <div className="mt-6 ml-12 bg-gray-50 p-4 rounded-xl border-l-4 border-rose-gold relative animate-fadeIn">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-mahogany flex items-center justify-center text-[10px] text-white font-bold">
                        V
                      </div>
                      <span className="text-xs font-bold text-mahogany uppercase tracking-widest">
                        Varsh Ethnic Wears <span className="text-[10px] text-rose-gold ml-1">(Official)</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 italic leading-relaxed">
                      "{review.admin_reply}"
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">No reviews yet</h3>
              <p className="text-gray-400 text-sm">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;