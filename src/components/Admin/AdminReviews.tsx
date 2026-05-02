import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Trash2, MessageSquare, ExternalLink, RefreshCw, ThumbsUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  products: {
    name: string;
    images: string[];
  };
  user_profiles: {
    full_name: string;
    email: string;
  };
  admin_reply?: string;
  admin_replied_at?: string;
  admin_liked?: boolean;
}

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('product_reviews')
        .select(`
          *,
          products(name, images),
          user_profiles:user_id(full_name, email)
        `);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ status })
        .eq('id', reviewId);

      if (error) throw error;
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, status } : r));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const toggleAdminLike = async (review: Review) => {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ admin_liked: !review.admin_liked })
        .eq('id', review.id);

      if (error) throw error;
      setReviews(reviews.map(r => r.id === review.id ? { ...r, admin_liked: !review.admin_liked } : r));
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const submitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ 
          admin_reply: replyText,
          admin_replied_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) throw error;
      
      setReviews(reviews.map(r => r.id === reviewId ? { 
        ...r, 
        admin_reply: replyText, 
        admin_replied_at: new Date().toISOString() 
      } : r));
      
      setReplyingTo(null);
      setReplyText('');
    } catch (err) {
      alert('Failed to submit reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;

    try {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-mahogany">Product Reviews</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-rose-gold text-white'
                  : 'bg-white text-gray-600 hover:bg-rose-50 border border-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
          <button
            onClick={fetchReviews}
            className="p-2 text-gray-500 hover:text-rose-gold transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 animate-pulse h-32"></div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Product Info */}
                  <div className="flex items-center gap-4 lg:w-1/4">
                    <img
                      src={review.products.images[0]}
                      alt={review.products.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-mahogany text-sm truncate">{review.products.name}</h4>
                      <p className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        review.status === 'approved' ? 'bg-green-100 text-green-700' :
                        review.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {review.status}
                      </span>
                      {review.admin_liked && (
                        <span className="flex items-center gap-1 text-[10px] bg-rose-50 text-rose-gold px-2 py-0.5 rounded-full font-bold">
                          <ThumbsUp className="w-3 h-3 fill-current" />
                          Varsh Liked
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-2">
                      "{review.comment}"
                    </p>
                    
                    {review.images && review.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {review.images.map((img, idx) => (
                          <img 
                            key={idx} 
                            src={img} 
                            alt="Review" 
                            className="w-12 h-12 object-cover rounded border cursor-pointer hover:ring-2 hover:ring-rose-gold transition-all"
                            onClick={() => window.open(img, '_blank')}
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500 italic">
                        By: {review.user_profiles?.full_name} ({review.user_profiles?.email})
                      </p>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setReplyingTo(replyingTo === review.id ? null : review.id);
                            setReplyText(review.admin_reply || '');
                          }}
                          className="text-xs font-bold text-rose-gold hover:underline flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          {review.admin_reply ? 'Edit Reply' : 'Reply'}
                        </button>
                        
                        <button
                          onClick={() => toggleAdminLike(review)}
                          className={`text-xs font-bold flex items-center gap-1 ${review.admin_liked ? 'text-rose-gold' : 'text-gray-400 hover:text-rose-gold'}`}
                        >
                          <ThumbsUp className={`w-3 h-3 ${review.admin_liked ? 'fill-current' : ''}`} />
                          {review.admin_liked ? 'Liked' : 'Like'}
                        </button>
                      </div>
                    </div>

                    {/* Admin Reply Display */}
                    {review.admin_reply && replyingTo !== review.id && (
                      <div className="mt-4 bg-gray-50 p-3 rounded-lg border-l-4 border-rose-gold">
                        <p className="text-[10px] font-bold text-mahogany uppercase tracking-widest mb-1">
                          Varsh Ethnic Wears (Official Response)
                        </p>
                        <p className="text-sm text-gray-600 italic">"{review.admin_reply}"</p>
                      </div>
                    )}

                    {/* Reply Input */}
                    {replyingTo === review.id && (
                      <div className="mt-4 animate-fadeIn">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your official response..."
                          className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-gold focus:border-transparent outline-none"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="px-3 py-1 text-xs text-gray-500 font-bold hover:text-mahogany"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => submitReply(review.id)}
                            disabled={submittingReply}
                            className="bg-rose-gold text-white px-4 py-1 rounded text-xs font-bold hover:bg-opacity-90 disabled:opacity-50"
                          >
                            {submittingReply ? 'Sending...' : 'Post Official Reply'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center lg:flex-col justify-end gap-2 lg:w-32">
                    {review.status !== 'approved' && (
                      <button
                        onClick={() => updateStatus(review.id, 'approved')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="w-6 h-6" />
                      </button>
                    )}
                    {review.status !== 'rejected' && (
                      <button
                        onClick={() => updateStatus(review.id, 'rejected')}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-mahogany">No reviews found</h3>
          <p className="text-gray-500">There are no reviews matching the current filter.</p>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;