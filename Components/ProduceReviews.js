import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Form, Alert, Modal } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProduceReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const reviewSchema = Yup.object().shape({
    rating: Yup.number()
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must be at most 5')
      .required('Rating is required'),
    comment: Yup.string()
      .min(10, 'Comment must be at least 10 characters')
      .max(500, 'Comment must be less than 500 characters')
  });

  const fetchReviews = useCallback(async () => {
    try {
      const response = await api.get(`/api/reviews?product_id=${productId}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      if (editingReview) {
        await api.put(`/api/reviews/${editingReview.id}`, values);
      } else {
        await api.post('/api/reviews', { ...values, product_id: productId });
      }
      fetchReviews();
      setShowModal(false);
      setEditingReview(null);
      resetForm();
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving review');
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.delete(`/api/reviews/${reviewId}`);
        fetchReviews();
      } catch (error) {
        setError('Error deleting review');
      }
    }
  };

  const openEditModal = (review) => {
    setEditingReview(review);
    setShowModal(true);
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const userReview = reviews.find(r => r.user_id === user?.id);
  const canAddReview = user && user.user_type === 'buyer' && !userReview;

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Reviews ({reviews.length})</h5>
        {canAddReview && (
          <Button variant="outline-primary" onClick={() => setShowModal(true)}>
            Write Review
          </Button>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {reviews.length === 0 ? (
        <p className="text-muted">No reviews yet. Be the first to review!</p>
      ) : (
        reviews.map(review => (
          <Card key={review.id} className="mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <div className="text-warning mb-1">{renderStars(review.rating)}</div>
                  <h6>{review.username}</h6>
                  <p>{review.comment}</p>
                  <small className="text-muted">
                    {new Date(review.created_at).toLocaleDateString()}
                  </small>
                </div>
                {user?.id === review.user_id && (
                  <div>
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => openEditModal(review)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(review.id)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        ))
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingReview ? 'Edit Review' : 'Write Review'}</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            rating: editingReview?.rating || 5,
            comment: editingReview?.comment || ''
          }}
          validationSchema={reviewSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleSubmit, isSubmitting }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Rating</Form.Label>
                  <Field name="rating">
                    {({ field }) => (
                      <Form.Select {...field}>
                        <option value={5}>5 Stars - Excellent</option>
                        <option value={4}>4 Stars - Good</option>
                        <option value={3}>3 Stars - Average</option>
                        <option value={2}>2 Stars - Poor</option>
                        <option value={1}>1 Star - Terrible</option>
                      </Form.Select>
                    )}
                  </Field>
                  <ErrorMessage name="rating" component="div" className="text-danger" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Comment</Form.Label>
                  <Field name="comment">
                    {({ field }) => (
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Share your experience with this product..."
                        {...field}
                      />
                    )}
                  </Field>
                  <ErrorMessage name="comment" component="div" className="text-danger" />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Review'}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
};

export default ProduceReviews;
